'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();
    // Poll for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/notifications" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center bg-red-500"
          variant="destructive"
        >
          {unreadCount}
        </Badge>
      )}
    </Link>
  );
}