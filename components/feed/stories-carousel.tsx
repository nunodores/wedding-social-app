'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Story, createStory } from '@/lib/stories';
import { Guest, WeddingEvent } from '@/lib/auth';
import { StoriesViewer } from './stories-viewer';
import { toast } from 'sonner';

interface StoriesCarouselProps {
  stories: Story[];
  currentGuest: Guest;
  weddingEvent: WeddingEvent;
  onStoryCreated: () => void;
}

export function StoriesCarousel({ 
  stories, 
  currentGuest,
  weddingEvent,
  onStoryCreated 
}: StoriesCarouselProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const storyFileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group stories by guest
  const guestStories: Record<string, Story[]> = {};
  stories.forEach(story => {
    if (!guestStories[story.guest_id]) {
      guestStories[story.guest_id] = [];
    }
    guestStories[story.guest_id].push(story);
  });

  const guestStoriesList = Object.entries(guestStories).map(([guestId, stories]) => ({
    guestId,
    guestName: stories[0].guest?.name || 'Guest',
    guestAvatar: stories[0].guest?.avatar_url,
    stories,
  }));

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await createStory(weddingEvent.id, currentGuest.id, file);
      toast.success('Story uploaded successfully!');
      onStoryCreated();
    } catch (error) {
      console.error('Failed to upload story:', error);
      toast.error('Failed to upload story. Please try again.');
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleViewStory = (storyGroupIndex: number) => {
    setSelectedStoryIndex(storyGroupIndex);
    setIsViewerOpen(true);
  };

  return (
    <div className="relative mt-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Stories</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full" orientation="horizontal">
        <div 
          ref={scrollRef}
          className="flex space-x-4 pb-2 pt-1 px-1"
          style={{ width: 'max-content' }}
        >
          {/* Add story button */}
          <div className="flex flex-col items-center space-y-1">
            <Button
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-full relative border-dashed border-2"
              onClick={() => storyFileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Plus size={24} />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                  <div className="h-4 w-4 border-2 border-t-transparent animate-spin rounded-full" />
                </div>
              )}
            </Button>
            <span className="text-xs font-medium">Add Story</span>
            <input
              type="file"
              ref={storyFileInputRef}
              accept="image/*,video/*"
              className="hidden"
              onChange={handleStoryUpload}
            />
          </div>

          {/* Story avatars */}
          {guestStoriesList.map((storyGroup, index) => (
            <div key={storyGroup.guestId} className="flex flex-col items-center space-y-1">
              <button
                className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center"
                onClick={() => handleViewStory(index)}
              >
                <Avatar className="h-full w-full border-2 border-background">
                  <AvatarImage src={storyGroup.guestAvatar} alt={storyGroup.guestName} />
                  <AvatarFallback>{storyGroup.guestName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </button>
              <span className="text-xs font-medium truncate max-w-[64px] text-center">
                {storyGroup.guestId === currentGuest.id ? 'Your Story' : storyGroup.guestName}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Stories viewer dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-md p-0 h-[80vh] max-h-[600px] overflow-hidden">
          {isViewerOpen && guestStoriesList.length > 0 && (
            <StoriesViewer
              storyGroups={guestStoriesList}
              initialIndex={selectedStoryIndex}
              onClose={() => setIsViewerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}