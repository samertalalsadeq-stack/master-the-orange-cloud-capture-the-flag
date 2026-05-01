import { Hono } from "hono";
import type { Env } from './core-utils';
import { CTFUserEntity, ChallengeEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { LeaderboardEntry, Challenge, CTFUser } from "@shared/types";
async function hashPassword(password: string, saltStr?: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = saltStr ? encoder.encode(saltStr) : crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits", "deriveKey"]);
  const derivedKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const exported = await crypto.subtle.exportKey("raw", derivedKey);
  const hashHex = Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const reHash = await hashPassword(password, saltHex);
  return reHash === stored;
}
function stripSensitive(user: CTFUser) {
  const { passwordHash, ...safe } = user;
  return safe;
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.use('/api/*', async (c, next) => {
    await ChallengeEntity.ensureSeed(c.env);
    await CTFUserEntity.ensureSeed(c.env);
    await next();
  });
  const adminGuard = async (c: any, next: any) => {
    const userId = c.req.header('X-User-ID');
    if (!userId) return bad(c, "Authentication required");
    const userEntity = new CTFUserEntity(c.env, userId);
    if (!await userEntity.exists()) return bad(c, "Invalid user");
    const user = await userEntity.getState();
    if (!user.isAdmin) return bad(c, "Forbidden: Administrative access required");
    await next();
  };
  app.post('/api/auth', async (c) => {
    const { username, email, password } = await c.req.json() as { username: string; email: string; password?: string };
    if (!username || username.length < 3) return bad(c, "Invalid username");
    if (!email || !email.includes('@')) return bad(c, "Invalid email address");
    if (!password || password.length < 6) return bad(c, "Password must be at least 6 characters");
    const { items: users } = await CTFUserEntity.list(c.env);
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) return bad(c, "Invalid credentials");
      return ok(c, stripSensitive(user));
    }
    const isAdmin = username.toLowerCase().includes('admin') || email.toLowerCase().includes('admin');
    const hash = await hashPassword(password);
    const newUser = await CTFUserEntity.create(c.env, {
      id: crypto.randomUUID(),
      username,
      email,
      score: 0,
      solvedChallenges: [],
      isAdmin,
      isApproved: isAdmin,
      passwordHash: hash,
      joinedAt: Date.now()
    });
    console.log(`[EMAIL SIMULATION] To: samer@cloudflare.com | Subject: New Operative Registration | Body: User ${username} (${email}) has registered and is awaiting approval.`);
    return ok(c, stripSensitive(newUser));
  });
  app.get('/api/challenges', async (c) => {
    const { items: challenges } = await ChallengeEntity.list(c.env);
    const stripped = challenges
      .filter(ch => ch.isVisible)
      .map(({ flag, ...rest }) => rest);
    return ok(c, stripped);
  });
  app.post('/api/challenges/submit', async (c) => {
    const { userId, challengeId, flag } = await c.req.json() as { userId: string; challengeId: string; flag: string };
    const userEntity = new CTFUserEntity(c.env, userId);
    if (!await userEntity.exists()) return notFound(c, "User not found");
    const result = await userEntity.submitFlag(c.env, challengeId, flag);
    const updatedUser = await userEntity.getState();
    return ok(c, { ...result, newScore: updatedUser.score });
  });
  app.get('/api/leaderboard', async (c) => {
    const { items: users } = await CTFUserEntity.list(c.env);
    const leaderboard: LeaderboardEntry[] = users
      .filter(u => u.isApproved || u.isAdmin)
      .sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt)
      .map((u, idx) => ({
        username: u.username,
        score: u.score,
        solvedCount: u.solvedChallenges.length,
        rank: idx + 1
      }));
    return ok(c, leaderboard);
  });
  app.get('/api/leaderboard/stats', async (c) => {
    const { items: users } = await CTFUserEntity.list(c.env);
    const { items: challenges } = await ChallengeEntity.list(c.env);
    const catMap: Record<string, number> = {};
    const challengeMap = new Map(challenges.map(ch => [ch.id, ch]));
    users.forEach(u => {
      u.solvedChallenges.forEach(sid => {
        const ch = challengeMap.get(sid);
        if (ch) catMap[ch.category] = (catMap[ch.category] || 0) + 1;
      });
    });
    const categories = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    const topScores = users
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(u => ({ name: u.username, score: u.score }));
    return ok(c, { categories, topScores });
  });
  app.use('/api/admin/*', adminGuard);
  app.get('/api/admin/users', async (c) => {
    const { items } = await CTFUserEntity.list(c.env);
    return ok(c, items.map(stripSensitive));
  });
  app.put('/api/admin/users/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    const userEntity = new CTFUserEntity(c.env, id);
    if (!await userEntity.exists()) return notFound(c);
    const updated = await userEntity.mutate(s => ({ ...s, ...data, id: s.id }));
    return ok(c, stripSensitive(updated));
  });
  app.post('/api/admin/users/reset/:id', async (c) => {
    const id = c.req.param('id');
    const userEntity = new CTFUserEntity(c.env, id);
    if (!await userEntity.exists()) return notFound(c);
    const updated = await userEntity.mutate(s => ({ ...s, score: 0, solvedChallenges: [] }));
    return ok(c, stripSensitive(updated));
  });
  app.delete('/api/admin/users/:id', async (c) => {
    const id = c.req.param('id');
    const success = await CTFUserEntity.delete(c.env, id);
    return ok(c, { success });
  });
  app.get('/api/admin/challenges', async (c) => {
    const { items } = await ChallengeEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/admin/challenges', async (c) => {
    const data = await c.req.json() as Partial<Challenge>;
    if (!data.title || !data.flag) return bad(c, "Title and flag required");
    const challenge = await ChallengeEntity.create(c.env, {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || '',
      points: data.points || 100,
      flag: data.flag,
      category: data.category || 'ZTNA',
      isVisible: data.isVisible ?? true
    });
    return ok(c, challenge);
  });
  app.put('/api/admin/challenges/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json() as Partial<Challenge>;
    const entity = new ChallengeEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    const updated = await entity.mutate(s => ({ ...s, ...data, id: s.id }));
    return ok(c, updated);
  });
  app.delete('/api/admin/challenges/:id', async (c) => {
    const id = c.req.param('id');
    const success = await ChallengeEntity.delete(c.env, id);
    return ok(c, { success });
  });
}