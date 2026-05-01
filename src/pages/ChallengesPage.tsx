import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Unlock,
  Trophy,
  Shield,
  Zap,
  Globe,
  Lock,
  Loader2,
  Server,
  Fingerprint,
  Search,
  ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { NavBackButton } from '@/components/NavBackButton';
import confetti from 'canvas-confetti';
import type { Challenge, SubmissionResponse, ChallengeCategory } from '@shared/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
export function ChallengesPage() {
  const queryClient = useQueryClient();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [flag, setFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser, updateUser } = useUser();
  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: () => api<Challenge[]>('/api/challenges'),
  });
  const submitMutation = useMutation({
    mutationFn: (data: { challengeId: string; flag: string }) => {
      if (!currentUser?.id) throw new Error("No authenticated user session");
      return api<SubmissionResponse>('/api/challenges/submit', {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser.id, ...data })
      });
    },
    onSuccess: (data) => {
      if (data.correct && selectedChallenge && currentUser) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F38020', '#FAFAFA', '#1E1E1E']
        });
        toast.success(data.message);
        updateUser({
          ...currentUser,
          score: data.newScore ?? currentUser.score,
          solvedChallenges: [...new Set([...currentUser.solvedChallenges, selectedChallenge.id])]
        });
        queryClient.invalidateQueries({ queryKey: ['challenges'] });
        setSelectedChallenge(null);
        setFlag('');
      } else {
        toast.error(data.message || "Submission rejected");
      }
    },
    onError: (err: any) => toast.error(err.message || "Communication error with the mainframe."),
    onSettled: () => setIsSubmitting(false)
  });
  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim() || !selectedChallenge || isSubmitting) return;
    setIsSubmitting(true);
    submitMutation.mutate({ challengeId: selectedChallenge.id, flag: flag.trim() });
  };
  const getCategoryIcon = (cat: ChallengeCategory) => {
    switch (cat) {
      case 'ZTNA': return <Shield className="size-3" />;
      case 'SWG': return <Globe className="size-3" />;
      case 'WAAP': return <Zap className="size-3" />;
      case 'Network': return <Server className="size-3" />;
      case 'Identity': return <Fingerprint className="size-3" />;
      case 'CASB': return <Search className="size-3" />;
      case 'DLP': return <ShieldCheck className="size-3" />;
      default: return <Lock className="size-3" />;
    }
  };
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <Loader2 className="size-12 text-primary animate-spin" />
      <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Scanning Sectors...</p>
    </div>
  );
  if (!currentUser) return <div className="flex items-center justify-center h-96 text-destructive font-mono">UNAUTHORIZED: SESSION EXPIRED</div>;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-6">
        <NavBackButton />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tight text-white mb-2 italic">The <span className="text-primary">Arena</span></h1>
            <p className="text-white/50">Learn how to master Cloudflare One.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(243,128,32,0.1)]">
            <Trophy className="size-6 text-primary" />
            <div className="font-mono">
              <div className="text-xs text-white/40 uppercase tracking-widest">Global Score</div>
              <div className="text-2xl font-bold text-white">{currentUser.score} <span className="text-sm text-white/40 ml-1">PTS</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {challenges?.map((ch) => {
            const isSolved = currentUser.solvedChallenges.includes(ch.id);
            return (
              <motion.div
                key={ch.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
              >
                <Card className={cn(
                  "h-full flex flex-col border-white/10 transition-all card-glow bg-card relative overflow-hidden",
                  isSolved && "border-green-500/30 bg-green-500/[0.02]"
                )}>
                  {isSolved && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex gap-1 items-center font-mono">
                        <CheckCircle2 className="size-3" /> SOLVED
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider text-[10px] flex gap-1 items-center">
                        {getCategoryIcon(ch.category)} {ch.category}
                      </Badge>
                      <div className="font-mono text-xl font-bold text-primary">{ch.points}</div>
                    </div>
                    <CardTitle className="text-xl text-white font-bold leading-tight">{ch.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-white/40 text-sm line-clamp-3 mb-4 leading-relaxed">{ch.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => { setSelectedChallenge(ch); setFlag(''); }}
                      className={cn(
                        "w-full font-bold transition-all h-11",
                        isSolved
                          ? "bg-white/5 text-white/40 hover:bg-white/10 border border-white/5"
                          : "bg-primary text-white shadow-[0_0_15px_rgba(243,128,32,0.4)] hover:shadow-[0_0_25px_rgba(243,128,32,0.6)]"
                      )}
                    >
                      {isSolved ? "MISSION ARCHIVE" : "INITIATE MISSION"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <Dialog open={!!selectedChallenge} onOpenChange={(open) => !open && setSelectedChallenge(null)}>
        <DialogContent className="bg-card border-white/10 text-white max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
               <Badge variant="outline" className="text-primary border-primary/20 flex items-center gap-1">
                 {selectedChallenge && getCategoryIcon(selectedChallenge.category)}
                 {selectedChallenge?.category}
               </Badge>
               <span className="text-white/20 text-xs font-mono">CODE: {selectedChallenge?.id}</span>
            </div>
            <DialogTitle className="text-3xl font-display uppercase italic tracking-tighter">{selectedChallenge?.title}</DialogTitle>
            <DialogDescription className="text-white/80 text-lg mt-4 leading-loose font-sans font-medium">
              {selectedChallenge?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 border-t border-white/5 mt-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white/40 mb-4 flex items-center gap-2">
              <Unlock className="size-3 text-primary" /> SUBMIT DECRYPTION FLAG
            </h4>
            <form onSubmit={handleFlagSubmit} className="space-y-4">
              <Input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="CF{...}"
                className="bg-white/5 border-white/10 h-14 text-lg font-mono tracking-widest text-primary focus:ring-primary placeholder:text-white/10"
                disabled={isSubmitting || (selectedChallenge && currentUser.solvedChallenges.includes(selectedChallenge.id))}
                autoFocus
              />
              <DialogFooter>
                {selectedChallenge && !currentUser.solvedChallenges.includes(selectedChallenge.id) ? (
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white font-bold"
                    disabled={isSubmitting || !flag.trim()}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "EXFILTRATE FLAG"}
                  </Button>
                ) : (
                  <div className="w-full p-4 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20 text-center font-bold font-mono tracking-widest">
                    MISSION COMPLETE: DATA SECURED
                  </div>
                )}
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}