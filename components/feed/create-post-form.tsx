'use client';

import { useState, useRef } from 'react';
import { Image, Film, X } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createPost } from '@/lib/posts';
import { Guest } from '@/lib/auth';
import { toast } from 'sonner';
import { WeddingEvent } from '@/lib/models';

interface CreatePostFormProps {
  guest: Guest;
  weddingEvent: WeddingEvent;
  onPostCreated: () => void;
}

export function CreatePostForm({ guest, weddingEvent, onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any existing media
    if (mediaFile) {
      URL.revokeObjectURL(mediaPreview as string);
    }

    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !mediaFile) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPost(
        content,
        weddingEvent.id,
        guest.id,
        mediaType === 'image' ? mediaFile as File : undefined,
        mediaType === 'video' ? mediaFile as File : undefined
      );

      setContent('');
      handleRemoveMedia();
      onPostCreated();
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src={guest.avatar_url} alt={guest.name} />
              <AvatarFallback>{guest.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={`Share a moment from ${weddingEvent.name}...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none min-h-[100px] focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {mediaPreview && (
            <div className="mt-3 relative">
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 rounded-full"
                onClick={handleRemoveMedia}
                type="button"
              >
                <X size={16} />
              </Button>
              {mediaType === 'image' ? (
                <img 
                  src={mediaPreview} 
                  alt="Preview" 
                  className="w-full h-auto rounded-md max-h-[300px] object-contain bg-muted"
                />
              ) : (
                <video 
                  src={mediaPreview} 
                  controls 
                  className="w-full h-auto rounded-md max-h-[300px]" 
                />
              )}
            </div>
          )}

          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleMediaChange(e, 'image')}
          />
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            className="hidden"
            onChange={(e) => handleMediaChange(e, 'video')}
          />
        </CardContent>

        <CardFooter className="px-4 py-3 border-t flex justify-between">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground flex items-center gap-1"
              onClick={() => imageInputRef.current?.click()}
              disabled={!!mediaFile || isSubmitting}
            >
              <Image size={18} />
              Photo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground flex items-center gap-1"
              onClick={() => videoInputRef.current?.click()}
              disabled={!!mediaFile || isSubmitting}
            >
              <Film size={18} />
              Video
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={(!content.trim() && !mediaFile) || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}