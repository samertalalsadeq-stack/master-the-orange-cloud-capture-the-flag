import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Crown, Target, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
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
    refetchInterval: 15000
  });
  const { data: stats } = useQuery<{ categories: { name: string, value: number }[], topScores: { name: string, score: number }[] }>({
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
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display font-black uppercase italic tracking-tight text-white">
          <span className="text-primary">Hall</span> of Fame
        </h1>
        <p className="text-white/40 text-lg max-w-2xl mx-auto">
          The elite of the Orange Cloud. Only the fastest and most precise hackers make it to the top.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-white/10 shadow-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-white/5">
            <BarChart3 className="size-5 text-primary" />
            <CardTitle className="text-lg font-bold text-white uppercase tracking-wider font-mono">Top Hackers</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topScores}>
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
                  itemStyle={{ color: '#F38020' }}
                  cursor={{ fill: 'rgba(243, 128, 32, 0.1)' }}
                />
                <Bar dataKey="score" fill="#F38020" radius={[4, 4, 0, 0]}>
                  {stats?.topScores.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={ORANGE_PALETTE[index % ORANGE_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-white/5">
            <PieChartIcon className="size-5 text-primary" />
            <CardTitle className="text-lg font-bold text-white uppercase tracking-wider font-mono">Mission Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.categories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={ORANGE_PALETTE[index % ORANGE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
                  itemStyle={{ color: '#F38020' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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