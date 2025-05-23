'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Post, Comment } from '@/lib/posts';
import { toggleLike, addComment } from '@/lib/posts';
import { CommentsDrawer } from './comments-drawer';
import { useRouter } from 'next/navigation';

interface PostCardProps {
  post: Post;
  currentGuestId: string;
  onUpdatePost: (updatedPost: Post) => void;
}

export function PostCard({ post, currentGuestId, onUpdatePost }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.Likes?.some(like => like.guest_id === currentGuestId) || false);
  const [likesCount, setLikesCount] = useState(post.Likes?.length || 0);
  const [commentsCount, setCommentsCount] = useState(post.Comments?.length || 0);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.Comments || []);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const router = useRouter();

  const handleLikeToggle = async () => {
    try {
      const newIsLiked = await toggleLike(post.id, currentGuestId, isLiked);
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
      
      // Update the post in parent component
      onUpdatePost({
        ...post,
        Likes: newIsLiked 
          ? [...(post.Likes || []), { guest_id: currentGuestId }]
          : (post.Likes || []).filter(like => like.guest_id !== currentGuestId),
      });
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    try {
      const newComment = await addComment(post.id, currentGuestId, comment);
      setComments(prev => [...prev, newComment]);
      setComment('');
      setCommentsCount(prev => prev + 1);
      
      // Update the post in parent component
      onUpdatePost({
        ...post,
        Comments: [...(post.Comments || []), newComment],
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleOpenComments = async () => {
    if (!isCommentsOpen && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const loadedComments = await getComments(post.id);
        setComments(loadedComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setIsCommentsOpen(true);
  };

  const handleProfileClick = () => {
    if(post.guest_id  === currentGuestId)  {
      router.push(`/profile`);
      return;
    }
    router.push(`/users/${post.guest_id}`);
  };

  return (
    <>
      <Card className="w-full overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardHeader className="p-4 flex flex-row items-center space-x-4 space-y-0">
          <Avatar 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            <AvatarImage src={post.Guest?.avatar_url} alt={post.Guest?.name || 'Guest'} />
            <AvatarFallback>
              {post.Guest?.name?.substring(0, 2).toUpperCase() || 'GU'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div 
              className="font-semibold cursor-pointer hover:underline"
              onClick={handleProfileClick}
            >
              {post.Guest?.name || 'Guest'}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {post.content && (
            <div className="px-4 py-2">{post.content}</div>
          )}
          {post.image_url && (
            <div className="relative aspect-square w-full overflow-hidden">
              <img 
                src={post.image_url} 
                alt="Post" 
                className="object-cover w-full h-full"
              />
            </div>
          )}
          {post.video_url && (
            <div className="relative aspect-video w-full overflow-hidden">
              <video 
                src={post.video_url} 
                controls 
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-2 flex flex-col">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center space-x-1 text-sm">
              <span className="font-medium">{likesCount}</span>
              <span className="text-muted-foreground">likes</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <span className="font-medium">{commentsCount}</span>
              <span className="text-muted-foreground">comments</span>
            </div>
          </div>
          <div className="flex items-center justify-between w-full border-t border-b py-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex-1 flex items-center gap-1",
                isLiked && "text-red-500"
              )}
              onClick={handleLikeToggle}
            >
              <Heart size={18} className={cn(isLiked && "fill-red-500")} />
              {isLiked ? 'Liked' : 'Like'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-1 flex items-center gap-1"
              onClick={handleOpenComments}
            >
              <MessageCircle size={18} />
              Comment
            </Button>
           
          </div>
          <form onSubmit={handleSubmitComment} className="flex items-center space-x-2 w-full mt-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <Input
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!comment.trim() || isSubmittingComment}
            >
              Post
            </Button>
          </form>
        </CardFooter>
      </Card>

      <CommentsDrawer
        postId={post.id}
        comments={comments}
        open={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
        isLoading={isLoadingComments}
        onAddComment={async (content) => {
          if (!content.trim()) return false;
          
          try {
            const newComment = await addComment(post.id, currentGuestId, content);
            setComments(prev => [...prev, newComment]);
            setCommentsCount(prev => prev + 1);
            
            // Update the post in parent component
            onUpdatePost({
              ...post,
              Comments: [...(post.Comments || []), newComment],
            });
            
            return true;
          } catch (error) {
            console.error('Failed to add comment:', error);
            return false;
          }
        }}
      />
    </>
  );
}