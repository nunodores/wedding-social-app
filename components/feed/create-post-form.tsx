'use client';

import { useState, useRef } from 'react';
import { Image, Film } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPost } from '@/lib/posts';
import { Guest } from '@/lib/auth';
import { toast } from 'sonner';
import { Event } from '@/lib/models';

interface CreatePostFormProps {
  guest: Guest;
  weddingEvent: Event;
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

  const handleSubmit = async () => {
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
    <Card className="w-full shadow-sm border-gray-100">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={guest.avatar_url} alt={guest.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium">
              {guest.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
        
              <Input
                placeholder={`Share a moment from ${weddingEvent.name}...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-0 bg-gray-50 rounded-full px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
          </div>
        </div>

        {mediaPreview && (
          <div className="mt-4 relative">
            <button
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors z-10"
              onClick={handleRemoveMedia}
              type="button"
            >
              ×
            </button>
            {mediaType === 'image' ? (
              <img 
                src={mediaPreview} 
                alt="Preview" 
                className="w-full h-auto rounded-lg max-h-[300px] object-contain bg-gray-100"
              />
            ) : (
              <video 
                src={mediaPreview} 
                controls 
                className="w-full h-auto rounded-lg max-h-[300px]" 
              />
            )}
          </div>
        )}


          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-2   px-3 py-2 rounded-lg font-medium"
                onClick={() => imageInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Image size={20} />
                Photo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-2  px-3 py-2 rounded-lg font-medium"
                onClick={() => videoInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Film size={20} />
                Video
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={(!content.trim() && !mediaFile) || isSubmitting}
              className=" text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>


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
    </Card>
  );
}