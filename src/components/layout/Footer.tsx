import React from 'react';
import { Mail, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
interface FooterProps {
  className?: string;
}
export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={cn("w-full border-t border-primary/20 bg-black/50 backdrop-blur-md py-8 mt-auto", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center border border-primary/30">
              <Shield className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-white/80 uppercase italic">
              Master the <span className="text-primary">Orange Cloud</span>
            </span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <div className="flex items-center gap-2 text-white/40 text-xs font-mono uppercase tracking-widest">
              <span>Created by</span>
              <span className="text-white/80 font-bold">Samer Hasan</span>
            </div>
            <a
              href="mailto:samer@cloudflare.com"
              className="group flex items-center gap-2 text-sm transition-all hover:scale-105 active:scale-95"
            >
              <Mail className="size-4 text-primary group-hover:animate-pulse" />
              <span className="text-white/60 group-hover:text-primary font-mono transition-colors orange-glow">
                samer@cloudflare.com
              </span>
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
          <p>© {currentYear} Cloudflare, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-primary transition-colors cursor-default">Internal Use Only</span>
            <span className="h-3 w-px bg-white/10" />
            <span className="hover:text-primary transition-colors cursor-default">V2.4 Secure Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
}