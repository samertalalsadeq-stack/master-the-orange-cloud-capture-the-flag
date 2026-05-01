import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, RefreshCw, Trash2, Edit2, Terminal, CheckCircle, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { CTFUser } from '@shared/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { NavBackButton } from '@/components/NavBackButton';
export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPending, setFilterPending] = useState(false);
  const [editingUser, setEditingUser] = useState<CTFUser | null>(null);
  const { user: currentUser, isAdmin, updateUser } = useUser();
  const { data: users, isLoading } = useQuery<CTFUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => api<CTFUser[]>('/api/admin/users', {
      headers: { 'X-User-ID': currentUser?.id || '' }
    }),
    enabled: !!currentUser?.id && isAdmin
  });
  const updateMutation = useMutation({
    mutationFn: (userData: Partial<CTFUser>) => api<CTFUser>(`/api/admin/users/${userData.id}`, {
      method: 'PUT',
      headers: { 'X-User-ID': currentUser?.id || '', 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),
    onSuccess: (updated: CTFUser) => {
      toast.success("Operative status updated");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      if (currentUser && updated.id === currentUser.id) updateUser(updated);
      setEditingUser(null);
    }
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
  const filteredUsers = users?.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPending ? !u.isApproved && !u.isAdmin : true;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => b.score - a.score);
  if (!isAdmin) return <div className="text-destructive font-mono p-8">RESTRICTED SECTOR: ACCESS DENIED</div>;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-6">
        <NavBackButton />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter text-white">
              Operative <span className="text-primary">Registry</span>
            </h1>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant={filterPending ? "default" : "outline"}
              onClick={() => setFilterPending(!filterPending)}
              className={cn("h-12 font-mono text-xs uppercase", filterPending && "bg-primary text-white border-primary")}
            >
              Pending Only {users?.filter(u => !u.isApproved && !u.isAdmin).length ? `(${users.filter(u => !u.isApproved && !u.isAdmin).length})` : ""}
            </Button>
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
              <Input
                placeholder="Search Alias/Email..."
                className="bg-white/5 border-white/10 pl-10 h-12 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <Card className="bg-card border-white/10 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10">
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6">Operative</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Approval</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Score</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={4} className="text-center py-8 font-mono text-primary animate-pulse tracking-widest">ACCESSING ENCRYPTED DATABASE...</TableCell></TableRow>
            ) : filteredUsers?.map((u) => (
              <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="px-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{u.username}</span>
                      {u.isAdmin && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">CMD</Badge>}
                    </div>
                    <span className="text-xs text-white/30 font-mono">{u.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-6">
                  {u.isAdmin ? (
                    <Badge variant="outline" className="border-primary/20 text-primary">AUTHORIZED</Badge>
                  ) : u.isApproved ? (
                    <Badge variant="outline" className="border-green-500/20 text-green-500">CLEARED</Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-500/50 text-orange-500 animate-pulse-subtle">PENDING</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right px-6 font-mono font-bold text-primary">{u.score}</TableCell>
                <TableCell className="text-right px-6 space-x-1">
                  {!u.isApproved && !u.isAdmin && (
                    <Button
                      variant="ghost" size="icon" className="text-green-500 hover:bg-green-500/10"
                      onClick={() => updateMutation.mutate({ id: u.id, isApproved: true })}
                      title="Approve Operative"
                    >
                      <CheckCircle className="size-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => setEditingUser(u)}><Edit2 className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => deleteMutation.mutate(u.id)}><Trash2 className="size-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-card border-white/10 text-white" aria-describedby="user-edit-desc">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> Modify Operative Intelligence
            </DialogTitle>
            <DialogDescription id="user-edit-desc">
              Adjust operative clearance level and profile data. Changes will sync across all sectors.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-white/40">Username</label>
                <Input value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="adm" checked={editingUser.isAdmin} onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })} className="accent-primary" />
                  <label htmlFor="adm" className="text-sm font-medium">Command Privileges (Admin)</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="app" checked={editingUser.isApproved} onChange={(e) => setEditingUser({ ...editingUser, isApproved: e.target.checked })} className="accent-primary" />
                  <label htmlFor="app" className="text-sm font-medium">Clearance Granted (Approved)</label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => editingUser && updateMutation.mutate(editingUser)} className="bg-primary hover:bg-primary/90 text-white">Synchronize Registry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}