'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  User,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuest, getCurrentEvent } from '@/lib/auth';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import { toast } from 'sonner';
import { signOut } from '@/lib/auth-server';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [weddingEventId, setWeddingEventId] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [event, setEvent] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        
        const guest = await getCurrentGuest();
        const eventData = await getCurrentEvent();
        
        if (guest) {
          setIsAuthenticated(true);
          setGuestName(guest.name);
          setAvatarUrl(guest.avatar_url || null);
          setGuestId(guest.id);
          setWeddingEventId(guest.wedding_event_id);
          setEvent(eventData);


          // Request notification permission
          const fcmToken = await requestNotificationPermission();
          if (fcmToken) {
            // Update guest's FCM token in the database
            await fetch('/api/guests/update-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fcmToken }),
            });
          }
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
        return;
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadNotifications(data.count);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };
    // Listen for foreground messages
    const unsubscribe = onForegroundMessage(() => {
      fetchUnreadCount();
    });
    fetchUnreadCount();

    return () => {
      unsubscribe?.();
    };
  }, [isAuthenticated, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };
  const FONT_OPTIONS = [
    { name: 'Playfair Display', value: 'font-playfair', class: 'font-playfair', description: 'Elegant serif' },
    { name: 'Dancing Script', value: 'font-dancing', class: 'font-dancing', description: 'Romantic script' },
    { name: 'Great Vibes', value: 'font-vibes', class: 'font-vibes', description: 'Flowing script' },
    { name: 'Cinzel', value: 'font-cinzel', class: 'font-cinzel', description: 'Classic roman' },
    { name: 'Cormorant Garamond', value: 'font-cormorant', class: 'font-cormorant', description: 'Refined serif' },
    { name: 'Montserrat', value: 'font-montserrat', class: 'font-montserrat', description: 'Modern sans-serif' },
    { name: 'Lora', value: 'font-lora', class: 'font-lora', description: 'Contemporary serif' },
    { name: 'Poppins', value: 'font-poppins', class: 'font-poppins', description: 'Clean geometric' },
  ];
  
  const renderLogo = () => {

    if (!event) {
      return <h1 className="text-xl font-bold">Heartgram</h1>;
    }

    if (event.use_logo_text) {
      
      return (
        <h1 
          className="text-xl font-bold"
          style={{ 
            fontFamily: FONT_OPTIONS.find((font)=> font.value === event.font_name)?.name || 'inherit',
            color: event.primary_color || 'inherit'
          }}
        >
          {event.name}
        </h1>
      );
    } else if (event.logo_url) {
      return (
        <img 
          src={event.logo_url} 
          alt={event.name}
          className="h-14 w-auto max-w-[200px] object-contain"
        />
      );
    }

    return <h1 className="text-xl font-bold">Heartgram</h1>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Header skeleton */}
        <header className="border-b py-3 px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>
        
        {/* Content skeleton */}
        <div className="flex-1 container max-w-lg mx-auto py-4 px-4">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        
        {/* Bottom navigation skeleton */}
        <div className="border-t py-3 px-4 flex justify-around">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The useEffect will redirect to login
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b py-3 px-4 sticky top-0 bg-background z-30">
        <div className="container max-w-lg mx-auto flex items-center justify-between">
          {renderLogo()}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className={pathname === '/notifications' ? 'text-primary relative' : 'text-muted-foreground relative'}
              onClick={() => {
                router.push('/notifications');
              }}
            >
              <Bell size={24} />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  style={{ backgroundColor: event?.primary_color || undefined }}
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={avatarUrl || undefined} alt={guestName || 'Guest'} />
                    <AvatarFallback>
                      {guestName ? guestName.substring(0, 2).toUpperCase() : 'GU'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User size={16} />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings size={16} />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container max-w-lg mx-auto py-4 px-4">
        {children}
      </main>
      
      {/* Bottom navigation */}
      <nav className="border-t py-3 px-4 sticky bottom-0 bg-background z-30">
        <div className="container max-w-lg mx-auto flex justify-around">
          <Button 
            variant="ghost" 
            size="icon" 
            className={pathname === '/feed' ? 'text-primary' : 'text-muted-foreground'}
            onClick={() => router.push('/feed')}
            style={pathname === '/feed' ? { color: event?.primary_color || undefined } : {}}
          >
            <Home size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={pathname === '/search' ? 'text-primary' : 'text-muted-foreground'}
            onClick={() => router.push('/search')}
            style={pathname === '/search' ? { color: event?.primary_color || undefined } : {}}
          >
            <Search size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={pathname === '/create' ? 'text-primary' : 'text-muted-foreground'}
            onClick={() => router.push('/create')}
            style={pathname === '/create' ? { color: event?.primary_color || undefined } : {}}
          >
            <PlusSquare size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={pathname === '/notifications' ? 'text-primary' : 'text-muted-foreground'}
            onClick={() => router.push('/notifications')}
            style={pathname === '/notifications' ? { color: event?.primary_color || undefined } : {}}
          >
            <Heart size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}
            onClick={() => router.push('/profile')}
            style={pathname === '/profile' ? { color: event?.primary_color || undefined } : {}}
          >
            <User size={24} />
          </Button>
        </div>
      </nav>
    </div>
  );
}