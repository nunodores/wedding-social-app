import { Post, Guest, Comment, Like } from './models';

export type { Post, Comment, Like };

export async function uploadFile(file: File, type: 'image' | 'video'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  const data = await response.json();
  return data.url;
}

export async function getPosts(wedding_event_id: string, guest_id: string): Promise<Post[]> {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'get-posts', wedding_event_id, guest_id }),
  });
  return response.json();
}

export async function createPost(
  content: string,
  wedding_event_id: string,
  guest_id: string,
  imageFile?: File,
  videoFile?: File
): Promise<Post> {
  let image_url: string | undefined;
  let video_url: string | undefined;

  if (imageFile) {
    image_url = await uploadFile(imageFile, 'image');
  }

  if (videoFile) {
    video_url = await uploadFile(videoFile, 'video');
  }

  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'create-post',
      content,
      wedding_event_id,
      guest_id,
      image_url,
      video_url,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  const data = await response.json();
  return data;
}

export async function addComment(post_id: string, guest_id: string, content: string): Promise<Comment> {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'add-comment',
      post_id,
      guest_id,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add comment');
  }

  const data = await response.json();
  return data;
}

export async function toggleLike(post_id: string, guest_id: string, is_liked: boolean): Promise<boolean> {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'toggle-like',
      post_id,
      guest_id,
      is_liked,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to toggle like');
  }

  const data = await response.json();
  return data.liked;
}