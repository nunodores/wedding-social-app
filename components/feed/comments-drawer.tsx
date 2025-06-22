'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Comment } from '@/lib/posts';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentsDrawerProps {
  postId: string;
  comments: Comment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  onAddComment: (content: string) => Promise<boolean>;
}

export function CommentsDrawer({
  postId,
  comments,
  open,
  onOpenChange,
  isLoading,
  onAddComment,
}: CommentsDrawerProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await onAddComment(newComment);
      if (success) {
        setNewComment('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <SheetTitle>Comments</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X size={20} />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar>
                  <AvatarImage src={comment.guest?.avatar_url} alt={comment.guest?.name} />
                  <AvatarFallback>
                    {comment.guest?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="font-semibold mb-1">{comment.guest?.name}</div>
                    <div>{comment.content}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <SheetFooter className="px-4 py-3 border-t sticky bottom-0 bg-background z-10">
          <form onSubmit={handleSubmitComment} className="flex items-center space-x-2 w-full">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}