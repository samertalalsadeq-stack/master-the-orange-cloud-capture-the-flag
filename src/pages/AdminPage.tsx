import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Plus, Trash2, Users, Database } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type { Challenge, CTFUser } from '@shared/types';
export function AdminPage() {
  const queryClient = useQueryClient();
  const savedUser = JSON.parse(localStorage.getItem('ctf_user') || '{}') as CTFUser;
  // For MVP UI protection
  if (!savedUser.isAdmin && savedUser.username !== 'orange_admin') {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Shield className="size-16 text-destructive mb-4" />
        <h2 className="text-3xl font-display font-bold uppercase tracking-tighter">Access Denied</h2>
        <p className="text-white/40 max-w-sm mt-2">Your credentials do not have the required clearance for the Command Center.</p>
        <Button onClick={() => window.history.back()} className="mt-6" variant="outline">Retreat</Button>
      </div>
    );
  }
  const { data: challenges, isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ['admin-challenges'],
    queryFn: () => api<Challenge[]>('/api/admin/challenges')
  });
  const { data: users, isLoading: usersLoading } = useQuery<{ items: CTFUser[] }>({
    queryKey: ['admin-users'],
    queryFn: () => api<{ items: CTFUser[] }>('/api/users')
  });
  const toggleMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/challenges/${id}/toggle`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success("Visibility toggled");
    }
  });
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-black uppercase italic tracking-tight text-white">Command <span className="text-primary">Center</span></h1>
          <p className="text-white/40">Oversee the CTF operations and maintain visual integrity.</p>
        </div>
      </div>
      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
          <TabsTrigger value="challenges" className="data-[state=active]:bg-primary flex gap-2"><Database className="size-4" /> Challenges</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary flex gap-2"><Users className="size-4" /> Players</TabsTrigger>
        </TabsList>
        <TabsContent value="challenges" className="space-y-4">
          <Card className="bg-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mission Database</CardTitle>
                <CardDescription>Manage challenge parameters and visibility.</CardDescription>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/80"><Plus className="size-4 mr-1" /> New Mission</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead>Title</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Flag (Secret)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenges?.map((ch) => (
                    <TableRow key={ch.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-white">{ch.title}</TableCell>
                      <TableCell className="font-mono text-primary">{ch.points}</TableCell>
                      <TableCell className="font-mono text-xs text-white/30">{ch.flag}</TableCell>
                      <TableCell>
                        <Badge className={ch.isVisible ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-white/5 text-white/30"}>
                          {ch.isVisible ? "Visible" : "Hidden"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleMutation.mutate(ch.id)}
                          className="hover:bg-primary/20 text-primary"
                        >
                          {ch.isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-destructive/20 text-destructive"><Trash2 className="size-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle>Operative Personnel</CardTitle>
              <CardDescription>Monitor participant scores and progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead>Username</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Missions Solved</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.items.map((u) => (
                    <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-white">{u.username}</TableCell>
                      <TableCell className="font-mono text-primary text-lg">{u.score}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.solvedChallenges.map(cid => (
                            <Badge key={cid} variant="outline" className="text-[10px] border-white/10">{cid}</Badge>
                          ))}
                          {u.solvedChallenges.length === 0 && <span className="text-white/20 italic text-sm">None</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="hover:bg-destructive/20 text-destructive"><Trash2 className="size-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}