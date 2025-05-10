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
  Settings
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
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuest, signOut } from '@/lib/auth';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const guest = await getCurrentGuest();
        
        if (guest) {
          setIsAuthenticated(true);
          setGuestName(guest.name);
          setAvatarUrl(guest.avatar_url || null);
        } else {
          // Not authenticated, redirect to login
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
          <h1 className="text-xl font-bold">WeddingSnap</h1>
          
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
          >
            <Home size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={pathname === '/search' ? 'text-primary' : 'text-muted-foreground'}
            onClick={() => router.push('/search')}
          >
            <Search size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={pathname === '/create' ? 'text-primary' : 'text-muted-foreground'}
            onClick={() => router.push('/create')}
          >
            <PlusSquare size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={pathname === '/notifications' ? 'text-primary' : 'text-muted-foreground'}
            onClick={() => router.push('/notifications')}
          >
            <Heart size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}
            onClick={() => router.push('/profile')}
          >
            <User size={24} />
          </Button>
        </div>
      </nav>
    </div>
  );
}