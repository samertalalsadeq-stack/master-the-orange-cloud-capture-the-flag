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
        // Cloudflare-themed confetti: Orange, White, Dark Grey
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F38020', '#FAFAFA', '#1E1E1E', '#fa9d52'],
          ticks: 300,
          gravity: 1.2,
          scalar: 1.2
        });
        toast.success(data.message);
        // Atomic local update to prevent UI lag/desync
        const updatedSolved = Array.from(new Set([...currentUser.solvedChallenges, selectedChallenge.id]));
        updateUser({
          ...currentUser,
          score: data.newScore ?? (currentUser.score + selectedChallenge.points),
          solvedChallenges: updatedSolved
        });
        queryClient.invalidateQueries({ queryKey: ['challenges'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        setSelectedChallenge(null);
        setFlag('');
      } else {
        toast.error(data.message || "Flag rejected by security gateway.");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Communication error with the mainframe.");
    },
    onSettled: () => setIsSubmitting(false)
  });
  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim() || !selectedChallenge || isSubmitting) return;
    const isSolved = currentUser?.solvedChallenges.includes(selectedChallenge.id);
    if (isSolved) {
      toast.info("Data already exfiltrated for this mission.");
      return;
    }
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
      <p className="text-primary font-mono animate-pulse uppercase tracking-widest text-sm">Scanning Sectors...</p>
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
            <p className="text-white/50 font-medium">Harness the power of Cloudflare One. Solve missions to gain authority.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(243,128,32,0.1)]">
            <Trophy className="size-6 text-primary" />
            <div className="font-mono">
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Infiltrator Score</div>
              <div className="text-2xl font-bold text-white leading-none mt-1">
                {currentUser.score} <span className="text-xs text-white/30 ml-1">PTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {challenges?.map((ch) => {
            const isSolved = currentUser.solvedChallenges.includes(ch.id);
            return (
              <motion.div
                key={ch.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn(
                  "h-full flex flex-col border-white/10 transition-all card-glow bg-card relative overflow-hidden",
                  isSolved && "border-primary/40 bg-primary/[0.03]"
                )}>
                  {isSolved && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-primary/20 text-primary border-primary/30 flex gap-1 items-center font-mono text-[10px] py-0.5">
                        <CheckCircle2 className="size-3" /> SECURED
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider text-[10px] flex gap-1.5 items-center px-2 py-0.5">
                        {getCategoryIcon(ch.category)} {ch.category}
                      </Badge>
                      <div className="font-mono text-xl font-bold text-primary tabular-nums">{ch.points}</div>
                    </div>
                    <CardTitle className="text-xl text-white font-bold leading-tight group-hover:text-primary transition-colors">{ch.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-white/50 text-sm line-clamp-3 mb-4 leading-relaxed">{ch.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      onClick={() => { setSelectedChallenge(ch); setFlag(''); }}
                      className={cn(
                        "w-full font-bold transition-all h-11 uppercase tracking-widest text-xs",
                        isSolved
                          ? "bg-white/5 text-white/40 hover:bg-white/10 border border-white/5"
                          : "bg-primary text-white shadow-[0_0_15px_rgba(243,128,32,0.3)] hover:shadow-[0_0_25px_rgba(243,128,32,0.5)]"
                      )}
                    >
                      {isSolved ? "View Intelligence" : "Initiate Mission"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <Dialog open={!!selectedChallenge} onOpenChange={(open) => !open && setSelectedChallenge(null)}>
        <DialogContent className="bg-card border-white/10 text-white max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 shadow-2xl">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2 mb-3">
               <Badge variant="outline" className="text-primary border-primary/20 flex items-center gap-1.5 px-2 py-0.5 uppercase text-[10px]">
                 {selectedChallenge && getCategoryIcon(selectedChallenge.category)}
                 {selectedChallenge?.category}
               </Badge>
               <span className="text-white/20 text-[10px] font-mono tracking-tighter uppercase">ID: {selectedChallenge?.id}</span>
            </div>
            <DialogTitle className="text-3xl font-display font-black uppercase italic tracking-tighter leading-none mb-4">
              {selectedChallenge?.title}
            </DialogTitle>
            <DialogDescription className="text-white/70 text-lg leading-relaxed font-sans mt-4">
              {selectedChallenge?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 border-t border-white/5 mt-6">
            {selectedChallenge && !currentUser.solvedChallenges.includes(selectedChallenge.id) ? (
              <div className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 flex items-center gap-2">
                  <Unlock className="size-3 text-primary" /> Decryption Gateway
                </h4>
                <form onSubmit={handleFlagSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      placeholder="CF{FLAG_STRING}"
                      className="bg-white/5 border-white/10 h-14 text-xl font-mono tracking-[0.15em] text-primary focus:ring-primary placeholder:text-white/5 uppercase"
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <Button
                      type="submit"
                      className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-tighter shadow-primary group"
                      disabled={isSubmitting || !flag.trim()}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin size-5" /> : (
                        <>EXFILTRATE DATA <Unlock className="ml-2 size-5 group-hover:rotate-12 transition-transform" /></>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full py-8 bg-primary/10 rounded-xl text-primary border border-primary/20 flex flex-col items-center justify-center gap-3 animate-scale-in">
                  <CheckCircle2 className="size-12 animate-bounce" />
                  <div className="text-center">
                    <div className="text-xl font-black uppercase italic tracking-tighter">Mission Accomplished</div>
                    <div className="text-xs font-mono text-primary/60 uppercase tracking-widest mt-1">Intelligence Secured in Registry</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedChallenge(null)}
                  className="w-full text-white/40 hover:text-white hover:bg-white/5"
                >
                  Return to Arena
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}