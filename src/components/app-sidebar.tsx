import React, { useState, useEffect, useCallback } from "react";
import { Swords, Trophy, Shield, LogOut, Users, Database, AlertCircle, Clock } from "lucide-react";
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
  const [sessionTime, setSessionTime] = useState<string>("0m 0s");
  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return "0m 0s";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };
  const updateTimer = useCallback(() => {
    const startTimeStr = localStorage.getItem('ctf_session_start');
    if (startTimeStr) {
      const startTime = parseInt(startTimeStr, 10);
      if (!isNaN(startTime)) {
        const elapsed = Math.max(0, Date.now() - startTime);
        setSessionTime(formatTime(elapsed));
        return;
      }
    }
    setSessionTime("0m 0s");
  }, []);
  useEffect(() => {
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    const handleSessionChange = () => {
      updateTimer();
    };
    window.addEventListener('user-session-changed', handleSessionChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('user-session-changed', handleSessionChange);
    };
  }, [updateTimer]);
  const userId = user?.id;
  const { data: users } = useQuery<CTFUser[]>({
    queryKey: ['admin-users-summary', userId],
    queryFn: () => api<CTFUser[]>('/api/admin/users', { headers: { 'X-User-ID': userId || '' } }),
    enabled: !!userId && isAdmin,
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
          <span className="font-display font-bold text-lg tracking-tight text-white uppercase italic">Menu</span>
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
            <div className="px-3 py-2 mb-2 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/30 uppercase tracking-tighter">Identity Signature</p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-primary animate-pulse-subtle">
                  <Clock className="size-2" /> <span>{sessionTime}</span>
                </div>
              </div>
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