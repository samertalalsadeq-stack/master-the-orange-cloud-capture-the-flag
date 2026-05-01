import { Hono } from "hono";
import type { Env } from './core-utils';
import { CTFUserEntity, ChallengeEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { LeaderboardEntry, Challenge, CTFUser } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // SEED ON FIRST ACCESS
  app.use('/api/*', async (c, next) => {
    await ChallengeEntity.ensureSeed(c.env);
    await CTFUserEntity.ensureSeed(c.env);
    await next();
  });
  // AUTH: Login / Register
  app.post('/api/auth', async (c) => {
    const { username } = await c.req.json() as { username: string };
    if (!username || username.length < 3) return bad(c, "Invalid username");
    const { items: users } = await CTFUserEntity.list(c.env);
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      user = await CTFUserEntity.create(c.env, {
        id: crypto.randomUUID(),
        username,
        score: 0,
        solvedChallenges: [],
        isAdmin: username.toLowerCase().includes('admin'),
        joinedAt: Date.now()
      });
    }
    return ok(c, user);
  });
  // CHALLENGES: List (Flags stripped for players)
  app.get('/api/challenges', async (c) => {
    const { items: challenges } = await ChallengeEntity.list(c.env);
    const stripped = challenges
      .filter(ch => ch.isVisible)
      .map(({ flag, ...rest }) => rest);
    return ok(c, stripped);
  });
  // SUBMIT FLAG
  app.post('/api/challenges/submit', async (c) => {
    const { userId, challengeId, flag } = await c.req.json() as { userId: string; challengeId: string; flag: string };
    if (!userId || !challengeId || !flag) return bad(c, "Missing fields");
    const userEntity = new CTFUserEntity(c.env, userId);
    if (!await userEntity.exists()) return notFound(c, "User not found");
    const result = await userEntity.submitFlag(c.env, challengeId, flag);
    const updatedUser = await userEntity.getState();
    return ok(c, { ...result, newScore: updatedUser.score });
  });
  // LEADERBOARD
  app.get('/api/leaderboard', async (c) => {
    const { items: users } = await CTFUserEntity.list(c.env);
    const leaderboard: LeaderboardEntry[] = users
      .sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt)
      .map((u, idx) => ({
        username: u.username,
        score: u.score,
        solvedCount: u.solvedChallenges.length,
        rank: idx + 1
      }));
    return ok(c, leaderboard);
  });
  // --- ADMIN ROUTES ---
  // List all users
  app.get('/api/users', async (c) => {
    const { items } = await CTFUserEntity.list(c.env);
    return ok(c, items);
  });
  // Delete user
  app.delete('/api/admin/users/:id', async (c) => {
    const id = c.req.param('id');
    const success = await CTFUserEntity.delete(c.env, id);
    return ok(c, { success });
  });
  // List full challenges
  app.get('/api/admin/challenges', async (c) => {
    const { items } = await ChallengeEntity.list(c.env);
    return ok(c, items);
  });
  // Create challenge
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
  // Delete challenge
  app.delete('/api/admin/challenges/:id', async (c) => {
    const id = c.req.param('id');
    const success = await ChallengeEntity.delete(c.env, id);
    return ok(c, { success });
  });
  // Toggle Visibility
  app.post('/api/admin/challenges/:id/toggle', async (c) => {
    const id = c.req.param('id');
    const entity = new ChallengeEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    const state = await entity.mutate(s => ({ ...s, isVisible: !s.isVisible }));
    return ok(c, state);
  });
}