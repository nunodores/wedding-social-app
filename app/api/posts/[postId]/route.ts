import { NextResponse } from 'next/server';
import { Post, Guest, Comment, Like } from '@/lib/models';

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const post = await Post.findByPk(params.postId, {
      include: [
        {
          model: Guest,
          attributes: ['id', 'name', 'avatar_url'],
        },
        {
          model: Comment,
          include: [{
            model: Guest,
            attributes: ['id', 'name', 'avatar_url'],
          }]
        },
        {
          model: Like,
          include: [{
            model: Guest,
            attributes: ['id', 'name', 'avatar_url'],
          }]
        },
      ],
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}