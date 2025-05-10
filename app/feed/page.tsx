'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { CreatePostForm } from '@/components/feed/create-post-form';
import { PostCard } from '@/components/feed/post-card';
import { StoriesCarousel } from '@/components/feed/stories-carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuest } from '@/lib/auth';
import { getPosts, Post } from '@/lib/posts';
import { getStories, Story } from '@/lib/stories';
import { toast } from 'sonner';

export default function FeedPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [guest, setGuest] = useState<any>(null);
  const [weddingEvent, setWeddingEvent] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

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
        
        // For demo purposes, using a mock wedding event
        // In a real implementation, we would fetch this from an API
        const mockWeddingEvent = {
          id: currentGuest.wedding_event_id,
          name: 'Sarah & John\'s Wedding',
          slug: 'sarah-john',
          access_code: '123456',
          created_at: new Date().toISOString(),
        };
        setWeddingEvent(mockWeddingEvent);
        
        // Load posts
        const fetchedPosts = await getPosts(currentGuest.wedding_event_id, currentGuest.id);
        setPosts(fetchedPosts);
        
        // Load stories
        const fetchedStories = await getStories(currentGuest.wedding_event_id);
        setStories(fetchedStories);
      } catch (error) {
        console.error('Error loading feed data:', error);
        toast.error('Failed to load feed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [refreshKey]);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleStoryCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  return (
    <AppLayout>
      {isLoading ? (
        <>
          {/* Story skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <div className="flex space-x-4 overflow-x-auto py-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-full flex-shrink-0" />
              ))}
            </div>
          </div>
          
          {/* Create post skeleton */}
          <Skeleton className="h-32 w-full mb-6" />
          
          {/* Posts skeleton */}
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-72 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </>
      ) : (
        <>
          {stories.length > 0 && (
            <StoriesCarousel 
              stories={stories} 
              currentGuest={guest}
              weddingEvent={weddingEvent}
              onStoryCreated={handleStoryCreated}
            />
          )}
          
          <CreatePostForm 
            guest={guest}
            weddingEvent={weddingEvent}
            onPostCreated={handlePostCreated}
          />
          
          <div className="mt-6 space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="font-semibold text-lg mb-2">No posts yet!</h3>
                <p className="text-muted-foreground">
                  Be the first to share a moment from this wedding.
                </p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentGuestId={guest.id}
                  onUpdatePost={handleUpdatePost}
                />
              ))
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}