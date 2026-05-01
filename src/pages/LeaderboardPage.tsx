import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Crown, Target } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry, CTFUser } from '@shared/types';
import { cn } from '@/lib/utils';
export function LeaderboardPage() {
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('ctf_user');
      return stored ? (JSON.parse(stored) as CTFUser) : null;
    } catch (e) {
      return null;
    }
  }, []);
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => api<LeaderboardEntry[]>('/api/leaderboard'),
    refetchInterval: 15000 // Faster refresh for live competition feel
  });
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="size-6 text-yellow-400" />;
      case 2: return <Medal className="size-6 text-gray-400" />;
      case 3: return <Medal className="size-6 text-amber-600" />;
      default: return <span className="font-mono text-white/40">{rank}</span>;
    }
  };
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display font-black uppercase italic tracking-tight text-white">
          <span className="text-primary">Hall</span> of Fame
        </h1>
        <p className="text-white/40 text-lg max-w-2xl mx-auto">
          The elite of the Orange Cloud. Only the fastest and most precise hackers make it to the top.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {leaderboard?.slice(0, 3).map((entry, idx) => (
          <Card key={entry.username} className={cn(
            "bg-card border-white/10 relative overflow-hidden transition-all hover:scale-105",
            idx === 0 ? "border-primary/50 shadow-[0_0_30px_rgba(243,128,32,0.2)] order-1 md:order-2 animate-pulse-subtle" : idx === 1 ? "order-2 md:order-1" : "order-3"
          )}>
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 p-4 rounded-full bg-white/5 border border-white/10">
                {getRankIcon(entry.rank)}
              </div>
              <CardTitle className="text-2xl text-white font-display truncate">{entry.username}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary font-mono">{entry.score}</div>
              <div className="flex justify-center gap-4 text-white/40 text-sm">
                <span className="flex items-center gap-1"><Target className="size-4" /> {entry.solvedCount} Solved</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-card border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-[100px] text-white/40 uppercase tracking-widest text-xs font-bold px-6">Rank</TableHead>
                <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6">Infiltrator</TableHead>
                <TableHead className="text-right text-white/40 uppercase tracking-widest text-xs font-bold px-6">Score</TableHead>
                <TableHead className="text-right text-white/40 uppercase tracking-widest text-xs font-bold px-6">Solves</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12 text-white/20 italic">Decrypting rank data...</TableCell></TableRow>
              ) : leaderboard?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12 text-white/20 italic">No infiltrators detected.</TableCell></TableRow>
              ) : (
                leaderboard?.map((entry) => {
                  const isMe = entry.username === currentUser?.username;
                  return (
                    <TableRow
                      key={entry.username}
                      className={cn(
                        "border-white/5 hover:bg-white/5 group transition-colors",
                        isMe && "bg-primary/10 hover:bg-primary/20"
                      )}
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          {getRankIcon(entry.rank)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 border border-white/10">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className={cn(
                            "font-bold text-lg",
                            isMe ? "text-primary" : "text-white/80"
                          )}>{entry.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <span className="font-mono text-xl font-bold text-white group-hover:text-primary transition-colors">{entry.score}</span>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Badge variant="outline" className="font-mono text-white/40 border-white/10">{entry.solvedCount}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}