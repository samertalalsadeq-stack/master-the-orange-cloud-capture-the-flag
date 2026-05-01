import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Plus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast, Toaster } from 'sonner';
import type { Challenge, ChallengeCategory, CTFUser } from '@shared/types';
export function AdminChallengesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [editingChallenge, setEditingChallenge] = useState<Partial<Challenge> | null>(null);
  const currentUser = useMemo(() => {
    const stored = localStorage.getItem('ctf_user');
    return stored ? (JSON.parse(stored) as CTFUser) : null;
  }, []);
  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ['admin-challenges'],
    queryFn: () => api<Challenge[]>('/api/admin/challenges', {
      headers: { 'X-User-ID': currentUser?.id || '' }
    })
  });
  const createMutation = useMutation({
    mutationFn: (data: Partial<Challenge>) => api('/api/admin/challenges', {
      method: 'POST',
      headers: { 'X-User-ID': currentUser?.id || '', 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast.success("Mission encoded to database");
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      setEditingChallenge(null);
    }
  });
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Challenge>) => api(`/api/admin/challenges/${data.id}`, {
      method: 'PUT',
      headers: { 'X-User-ID': currentUser?.id || '', 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast.success("Mission objective updated");
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      setEditingChallenge(null);
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/admin/challenges/${id}`, {
      method: 'DELETE',
      headers: { 'X-User-ID': currentUser?.id || '' }
    }),
    onSuccess: () => {
      toast.success("Mission purged");
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
    }
  });
  const filteredChallenges = challenges?.filter(ch => {
    const matchesSearch = ch.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || ch.category === categoryFilter;
    return matchesSearch && matchesCat;
  });
  if (isLoading) return <div className="text-primary font-mono animate-pulse">DECRYPTING MISSION DATABASE...</div>;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter text-white">
            Mission <span className="text-primary">Database</span>
          </h1>
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest mt-1">Registry of Global Challenges</p>
        </div>
        <Button onClick={() => setEditingChallenge({})} className="bg-primary hover:bg-primary/90 text-white font-bold h-12">
          <Plus className="mr-2 size-5" /> NEW MISSION
        </Button>
      </div>
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input
            placeholder="Filter Missions..."
            className="bg-white/5 border-white/10 pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 h-12 bg-white/5 border-white/10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-card border-white/10 text-white">
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="ZTNA">ZTNA</SelectItem>
            <SelectItem value="SWG">SWG</SelectItem>
            <SelectItem value="WAAP">WAAP</SelectItem>
            <SelectItem value="Network">Network</SelectItem>
            <SelectItem value="DLP">DLP</SelectItem>
            <SelectItem value="CASB">CASB</SelectItem>
            <SelectItem value="Identity">Identity</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="bg-card border-white/10 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10">
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6">Mission Name</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6">Category</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Value</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Visibility</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-xs font-bold px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChallenges?.map((ch) => (
              <TableRow key={ch.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="px-6 font-bold text-white text-lg">{ch.title}</TableCell>
                <TableCell className="px-6">
                  <Badge variant="outline" className="border-primary/20 text-primary font-mono text-[10px] uppercase">
                    {ch.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-6 font-mono font-bold text-primary">{ch.points}</TableCell>
                <TableCell className="text-right px-6">
                  {ch.isVisible ? <Eye className="size-4 text-green-500 inline" /> : <EyeOff className="size-4 text-white/20 inline" />}
                </TableCell>
                <TableCell className="text-right px-6 space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingChallenge(ch)}>
                    <Edit2 className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => deleteMutation.mutate(ch.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={!!editingChallenge} onOpenChange={(open) => !open && setEditingChallenge(null)}>
        <DialogContent className="bg-card border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display uppercase italic">
              {editingChallenge?.id ? 'Edit Mission Data' : 'Initialize New Mission'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Mission Title</label>
              <Input
                value={editingChallenge?.title || ''}
                onChange={(e) => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Intel / Description</label>
              <Input
                value={editingChallenge?.description || ''}
                onChange={(e) => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Flag (CF{`{...}`})</label>
              <Input
                value={editingChallenge?.flag || ''}
                onChange={(e) => setEditingChallenge({ ...editingChallenge, flag: e.target.value })}
                className="bg-white/5 border-white/10 font-mono text-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Points Value</label>
              <Input
                type="number"
                value={editingChallenge?.points || 0}
                onChange={(e) => setEditingChallenge({ ...editingChallenge, points: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase">Category</label>
              <Select
                value={editingChallenge?.category}
                onValueChange={(val) => setEditingChallenge({ ...editingChallenge, category: val as ChallengeCategory })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 text-white">
                  <SelectItem value="ZTNA">ZTNA</SelectItem>
                  <SelectItem value="SWG">SWG</SelectItem>
                  <SelectItem value="WAAP">WAAP</SelectItem>
                  <SelectItem value="Network">Network</SelectItem>
                  <SelectItem value="DLP">DLP</SelectItem>
                  <SelectItem value="CASB">CASB</SelectItem>
                  <SelectItem value="Identity">Identity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="isVisible"
                checked={editingChallenge?.isVisible ?? true}
                onChange={(e) => setEditingChallenge({ ...editingChallenge, isVisible: e.target.checked })}
              />
              <label htmlFor="isVisible" className="text-sm font-medium">Mission Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingChallenge(null)}>Cancel</Button>
            <Button
              onClick={() => editingChallenge?.id ? updateMutation.mutate(editingChallenge) : createMutation.mutate(editingChallenge as Challenge)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Commit Mission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster richColors position="top-right" />
    </div>
  );
}