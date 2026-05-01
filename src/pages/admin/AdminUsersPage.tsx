import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, RefreshCw, Trash2, Edit2, Terminal } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast, Toaster } from 'sonner';
import type { CTFUser } from '@shared/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { NavBackButton } from '@/components/NavBackButton';
export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<CTFUser | null>(null);
  const { user: currentUser, updateUser } = useUser();
  const { data: users, isLoading } = useQuery<CTFUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => api<CTFUser[]>('/api/admin/users', {
      headers: { 'X-User-ID': currentUser?.id || '' }
    })
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'X-User-ID': currentUser?.id || '' }
    }),
    onSuccess: () => {
      toast.success("Operative decommissioned");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
  const resetMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/users/reset/${id}`, {
      method: 'POST',
      headers: { 'X-User-ID': currentUser?.id || '' }
    }),
    onSuccess: () => {
      toast.success("User progress wiped");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
  const updateMutation = useMutation({
    mutationFn: (user: CTFUser) => api<CTFUser>(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'X-User-ID': currentUser?.id || '', 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }),
    onSuccess: (updated: CTFUser) => {
      toast.success("Operative data synchronized");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      if (currentUser && updated.id === currentUser.id) {
        updateUser(updated);
      }
      setEditingUser(null);
    }
  });
  const filteredUsers = users?.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.score - a.score);
  if (isLoading) return <div className="text-primary font-mono animate-pulse">ACCESSING OPERATIVE DATABASE...</div>;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-6">
        <NavBackButton />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter text-white">
              Operative <span className="text-primary">Management</span>
            </h1>
            <p className="text-white/40 font-mono text-sm uppercase tracking-widest mt-1">Command & Control Center</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <Input
              placeholder="Search Alias..."
              className="bg-white/5 border-white/10 pl-10 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <Card className="bg-card border-white/10 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10">
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6">Alias</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Score</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Missions</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Status</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((u) => (
              <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="px-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "size-2 rounded-full",
                      u.isAdmin ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(243,128,32,0.8)]" : "bg-green-500/50"
                    )} />
                    <span className="font-bold text-white text-lg">{u.username}</span>
                    {u.isAdmin && <Badge className="bg-primary/10 text-primary border-primary/20 ml-2">ADMIN</Badge>}
                  </div >
                </TableCell>
                <TableCell className="text-right px-6 font-mono font-bold text-primary">{u.score}</TableCell>
                <TableCell className="text-right px-6 text-white/50">{u.solvedChallenges.length}</TableCell>
                <TableCell className="text-right px-6">
                  <span className="text-white/20 text-xs font-mono">{new Date(u.joinedAt).toLocaleDateString()}</span>
                </TableCell>
                <TableCell className="text-right px-6 space-x-2">
                  <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10" onClick={() => setEditingUser(u)}>
                    <Edit2 className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10" onClick={() => resetMutation.mutate(u.id)}>
                    <RefreshCw className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(u.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-2">
              <Terminal className="size-5 text-primary" /> Modify Operative Status
            </DialogTitle>
            <DialogDescription className="text-white/40">Adjust parameters for infiltrator: {editingUser?.username}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-white/40">Manual Score Override</label>
                <Input
                  type="number"
                  value={editingUser.score}
                  onChange={(e) => setEditingUser({ ...editingUser, score: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={editingUser.isAdmin}
                  onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                  className="accent-primary"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium">Grant Command Privileges (Admin)</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={() => editingUser && updateMutation.mutate(editingUser)} className="bg-primary hover:bg-primary/90 text-white">Save Adjustments</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster richColors position="top-right" />
    </div>
  );
}