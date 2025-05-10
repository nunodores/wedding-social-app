'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Image, Film, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuest } from '@/lib/auth';
import { createPost } from '@/lib/posts';
import { createStory } from '@/lib/stories';
import { toast } from 'sonner';

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guest, setGuest] = useState<any>(null);
  const [weddingEventId, setWeddingEventId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [activeTab, setActiveTab] = useState<'post' | 'story'>('post');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);
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
        setWeddingEventId(currentGuest.wedding_event_id);
      } catch (error) {
        console.error('Error loading create page data:', error);
        toast.error('Failed to load. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any existing media
    if (mediaFile && mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }

    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !weddingEventId || !guest) return;

    setIsSubmitting(true);
    createStory(weddingEventId, guest.id, file)
      .then(() => {
        toast.success('Story uploaded successfully!');
        router.push('/feed');
      })
      .catch(error => {
        console.error('Failed to upload story:', error);
        toast.error('Failed to upload story. Please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
        if (e.target) {
          e.target.value = '';
        }
      });
  };

  const handleRemoveMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmitPost = async () => {
    if ((!content.trim() && !mediaFile) || !weddingEventId || !guest || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPost(
        content,
        weddingEventId,
        guest.id,
        mediaType === 'image' ? mediaFile as File : undefined,
        mediaType === 'video' ? mediaFile as File : undefined
      );

      toast.success('Post created successfully!');
      router.push('/feed');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="post" value={activeTab} onValueChange={(value) => setActiveTab(value as 'post' | 'story')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="post">Create Post</TabsTrigger>
              <TabsTrigger value="story">Add Story</TabsTrigger>
            </TabsList>
            
            <TabsContent value="post">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="resize-none min-h-[100px]"
                  />
                  
                  {mediaPreview && (
                    <div className="relative">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 w-8 h-8 rounded-full"
                        onClick={handleRemoveMedia}
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
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={!!mediaFile || isSubmitting}
                    >
                      <Image size={18} />
                      Add Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={!!mediaFile || isSubmitting}
                    >
                      <Film size={18} />
                      Add Video
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
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleSubmitPost} 
                    disabled={(!content.trim() && !mediaFile) || isSubmitting}
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="story">
              <Card>
                <CardHeader>
                  <CardTitle>Add to Your Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-8 border-2 border-dashed rounded-md border-muted-foreground/30">
                    <div className="mb-4">
                      <Film className="h-12 w-12 mx-auto text-muted-foreground" />
                    </div>
                    <p className="mb-4 text-muted-foreground">
                      Upload a photo or video for your story
                    </p>
                    <Button
                      onClick={() => storyInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Uploading...' : 'Select File'}
                    </Button>
                    <input
                      type="file"
                      ref={storyInputRef}
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleStoryUpload}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Your story will be visible to all wedding guests for 24 hours.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AppLayout>
  );
}