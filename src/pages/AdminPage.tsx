import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Eye, EyeOff, Plus, Trash2, Users, Database, Pencil } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type { Challenge, CTFUser, ChallengeCategory } from '@shared/types';
export function AdminPage() {
  const queryClient = useQueryClient();
  const savedUser = JSON.parse(localStorage.getItem('ctf_user') || '{}') as CTFUser;
  const isAdmin = savedUser.isAdmin || savedUser.username === 'orange_admin';
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Partial<Challenge> | null>(null);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    points: 100,
    category: 'ZTNA',
    flag: '',
    isVisible: true
  });
  const { data: challenges, isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ['admin-challenges'],
    queryFn: () => api<Challenge[]>('/api/admin/challenges'),
    enabled: isAdmin
  });
  const { data: users, isLoading: usersLoading } = useQuery<CTFUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => api<CTFUser[]>('/api/users'),
    enabled: isAdmin
  });
  const createMutation = useMutation({
    mutationFn: (data: Partial<Challenge>) => api('/api/admin/challenges', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success("Mission deployed to the grid");
      setIsCreateOpen(false);
      setNewChallenge({ title: '', description: '', points: 100, category: 'ZTNA', flag: '', isVisible: true });
    }
  });
  const editMutation = useMutation({
    mutationFn: (data: Partial<Challenge>) => api(`/api/admin/challenges/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success("Mission records updated");
      setIsEditOpen(false);
      setEditingChallenge(null);
    }
  });
  const toggleMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/challenges/${id}/toggle`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success("Visibility updated");
    }
  });
  const deleteChallengeMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/challenges/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success("Mission scrubbed from records");
    }
  });
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("Operative decommissioned");
    }
  });
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Shield className="size-16 text-destructive mb-4" />
        <h2 className="text-3xl font-display font-bold uppercase tracking-tighter">Access Denied</h2>
        <p className="text-white/40 max-w-sm mt-2">Your credentials do not have the required clearance for the Command Center.</p>
        <Button onClick={() => window.history.back()} className="mt-6" variant="outline">Retreat</Button>
      </div>
    );
  }
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
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/80"><Plus className="size-4 mr-1" /> New Mission</Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-display uppercase italic">Draft New Mission</DialogTitle>
                    <DialogDescription className="text-white/40">Initialize a new challenge in the arena.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Title</label>
                      <Input
                        value={newChallenge.title}
                        onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Points</label>
                      <Input
                        type="number"
                        value={newChallenge.points}
                        onChange={e => setNewChallenge({...newChallenge, points: parseInt(e.target.value) || 0})}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Category</label>
                      <Select
                        value={newChallenge.category}
                        onValueChange={v => setNewChallenge({...newChallenge, category: v as ChallengeCategory})}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/10">
                          <SelectItem value="ZTNA">ZTNA</SelectItem>
                          <SelectItem value="SWG">SWG</SelectItem>
                          <SelectItem value="CASB">CASB</SelectItem>
                          <SelectItem value="WAAP">WAAP</SelectItem>
                          <SelectItem value="Network">Network</SelectItem>
                          <SelectItem value="DLP">DLP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Flag</label>
                      <Input
                        placeholder="CF{...}"
                        value={newChallenge.flag}
                        onChange={e => setNewChallenge({...newChallenge, flag: e.target.value})}
                        className="bg-white/5 border-white/10 font-mono"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Briefing</label>
                      <Textarea
                        value={newChallenge.description}
                        onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
                        className="bg-white/5 border-white/10 h-32"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createMutation.mutate(newChallenge)}
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={createMutation.isPending || !newChallenge.title || !newChallenge.flag}
                    >
                      Deploy Mission
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
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
                    {challengesLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-white/20">Accessing archives...</TableCell></TableRow>
                    ) : challenges?.map((ch) => (
                      <TableRow key={ch.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-bold text-white">{ch.title}</TableCell>
                        <TableCell className="font-mono text-primary">{ch.points}</TableCell>
                        <TableCell className="font-mono text-xs text-white/30 truncate max-w-[150px]">{ch.flag}</TableCell>
                        <TableCell>
                          <Badge className={ch.isVisible ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-white/5 text-white/30"}>
                            {ch.isVisible ? "Visible" : "Hidden"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingChallenge(ch);
                              setIsEditOpen(true);
                            }}
                            className="hover:bg-primary/20 text-primary"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleMutation.mutate(ch.id)}
                            className="hover:bg-primary/20 text-primary"
                          >
                            {ch.isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { if(confirm("Permanently scrub mission?")) deleteChallengeMutation.mutate(ch.id) }}
                            className="hover:bg-destructive/20 text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
              <div className="overflow-x-auto">
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
                    {usersLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-white/20">Scanning biometric data...</TableCell></TableRow>
                    ) : users?.map((u) => (
                      <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-bold text-white">{u.username}</TableCell>
                        <TableCell className="font-mono text-primary text-lg">{u.score}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {u.solvedChallenges.map(cid => (
                              <Badge key={cid} variant="outline" className="text-[10px] border-white/10">{cid}</Badge>
                            ))}
                            {u.solvedChallenges.length === 0 && <span className="text-white/20 italic text-sm">Infiltrating...</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { if(confirm("Erase all progress and remove operative?")) deleteUserMutation.mutate(u.id) }}
                            className="hover:bg-destructive/20 text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Edit Challenge Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display uppercase italic">Update Mission Protocol</DialogTitle>
            <DialogDescription className="text-white/40">Modify parameters for mission {editingChallenge?.id}</DialogDescription>
          </DialogHeader>
          {editingChallenge && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Title</label>
                <Input
                  value={editingChallenge.title}
                  onChange={e => setEditingChallenge({...editingChallenge, title: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Points</label>
                <Input
                  type="number"
                  value={editingChallenge.points}
                  onChange={e => setEditingChallenge({...editingChallenge, points: parseInt(e.target.value) || 0})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Category</label>
                <Select
                  value={editingChallenge.category}
                  onValueChange={v => setEditingChallenge({...editingChallenge, category: v as ChallengeCategory})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="ZTNA">ZTNA</SelectItem>
                    <SelectItem value="SWG">SWG</SelectItem>
                    <SelectItem value="CASB">CASB</SelectItem>
                    <SelectItem value="WAAP">WAAP</SelectItem>
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="DLP">DLP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Flag</label>
                <Input
                  placeholder="CF{...}"
                  value={editingChallenge.flag}
                  onChange={e => setEditingChallenge({...editingChallenge, flag: e.target.value})}
                  className="bg-white/5 border-white/10 font-mono"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Briefing</label>
                <Textarea
                  value={editingChallenge.description}
                  onChange={e => setEditingChallenge({...editingChallenge, description: e.target.value})}
                  className="bg-white/5 border-white/10 h-32"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => editingChallenge && editMutation.mutate(editingChallenge)}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={editMutation.isPending || !editingChallenge?.title || !editingChallenge?.flag}
            >
              Update Protocol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}