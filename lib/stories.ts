import { Story } from './models';
import { uploadFile } from './posts';

export type { Story };

export async function getStories(wedding_event_id: string): Promise<Story[]> {
  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'get-stories', wedding_event_id }),
  });
  return response.json();
}

export async function createStory(
  wedding_event_id: string,
  guest_id: string,
  mediaFile: File
): Promise<Story> {
  // Calculate expiration time (24 hours from now)

  // Upload the media file
  const isImage = mediaFile.type.startsWith('image/');
  const media_url = await uploadFile(mediaFile, isImage ? 'image' : 'video');

  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'create-story',
      media_url,
      guest_id,
      wedding_event_id,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create story');
  }

  return response.json();
}

export async function deleteStory(
  story_id: string,
  guest_id: string,
  wedding_event_id: string
): Promise<void> {
  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'delete-story',
      story_id,
      guest_id,
      wedding_event_id,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete story');
  }
}