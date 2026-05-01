import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api-client';
import { useUser } from '@/hooks/use-user';
import type { CTFUser } from '@shared/types';
export function HomePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useUser();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      toast.error('Alias must be at least 3 characters');
      return;
    }
    setIsLoading(true);
    try {
      const userData = await api<CTFUser>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ username: trimmed })
      });
      login(userData);
      toast.success(`Welcome to the Orange Cloud, ${userData.username}`);
      navigate('/arena');
    } catch (error: any) {
      toast.error(error.message || 'Access denied by Cloudflare firewall');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(243,128,32,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
            className="inline-block p-4 rounded-3xl bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_30px_rgba(243,128,32,0.2)]"
          >
            <ShieldAlert className="size-12 text-primary" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter mb-4 text-white uppercase italic">
            Master the <span className="text-primary italic">Orange Cloud</span>
          </h1>
          <p className="text-white/50 text-lg max-w-md mx-auto">
            Cloudflare One Capture The Flag. Prove your Zero Trust expertise.
          </p>
        </div>
        {isAuthenticated && user ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <Card className="glass border-primary/30 shadow-2xl overflow-hidden bg-primary/5 backdrop-blur-md">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-bold flex items-center justify-center gap-2 text-white">
                  Active Session Detected
                </CardTitle>
                <CardDescription className="text-white/60">Welcome back, <span className="text-primary font-mono">{user.username}</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <Button
                  onClick={() => navigate('/arena')}
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/80 text-white shadow-[0_0_25px_rgba(243,128,32,0.5)] transition-all group"
                >
                  Return to Arena <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="text-center">
                  <button 
                    onClick={() => {
                      // Allow re-login by clearing current state if they want a different alias
                      // but keeping it simple for UX: just a logout button
                    }}
                    className="text-white/30 hover:text-white/60 text-xs font-mono uppercase tracking-widest transition-colors"
                  >
                    Not {user.username}? Click Sidebar to Sign Out
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="glass border-white/10 shadow-2xl overflow-hidden bg-card/80 backdrop-blur-sm">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Terminal className="size-5 text-primary" />
                Identify Yourself
              </CardTitle>
              <CardDescription className="text-white/40">Enter your hacker alias to begin the challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Hacker Alias"
                    className="bg-white/5 border-white/10 text-white h-12 text-lg focus:ring-primary/50 focus:border-primary"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/80 text-white shadow-[0_0_20px_rgba(243,128,32,0.4)] transition-all"
                  disabled={isLoading || !username.trim()}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" /> Authenticating...
                    </span>
                  ) : "Enter The Arena"}
                </Button>
              </form>
              <div className="mt-6 flex items-center justify-center gap-2 text-white/20 text-xs font-mono uppercase tracking-widest">
                <Sparkles className="size-3" />
                Powered by Cloudflare Durable Objects
                <Sparkles className="size-3" />
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
      <Toaster richColors position="top-center" />
    </div>
  );
}