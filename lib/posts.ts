import { Post, Guest, Comment, Like } from './models';
import { pusher } from './pusher';

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
  const posts = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({type:'get-posts',wedding_event_id, guest_id}),
  });
  return await posts.json()
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
  console.log(wedding_event_id)
  
  const post =  await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({type:'create-post', content, wedding_event_id, guest_id, image_url }),
  });

  const postWithGuest = await Post.findByPk(post.id, {
    include: [{
      model: Guest,
      attributes: ['name', 'avatar_url'],
    }],
  });

  // Trigger real-time update
  await pusher.trigger(`wedding-${wedding_event_id}`, 'post-created', {
    post: {
      ...postWithGuest?.toJSON(),
      commentsCount: 0,
      likesCount: 0,
      isLiked: false,
    },
  });

  return {
    ...postWithGuest?.toJSON(),
    commentsCount: 0,
    likesCount: 0,
    isLiked: false,
  };
}

export async function getComments(post_id: string): Promise<Comment[]> {
  const comments = await Comment.findAll({
    where: { post_id },
    include: [{
      model: Guest,
      attributes: ['name', 'avatar_url'],
    }],
    order: [['createdAt', 'ASC']],
  });

  return comments.map(comment => comment.toJSON());
}

export async function addComment(post_id: string, guest_id: string, content: string): Promise<Comment> {
  const comment = await Comment.create({
    content,
    guest_id,
    post_id,
  });

  const commentWithGuest = await Comment.findByPk(comment.id, {
    include: [
      {
        model: Guest,
        attributes: ['name', 'avatar_url'],
      },
      {
        model: Post,
        attributes: ['wedding_event_id'],
      },
    ],
  });

  // Trigger real-time update
  await pusher.trigger(`wedding-${commentWithGuest?.post?.wedding_event_id}`, 'comment-created', {
    comment: commentWithGuest?.toJSON(),
    post_id,
  });

  return commentWithGuest?.toJSON();
}

export async function toggleLike(post_id: string, guest_id: string, isLiked: boolean): Promise<boolean> {
  if (isLiked) {
    const like = await Like.findOne({
      where: {
        post_id,
        guest_id,
      },
      include: [{
        model: Post,
        attributes: ['wedding_event_id'],
      }],
    });

    if (like) {
      await like.destroy();

      // Trigger real-time update
      await pusher.trigger(`wedding-${like.post?.wedding_event_id}`, 'like-removed', {
        post_id,
        guest_id,
      });
    }

    return false;
  } else {
    const like = await Like.create({
      post_id,
      guest_id,
    });

    const likeWithPost = await Like.findByPk(like.id, {
      include: [{
        model: Post,
        attributes: ['wedding_event_id'],
      }],
    });

    // Trigger real-time update
    await pusher.trigger(`wedding-${likeWithPost?.post?.wedding_event_id}`, 'like-added', {
      post_id,
      guest_id,
    });

    return true;
  }
}