import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Crown, BarChart3, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import type { LeaderboardEntry } from '@shared/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { NavBackButton } from '@/components/NavBackButton';
export function LeaderboardPage() {
  const { user: currentUser } = useUser();
  const { data: leaderboard, isLoading: leadLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => api<LeaderboardEntry[]>('/api/leaderboard'),
    refetchInterval: 15000
  });
  const { data: stats, isLoading: statsLoading } = useQuery<{ categories: { name: string, value: number }[], topScores: { name: string, score: number }[] }>({
    queryKey: ['leaderboard-stats'],
    queryFn: () => api<any>('/api/leaderboard/stats'),
    refetchInterval: 60000
  });
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="size-6 text-yellow-400" />;
      case 2: return <Medal className="size-6 text-gray-400" />;
      case 3: return <Medal className="size-6 text-amber-600" />;
      default: return <span className="font-mono text-white/40">{rank}</span>;
    }
  };
  const ORANGE_PALETTE = ['#F38020', '#fa9d52', '#fcb884', '#ffd3b5', '#ffebe0'];
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="relative text-center space-y-4">
        <div className="absolute right-0 top-0">
          <NavBackButton />
        </div>
        <h1 className="text-5xl font-display font-black uppercase italic tracking-tight text-white">
          <span className="text-primary">Hall</span> of Fame
        </h1>
        <p className="text-white/40 text-lg max-w-2xl mx-auto">
          The elite of the Orange Cloud. Only the fastest and most precise hackers make it to the top.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-card border-white/10 shadow-xl overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-white/5">
              <BarChart3 className="size-5 text-primary" />
              <CardTitle className="text-lg font-bold text-white uppercase tracking-wider font-mono">Top Hackers</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-6">
              {statsLoading ? (
                <div className="h-full flex flex-col gap-4">
                  <div className="flex items-end gap-2 h-full px-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="flex-1 bg-white/5" style={{ height: `${20 * i}%` }} />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-full bg-white/5" />
                </div>
              ) : stats?.topScores ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topScores}>
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
                      itemStyle={{ color: '#F38020' }}
                      cursor={{ fill: 'rgba(243, 128, 32, 0.1)' }}
                    />
                    <Bar dataKey="score" fill="#F38020" radius={[4, 4, 0, 0]}>
                      {stats.topScores.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={ORANGE_PALETTE[index % ORANGE_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/20 font-mono text-sm">NO DATA DETECTED</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-card border-white/10 shadow-xl overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-white/5">
              <PieChartIcon className="size-5 text-primary" />
              <CardTitle className="text-lg font-bold text-white uppercase tracking-wider font-mono">Mission Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-6 flex items-center justify-center">
              {statsLoading ? (
                <div className="relative size-48 rounded-full border-8 border-white/5 border-t-primary/20 animate-spin" />
              ) : stats?.categories && stats.categories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.categories.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={ORANGE_PALETTE[index % ORANGE_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
                      itemStyle={{ color: '#F38020' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/20 font-mono text-sm">CALCULATING ANALYTICS...</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
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
              {leadLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="size-8 text-primary animate-spin" />
                      <p className="text-white/20 italic font-mono">Decrypting rank data...</p>
                    </div>
                  </TableCell>
                </TableRow>
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
                      <TableCell className="py-4 px-6 text-center">
                        {getRankIcon(entry.rank)}
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