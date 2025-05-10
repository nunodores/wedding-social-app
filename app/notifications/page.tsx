'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuest } from '@/lib/auth';

// Mock data for notifications
const generateMockNotifications = (guestId: string) => {
  const now = new Date();
  const oneHourAgo = new Date(now);
  oneHourAgo.setHours(now.getHours() - 1);
  
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 3);
  
  return [
    {
      id: '1',
      type: 'like',
      user: {
        id: '123',
        name: 'Sarah Johnson',
        avatar: null,
      },
      postId: '456',
      isRead: false,
      createdAt: oneHourAgo.toISOString(),
    },
    {
      id: '2',
      type: 'comment',
      user: {
        id: '789',
        name: 'Michael Smith',
        avatar: null,
      },
      postId: '456',
      comment: 'Beautiful photo! Love this moment.',
      isRead: true,
      createdAt: threeDaysAgo.toISOString(),
    },
    {
      id: '3',
      type: 'follow',
      user: {
        id: '101',
        name: 'Emma Taylor',
        avatar: null,
      },
      isRead: false,
      createdAt: threeDaysAgo.toISOString(),
    },
  ];
};

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [guest, setGuest] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get current guest
        const currentGuest = await getCurrentGuest();
        if (!currentGuest) {
          throw new Error('Not authenticated');
        }
        setGuest(currentGuest);
        
        // In a real implementation, we would fetch notifications from an API
        // For this demo, we'll use mock data
        const mockNotifications = generateMockNotifications(currentGuest.id);
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationMessage = (notification: any) => {
    switch (notification.type) {
      case 'like':
        return <><span className="font-semibold">{notification.user.name}</span> liked your post</>;
      case 'comment':
        return (
          <div>
            <div><span className="font-semibold">{notification.user.name}</span> commented on your post</div>
            <div className="text-sm text-muted-foreground mt-1">"{notification.comment}"</div>
          </div>
        );
      case 'follow':
        return <><span className="font-semibold">{notification.user.name}</span> followed you</>;
      default:
        return 'New notification';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start space-x-4 p-3 rounded-lg ${!notification.isRead ? 'bg-muted' : ''}`}
                  >
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">{getNotificationMessage(notification)}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      {notification.type === 'follow' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                        >
                          Follow Back
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unread">
            {isLoading ? (
              <div className="space-y-4">
                {Array(2).fill(0).map((_, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No unread notifications</h3>
                <p className="text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className="flex items-start space-x-4 p-3 rounded-lg bg-muted"
                  >
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">{getNotificationMessage(notification)}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      {notification.type === 'follow' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                        >
                          Follow Back
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredNotifications.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    Mark All as Read
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}