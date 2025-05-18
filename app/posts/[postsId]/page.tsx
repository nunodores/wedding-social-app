'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { PostCard } from '@/components/feed/post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuest } from '@/lib/auth';
import { Post } from '@/lib/posts';
import { toast } from 'sonner';

export default function PostDetailPage({ params }: { params: { postsId: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
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
        setCurrentGuestId(guest.id);
        // Fetch post
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'get-post',
            post_id: params.postsId,
            wedding_event_id: guest.wedding_event_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }

        const post = await response.json();
        setPost(post);
      } catch (error) {
        console.error('Error loading post:', error);
        toast.error('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.postsId, router]);

  const handleUpdatePost = (updatedPost: Post) => {
    setPost(updatedPost);
  };

  return (
    <AppLayout>
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !post ? (
        <div className="text-center py-8">
          <h3 className="font-semibold text-lg mb-2">Post not found</h3>
          <p className="text-muted-foreground">
            This post may have been deleted or you may not have permission to view it.
          </p>
        </div>
      ) : (
        <PostCard
          post={post}
          currentGuestId={currentGuestId!}
          onUpdatePost={handleUpdatePost}
        />
      )}
    </AppLayout>
  );
}