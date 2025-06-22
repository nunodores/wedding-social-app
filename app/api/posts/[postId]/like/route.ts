import { NextResponse } from 'next/server';
import { Post, Guest, Like } from '@/lib/models';
import { getSession } from '@/lib/auth-server';
import { sendPostLikeNotification } from '@/lib/firebase-admin';

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const {guest_id, is_liked} = await request.json();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await Post.findByPk(params.postId, {
      include: [{ model: Guest }]
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create the like
    await Like.create({
      guest_id: session.id,
      post_id: params.postId
    });

    // Get the post owner's FCM token
    const postOwner = await Guest.findByPk(post.guest_id)
    
    if (postOwner?.fcm_token && postOwner.id !== session.id) {
      // Send notification to post owner
      await sendPostLikeNotification(
        postOwner.fcm_token,
        session.name
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
