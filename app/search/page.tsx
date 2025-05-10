'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuest } from '@/lib/auth';
import { getPosts, Post } from '@/lib/posts';
import { toast } from 'sonner';
import { AvatarGroup } from '@/components/ui/avatar-group';

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [guest, setGuest] = useState<any>(null);
  const [weddingEventId, setWeddingEventId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [guests, setGuests] = useState<any[]>([]);

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
        setWeddingEventId(currentGuest.wedding_event_id);
        
        // Load posts
        const fetchedPosts = await getPosts(currentGuest.wedding_event_id, currentGuest.id);
        setPosts(fetchedPosts);
        
        // Extract unique guests from posts
        const uniqueGuests = new Map();
        fetchedPosts.forEach(post => {
          if (post.guest && !uniqueGuests.has(post.guest_id)) {
            uniqueGuests.set(post.guest_id, {
              id: post.guest_id,
              name: post.guest.name,
              avatarUrl: post.guest.avatar_url,
            });
          }
        });
        setGuests(Array.from(uniqueGuests.values()));
      } catch (error) {
        console.error('Error loading search data:', error);
        toast.error('Failed to load search data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter posts and guests based on search query
  const filteredPosts = searchQuery 
    ? posts.filter(post => 
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.guest?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;
    
  const filteredGuests = searchQuery
    ? guests.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guests;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, people..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="posts">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="font-semibold text-lg mb-2">No posts found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? `No posts match "${searchQuery}"`
                      : "Posts from the wedding will appear here"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {filteredPosts.map(post => (
                    <div key={post.id} className="aspect-square relative">
                      {post.image_url ? (
                        <div className="group relative w-full h-full overflow-hidden">
                          <img 
                            src={post.image_url} 
                            alt="Post" 
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-sm font-medium">
                              <AvatarGroup 
                                users={[{ name: post.guest?.name || 'Guest', avatarUrl: post.guest?.avatar_url }]}
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                      ) : post.video_url ? (
                        <div className="relative w-full h-full bg-muted">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center">
                              <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-white ml-1" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center p-2">
                          <p className="text-xs text-muted-foreground text-center line-clamp-4">
                            {post.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="people" className="mt-4">
              {filteredGuests.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="font-semibold text-lg mb-2">No people found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? `No people match "${searchQuery}"`
                      : "Wedding guests will appear here"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGuests.map(g => (
                    <div key={g.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
                      <Avatar>
                        <AvatarImage src={g.avatarUrl} alt={g.name} />
                        <AvatarFallback>{g.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{g.name}</div>
                        <div className="text-xs text-muted-foreground">Guest</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}