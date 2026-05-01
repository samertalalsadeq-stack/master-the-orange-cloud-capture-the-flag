import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@/hooks/use-user";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  useEffect(() => {
    // Session guard: Check if authenticated. If not, redirect.
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  // Prevent flicker during redirect
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-black" />;
  }
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className={cn("bg-black min-h-screen", className)}>
        {/* Trigger stays clear of page content */}
        <div className="fixed left-4 bottom-4 md:absolute md:left-6 md:top-8 z-40">
          <SidebarTrigger className="bg-primary/10 text-primary border border-primary/20 shadow-lg hover:bg-primary/20 transition-all rounded-full p-3 size-12" />
        </div>
        {container ? (
          <div className={cn(
            "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16",
            contentClassName
          )}>
            <div className="relative pt-12 md:pt-4">
              {children}
            </div>
          </div>
        ) : (
          <div className="relative pt-16 md:pt-4">
            {children}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
// Minimal utility import for the file
import { cn } from "@/lib/utils";