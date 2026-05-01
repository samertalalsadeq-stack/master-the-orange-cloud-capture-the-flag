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
    // Session guard: If cleared in another tab, redirect immediately
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className={className}>
        {/* Adjusted trigger placement to stay clear of top-left NavBackButton in page content */}
        <div className="fixed left-4 bottom-4 md:absolute md:left-4 md:top-4 z-40">
          <SidebarTrigger className="bg-primary/10 text-primary border border-primary/20 shadow-lg hover:bg-primary/20 transition-all rounded-full p-3 size-10" />
        </div>
        {container ? (
          <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
            <div className="relative pt-6 md:pt-0">
              {children}
            </div>
          </div>
        ) : (
          <div className="relative pt-12 md:pt-0">
            {children}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}