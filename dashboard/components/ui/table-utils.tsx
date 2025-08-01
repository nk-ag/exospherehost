import React from 'react';
import { Badge } from './badge';
import { AlertCircle, CheckCircle, Activity, XCircle, Clock, Pause } from 'lucide-react';

export type StatusType = 'completed' | 'running' | 'failed' | 'queued' | 'paused';

export const getStatusBadge = (status: StatusType, withIcon: boolean = false) => {
  const variants = {
    completed: { 
      variant: 'default' as const, 
      className: 'bg-accent-green/20 text-accent-green border-accent-green/30', 
      icon: CheckCircle 
    },
    running: { 
      variant: 'secondary' as const, 
      className: 'bg-primary/20 text-primary border-primary/30', 
      icon: Activity 
    },
    failed: { 
      variant: 'destructive' as const, 
      className: 'bg-accent-pink/20 text-accent-pink border-accent-pink/30', 
      icon: XCircle 
    },
    queued: { 
      variant: 'outline' as const, 
      className: 'border-accent-yellow/50 text-accent-yellow', 
      icon: Clock 
    },
    paused: { 
      variant: 'outline' as const, 
      className: 'border-accent-orange/50 text-accent-orange', 
      icon: Pause 
    }
  } as const;
  
  const config = variants[status];
  const Icon = config.icon;
  
  if (withIcon) {
    return (
      <Badge variant={config.variant} className={`capitalize flex items-center gap-1 ${config.className}`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  }
  
  return (
    <Badge variant={config.variant} className={`capitalize ${config.className}`}>
      {status}
    </Badge>
  );
};

export const getFailureBadge = (failures: number) => {
  if (failures === 0) {
    return (
      <Badge variant="default" className="bg-accent-green/20 text-accent-green border-accent-green/30">
        No Failures
      </Badge>
    );
  } else if (failures <= 5) {
    return (
      <Badge variant="secondary" className="bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30">
        {failures} Failures
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive" className="bg-accent-pink/20 text-accent-pink border-accent-pink/30">
        {failures} Failures
      </Badge>
    );
  }
};

export const renderSteps = (steps: { completed: number; total: number; failed?: number }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{steps.completed}/{steps.total}</span>
      {steps.failed && steps.failed > 0 && (
        <Badge variant="destructive" className="text-xs">
          {steps.failed} failed
        </Badge>
      )}
    </div>
  );
};

export const renderError = (error?: string) => {
  if (!error) return null;
  
  return (
    <div className="flex items-center gap-1 text-accent-pink text-xs">
      <AlertCircle className="w-3 h-3" />
      {error}
    </div>
  );
};

export const renderId = (id: string, className?: string) => {
  return (
    <span className={`font-mono text-sm text-primary group-hover:text-primary transition-colors ${className || ''}`}>
      {id}
    </span>
  );
};

export const renderName = (name: string, className?: string) => {
  return (
    <span className={`text-foreground group-hover:text-primary font-semibold transition-colors ${className || ''}`}>
      {name}
    </span>
  );
};

export const renderText = (text: string, className?: string) => {
  return (
    <span className={`text-muted-foreground group-hover:text-foreground transition-colors ${className || ''}`}>
      {text}
    </span>
  );
};

export const renderCapitalized = (text: string, className?: string) => {
  return (
    <span className={`capitalize text-muted-foreground group-hover:text-foreground transition-colors ${className || ''}`}>
      {text}
    </span>
  );
}; 