'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuest } from '@/lib/auth';
import { getPosts, Post } from '@/lib/posts';
import { Camera, Settings, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentGuest, setCurrentGuest] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get current guest
        const guest = await getCurrentGuest();
        if (!guest) {
          router.push('/login');
          return;
        }
        setCurrentGuest(guest);

        // Fetch user data
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'get-user',
            user_id: params.userId,
            wedding_event_id: guest.wedding_event_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const userData = await response.json();
        setUser(userData);
        
        // Load posts
        const fetchedPosts = await getPosts(guest.wedding_event_id, guest.id);
        const userPosts = fetchedPosts.filter(post => post.guest_id === params.userId);
        setPosts(userPosts);
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [params.userId, router]);


  return (
    <AppLayout>
      {isLoading ? (
        <div className="space-y-8">
          <div className="flex flex-col items-center">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-48 mb-6" />
            <div className="flex justify-center space-x-8 w-full mb-4">
              <div className="text-center">
                <Skeleton className="h-5 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="text-center">
                <Skeleton className="h-5 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="text-center">
                <Skeleton className="h-5 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        </div>
      ) : !user ? (
        <div className="text-center py-8">
          <h3 className="font-semibold text-lg mb-2">User not found</h3>
          <p className="text-muted-foreground">
            This user may not exist or you may not have permission to view their profile.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-semibold mb-1">{user.name}</h1>
            {user.bio && (
              <p className="text-muted-foreground mb-2 text-center max-w-md">{user.bio}</p>
            )}
            <p className="text-muted-foreground mb-6">{user.email}</p>
            
            <div className="flex justify-center space-x-8 w-full mb-6">
              <div className="text-center">
                <div className="font-semibold">{posts.length}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
            </div>

            {currentGuest.id === user.id && (
              <Button 
                variant="outline" 
                className="w-full max-w-xs"
                onClick={() => router.push('/settings/profile')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) }
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            {posts.length === 0 ? (
              <div className="col-span-3 text-center py-8">
                <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {currentGuest.id === user.id 
                    ? "Start sharing photos and videos from the wedding."
                    : "This user hasn't shared any posts yet."}
                </p>
              </div>
            ) : (
              posts.map(post => (
                <div 
                  key={post.id} 
                  className="aspect-square relative cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => router.push(`/posts/${post.id}`)}
                >
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="object-cover w-full h-full"
                    />
                  ) : post.video_url ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground px-2 text-center line-clamp-3">
                        {post.content}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}