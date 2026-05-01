import React from "react";
import { Swords, Trophy, Shield, LogOut, Users, Database, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { api } from "@/lib/api-client";
import type { CTFUser } from "@shared/types";
export function AppSidebar(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useUser();
  const { data: users } = useQuery<CTFUser[]>({
    queryKey: ['admin-users-summary'],
    queryFn: () => api<CTFUser[]>('/api/admin/users', { headers: { 'X-User-ID': user?.id || '' } }),
    enabled: !!user?.id && isAdmin,
    refetchInterval: 30000
  });
  const pendingCount = users?.filter(u => !u.isApproved && !u.isAdmin).length ?? 0;
  const handleLogout = () => { logout(); navigate('/'); };
  const navItems = [
    { label: "The Arena", icon: Swords, path: "/arena" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
  ];
  const adminItems = [
    { 
      label: "Operatives", 
      icon: Users, 
      path: "/admin/users",
      badge: pendingCount > 0 ? pendingCount : null 
    },
    { label: "Mission Database", icon: Database, path: "/admin/challenges" },
  ];
  return (
    <Sidebar className="border-r border-white/5 bg-black">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(243,128,32,0.4)]">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Orange CTF</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 px-2 text-xs uppercase tracking-widest font-bold">Infiltration</SidebarGroupLabel>
          <SidebarMenu className="mt-2 space-y-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  onClick={() => navigate(item.path)}
                  isActive={location.pathname === item.path}
                  className={cn(
                    "w-full justify-start transition-colors py-6 text-base font-medium",
                    location.pathname === item.path ? "bg-primary/10 text-primary" : "text-white/60 hover:text-white"
                  )}
                >
                  <item.icon className="size-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-white/40 px-2 text-xs uppercase tracking-widest font-bold">Command Center</SidebarGroupLabel>
            <SidebarMenu className="mt-2 space-y-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    className={cn(
                      "w-full justify-start transition-colors py-6 text-base font-medium relative",
                      location.pathname === item.path ? "bg-primary/10 text-primary" : "text-white/60 hover:text-white"
                    )}
                  >
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(243,128,32,0.5)]">
                        <AlertCircle className="size-2" /> {item.badge}
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-3 py-2 mb-2">
              <p className="text-[10px] text-white/30 uppercase tracking-tighter">Identity Signature</p>
              <p className="text-sm font-mono text-primary truncate orange-glow">{user?.username}</p>
            </div>
            <SidebarMenuButton onClick={handleLogout} className="w-full text-destructive hover:bg-destructive/10">
              <LogOut className="size-5" /> <span>Abort Mission</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}