import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, ShieldAlert, Loader2, ArrowRight, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useUser } from '@/hooks/use-user';
import type { CTFUser } from '@shared/types';
export function HomePage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user, isPending } = useUser();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || formData.username.length < 3) return toast.error('Alias too short');
    if (!formData.email.includes('@')) return toast.error('Valid email required');
    if (formData.password.length < 6) return toast.error('Password too short');
    setIsLoading(true);
    try {
      const userData = await api<CTFUser>('/api/auth', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      login(userData);
      if (userData.isApproved || userData.isAdmin) {
        toast.success(`Welcome to the Orange Cloud, ${userData.username}`);
        navigate('/arena');
      } else {
        toast.info("Registration received. Awaiting administrative approval.");
      }
    } catch (error: any) {
      toast.error(error.message || 'Access denied by Cloudflare firewall');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(243,128,32,0.1),transparent_70%)] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
          <p className="text-white/50 text-lg max-w-md mx-auto font-mono">
            SECURE ACCESS GATEWAY PROTOTYPE v2.4
          </p>
        </div>
        {isAuthenticated && user ? (
          <Card className="glass border-primary/30 shadow-2xl bg-primary/5 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Active Session: {user.username}</CardTitle>
              {isPending ? (
                <CardDescription className="text-orange-400 animate-pulse font-mono font-bold uppercase text-xs">
                  Awaiting Security Clearance Approval
                </CardDescription>
              ) : (
                <CardDescription className="text-green-400 font-mono text-xs">Access Granted - Clear for Entry</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate('/arena')}
                disabled={isPending && !user.isAdmin}
                className="w-full h-14 bg-primary hover:bg-primary/80 text-white font-bold shadow-[0_0_25px_rgba(243,128,32,0.5)] group"
              >
                {isPending && !user.isAdmin ? "Access Locked" : "Enter Arena"} <ArrowRight className="ml-2 group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass border-white/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Terminal className="size-5 text-primary" /> Secure Onboarding
              </CardTitle>
              <CardDescription className="text-white/40">Credentials required for Cloudflare One access</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Alias"
                      className="bg-white/5 border-white/10 pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                      className="bg-white/5 border-white/10 pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Security Token"
                      className="bg-white/5 border-white/10 pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/80 text-white font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Initiate Connection"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}