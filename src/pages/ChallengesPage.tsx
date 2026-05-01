import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, Unlock, Trophy, Layers, Filter } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast, Toaster } from 'sonner';
import confetti from 'canvas-confetti';
import type { Challenge, CTFUser, SubmissionResponse } from '@shared/types';
import { cn } from '@/lib/utils';
export function ChallengesPage() {
  const queryClient = useQueryClient();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [flag, setFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const savedUser = JSON.parse(localStorage.getItem('ctf_user') || '{}') as CTFUser;
  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: () => api<Challenge[]>('/api/challenges'),
  });
  const submitMutation = useMutation({
    mutationFn: (data: { challengeId: string; flag: string }) => 
      api<SubmissionResponse>('/api/challenges/submit', {
        method: 'POST',
        body: JSON.stringify({ userId: savedUser.id, ...data })
      }),
    onSuccess: (data) => {
      if (data.correct) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#F38020', '#FFFFFF'] });
        toast.success(data.message);
        // Update local storage score if needed, though refreshing user state is better
        const updated = { ...savedUser, score: data.newScore || savedUser.score, solvedChallenges: [...savedUser.solvedChallenges, selectedChallenge?.id || ''] };
        localStorage.setItem('ctf_user', JSON.stringify(updated));
        queryClient.invalidateQueries({ queryKey: ['challenges'] });
        setSelectedChallenge(null);
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Communication error with the mainframe."),
    onSettled: () => setIsSubmitting(false)
  });
  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim() || !selectedChallenge) return;
    setIsSubmitting(true);
    submitMutation.mutate({ challengeId: selectedChallenge.id, flag: flag.trim() });
  };
  if (isLoading) return <div className="flex items-center justify-center h-96 text-primary">Scanning the perimeter...</div>;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-black uppercase tracking-tight text-white mb-2 italic">The <span className="text-primary">Arena</span></h1>
          <p className="text-white/50">Breach the perimeters of the Cloudflare One ecosystem.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
          <Trophy className="size-6 text-primary" />
          <div className="font-mono">
            <div className="text-xs text-white/40 uppercase tracking-widest">Your Points</div>
            <div className="text-2xl font-bold text-white">{savedUser.score}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {challenges?.map((ch) => {
            const isSolved = savedUser.solvedChallenges?.includes(ch.id);
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
                  isSolved && "border-green-500/20"
                )}>
                  {isSolved && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex gap-1 items-center">
                        <CheckCircle2 className="size-3" /> Solved
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider text-[10px]">
                        {ch.category}
                      </Badge>
                      <div className="font-mono text-xl font-bold text-primary">{ch.points}</div>
                    </div>
                    <CardTitle className="text-xl text-white">{ch.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-white/40 text-sm line-clamp-3 mb-4">{ch.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => { setSelectedChallenge(ch); setFlag(''); }}
                      className={cn(
                        "w-full font-bold",
                        isSolved ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-primary text-white"
                      )}
                    >
                      {isSolved ? "View Brief" : "Enter Mission"}
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
               <Badge variant="outline" className="text-primary border-primary/20">{selectedChallenge?.category}</Badge>
               <span className="text-white/20 text-xs font-mono">MISSION ID: {selectedChallenge?.id}</span>
            </div>
            <DialogTitle className="text-3xl font-display uppercase italic tracking-tighter">{selectedChallenge?.title}</DialogTitle>
            <DialogDescription className="text-white/50 text-lg mt-4 leading-relaxed">
              {selectedChallenge?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 border-t border-white/5 mt-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-white/40 mb-4 flex items-center gap-2">
              <Unlock className="size-3" /> Submit Flag
            </h4>
            <form onSubmit={handleFlagSubmit} className="space-y-4">
              <Input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="CF{your_flag_here}"
                className="bg-white/5 border-white/10 h-14 text-lg font-mono tracking-widest text-primary focus:ring-primary"
                disabled={isSubmitting || savedUser.solvedChallenges?.includes(selectedChallenge?.id || '')}
              />
              <DialogFooter>
                {!savedUser.solvedChallenges?.includes(selectedChallenge?.id || '') && (
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white font-bold"
                    disabled={isSubmitting || !flag.trim()}
                  >
                    {isSubmitting ? "Decrypting..." : "Exfiltrate Data"}
                  </Button>
                )}
                {savedUser.solvedChallenges?.includes(selectedChallenge?.id || '') && (
                  <div className="w-full p-4 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20 text-center font-bold">
                    MISSION COMPLETE
                  </div>
                )}
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster richColors position="top-center" />
    </div>
  );
}