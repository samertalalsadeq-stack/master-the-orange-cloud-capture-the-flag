import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@/hooks/use-user";
import { ShieldAlert, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isApproved, logout } = useUser();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-black" />;
  }
  // Security Guard for non-approved users
  if (!isApproved && !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(243,128,32,0.15),transparent_50%)] pointer-events-none" />
        <div className="p-8 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_50px_rgba(243,128,32,0.2)] mb-8">
          <ShieldAlert className="size-16 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter text-white mb-4">
          Security Clearance <span className="text-primary">Pending</span>
        </h1>
        <p className="text-white/60 max-w-md text-lg font-sans mb-8">
          Your credentials have been logged in the Mission Database. Access to the Arena is restricted until a Command Operator approves your operative status.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <div className="flex items-center justify-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest p-4 border border-white/5 rounded-lg">
            <Loader2 className="size-3 animate-spin" /> Verifying Intel...
          </div>
          <Button
            variant="outline"
            onClick={() => { logout(); navigate('/'); }}
            className="border-white/10 hover:bg-destructive/10 hover:text-destructive gap-2 h-12"
          >
            <LogOut className="size-4" /> Terminate Session
          </Button>
        </div>
      </div>
    );
  }
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className={cn("bg-black min-h-screen relative flex flex-col", className)}>
        {/* Sidebar Trigger positioned to avoid collision with content */}
        <div className="fixed left-4 top-4 md:left-6 md:top-6 z-50">
          <SidebarTrigger className="bg-primary/10 text-primary border border-primary/20 shadow-lg hover:bg-primary/20 transition-all rounded-full p-3 size-12" />
        </div>
        {/* Main Content Area with sufficient top padding to clear the trigger and headers */}
        <main className="flex-1 w-full">
          {container ? (
            <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24", contentClassName)}>
              {children}
            </div>
          ) : (
            <div className={cn("pt-20 md:pt-24", contentClassName)}>
              {children}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}