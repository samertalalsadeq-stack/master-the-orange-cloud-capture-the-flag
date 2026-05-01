import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface NavBackButtonProps {
  className?: string;
  fallbackPath?: string;
}
export function NavBackButton({ className, fallbackPath = '/arena' }: NavBackButtonProps) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={cn(
        "gap-2 text-primary hover:text-primary/80 hover:bg-primary/10 transition-all hover:scale-105 active:scale-95 group",
        className
      )}
    >
      <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
      <span className="font-mono text-xs uppercase tracking-widest orange-glow font-bold">Return</span>
    </Button>
  );
}