// pages/api/posts/create.ts

import { createPost } from '../../../lib/posts'; // server-side code
import { NextResponse } from 'next/server';
import { Guest, Like, Post,Comment} from '@/lib/models';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body)
    const { type, ...payload } = body;
    switch(type) {
      case 'create-post': {
        const { content, wedding_event_id, guest_id, video_url, image_url } = payload;
        const post = await Post.create({
          content,
          image_url,
          video_url,
          guest_id,
          wedding_event_id,
        });
        return NextResponse.json({
          postId: post.id,
          guestId: post.guest_id,
        });
      }
    case 'get-posts': {
      const {wedding_event_id,guest_id}  = payload;
  const posts = await Post.findAll({
    where: { wedding_event_id },
    include: [
      {
        model: Guest,
        attributes: ['name', 'avatar_url'],
      },
      {
        model: Comment,
        separate: true,
      },
      {
        model: Like,
        where: { guest_id },
        required: false,
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return NextResponse.json(posts);
    }
    }
  try {
    const { content, wedding_event_id, guest_id, video_url, image_url } = await req.json();
    const post = await Post.create({
      content,
      image_url,
      video_url,
      guest_id,
      wedding_event_id,
    });
    return NextResponse.json({
      postId: post.id,
      guestId: post.guest_id,
    });
    } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { message: 'Failed to create post' },
      { status: 500 }
    );  }
  
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



