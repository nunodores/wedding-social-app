'use client';

import { useState, useEffect } from 'react';
import { Camera, Grid3X3, Bookmark, Settings } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuest } from '@/lib/auth';
import { getPosts, Post } from '@/lib/posts';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [guest, setGuest] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();

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
        
        // Load posts by this guest
        const allPosts = await getPosts(currentGuest.wedding_event_id, currentGuest.id);
        const guestPosts = allPosts.filter(post => post.guest_id === currentGuest.id);
        setPosts(guestPosts);
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <AppLayout>
      {isLoading ? (
        <div className="space-y-8">
          {/* Profile header skeleton */}
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
            <Skeleton className="h-10 w-full max-w-xs" />
          </div>
          
          {/* Tabs skeleton */}
          <div>
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-3 gap-1">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Profile header */}
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={guest.avatar_url} alt={guest.name} />
              <AvatarFallback>{guest.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-semibold mb-1">{guest.name}</h1>
            <p className="text-muted-foreground mb-6">{guest.email}</p>
            
            <div className="flex justify-center space-x-8 w-full mb-6">
              <div className="text-center">
                <div className="font-semibold">{posts.length}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">0</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">0</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
            
            <Button className="w-full max-w-xs" variant="outline" onClick={() =>router.push('edit-profile')}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
          
          {/* Profile tabs */}
          <Tabs defaultValue="posts">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="posts">
                <Grid3X3 className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Bookmark className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger value="tagged">
                <Camera className="h-5 w-5" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    Start sharing photos and videos from the wedding.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {posts.map(post => (
                    <div key={post.id}                   className="aspect-square relative cursor-pointer"
                    onClick={() => router.push(`/posts/${post.id}`)}>
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
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="saved">
              <div className="text-center py-8">
                <h3 className="font-semibold text-lg mb-2">No saved posts</h3>
                <p className="text-muted-foreground">
                  Posts you save will appear here.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="tagged">
              <div className="text-center py-8">
                <h3 className="font-semibold text-lg mb-2">No tagged posts</h3>
                <p className="text-muted-foreground">
                  Posts you&apos;re tagged in will appear here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AppLayout>
  );
}