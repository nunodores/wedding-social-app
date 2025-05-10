import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarGroupProps {
  users: Array<{
    name: string;
    avatarUrl?: string;
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({
  users,
  max = 3,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max > 0 ? users.length - max : 0;

  const sizeClasses = {
    sm: 'h-6 w-6 -ml-1 first:ml-0 text-xs',
    md: 'h-8 w-8 -ml-2 first:ml-0 text-sm',
    lg: 'h-10 w-10 -ml-3 first:ml-0 text-base',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {visibleUsers.map((user, i) => (
        <Avatar 
          key={i} 
          className={cn(
            sizeClasses[size],
            'ring-2 ring-background transition-transform hover:z-10 hover:scale-105'
          )}
        >
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={cn(
            sizeClasses[size],
            'rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium ring-2 ring-background'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}