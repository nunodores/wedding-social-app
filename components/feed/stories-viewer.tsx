'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Story } from '@/lib/stories';

interface StoryGroup {
  guestId: string;
  guestName: string;
  guestAvatar?: string;
  stories: Story[];
}

interface StoriesViewerProps {
  storyGroups: StoryGroup[];
  initialIndex: number;
  onClose: () => void;
}

export function StoriesViewer({ storyGroups, initialIndex, onClose }: StoriesViewerProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  const isVideo = currentStory && !currentStory.is_image;

  // Function to go to next story
  const goToNextStory = () => {
    if (currentGroup) {
      if (currentStoryIndex < currentGroup.stories.length - 1) {
        // Next story in current group
        setCurrentStoryIndex(currentStoryIndex + 1);
        setProgress(0);
      } else if (currentGroupIndex < storyGroups.length - 1) {
        // First story in next group
        setCurrentGroupIndex(currentGroupIndex + 1);
        setCurrentStoryIndex(0);
        setProgress(0);
      } else {
        // End of all stories
        onClose();
      }
    }
  };

  // Function to go to previous story
  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      // Previous story in current group
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentGroupIndex > 0) {
      // Last story in previous group
      setCurrentGroupIndex(currentGroupIndex - 1);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  };

  // Initialize timer when story changes
  useEffect(() => {
    if (!currentStory) return;
    
    // Clean up previous timer
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setProgress(0);
    
    // For videos, don't use interval timer, use video events instead
    if (isVideo) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(console.error);
      }
      return;
    }
    
    // For images, use interval timer (5 seconds total)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          goToNextStory();
          return 0;
        }
        return prev + 2; // Increase by 2% every 100ms (5 seconds total)
      });
    }, 100);
    
    progressIntervalRef.current = interval;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentGroupIndex, currentStoryIndex]);

  // Video event handlers
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      const calculatedProgress = (currentTime / duration) * 100;
      setProgress(calculatedProgress);
    }
  };

  const handleVideoEnded = () => {
    goToNextStory();
  };

  if (!currentStory) return null;

  return (
    <div className="relative flex flex-col h-full">
      {/* Story header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center">
        <div className="flex-1 flex space-x-3 items-center">
          <Avatar className="h-10 w-10 border border-white/20">
            <AvatarImage src={currentGroup.guestAvatar} alt={currentGroup.guestName} />
            <AvatarFallback>{currentGroup.guestName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-white">{currentGroup.guestName}</div>
            <div className="text-xs text-white/80">
              {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white h-8 w-8"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-16">
        <div className="w-full flex space-x-1">
          {currentGroup.stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              {i === currentStoryIndex && (
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              )}
              {i < currentStoryIndex && (
                <div className="h-full bg-white w-full" />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Story content */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        {currentStory.is_image ? (
          <img 
            src={currentStory.media_url} 
            alt="Story"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentStory.media_url}
            className="max-h-full max-w-full object-contain"
            autoPlay
            playsInline
            muted={false}
            controls={false}
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
          />
        )}
      </div>
      
      {/* Navigation buttons */}
      <button 
        className="absolute left-0 top-0 bottom-0 w-1/4 h-full z-10"
        onClick={goToPreviousStory}
      >
        <ChevronLeft 
          size={36} 
          className="text-white/40 absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity"
        />
      </button>
      <button 
        className="absolute right-0 top-0 bottom-0 w-1/4 h-full z-10"
        onClick={goToNextStory}
      >
        <ChevronRight 
          size={36} 
          className="text-white/40 absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity"
        />
      </button>
    </div>
  );
}