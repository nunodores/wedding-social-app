import { NextResponse } from 'next/server';
import { Guest, Like, Post, Comment, Notification } from '@/lib/models';
import { Op } from 'sequelize';
import { sendNotification, sendPostCommentNotification, sendPostLikeNotification } from '@/lib/firebase-admin';
import { getSession } from '@/lib/auth-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, ...payload } = body;

    switch (type) {
      case 'create-post': {
        const { content, wedding_event_id, guest_id, video_url, image_url } = payload;
        const post = await Post.create({
          content,
          image_url,
          video_url,
          guest_id,
          wedding_event_id,
        });

        const postWithGuest = await Post.findByPk(post.id, {
          include: [{
            model: Guest,
            attributes: ['id', 'name', 'avatar_url'],
          }],
        });

        return NextResponse.json(postWithGuest);
      }

      case 'get-posts': {
        const { wedding_event_id, guest_id } = payload;
        const posts = await Post.findAll({
          where: { wedding_event_id },
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
          order: [['createdAt', 'DESC']],
        });

        return NextResponse.json(posts);
      }

      case 'get-post': {
        const { post_id, wedding_event_id } = payload;
        const post = await Post.findOne({
          where: { 
            id: post_id,
            wedding_event_id 
          },
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
      }

      case 'add-comment': {
        const { post_id, guest_id, content } = payload;
        const comment = await Comment.create({
          content,
          guest_id,
          post_id,
        });

        const commentWithGuest = await Comment.findByPk(comment.id, {
          include: [
            {
              model: Guest,
              attributes: ['id', 'name', 'avatar_url'],
            },
            {
              model: Post,
              include: [{
                model: Guest,
                attributes: ['id', 'fcm_token'],
              }],
            },
          ],
        });
        
        // Get post owner information and send notification
        const post = await Post.findByPk(post_id);
        if (!post) {
          return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        const postOwner = await Guest.findByPk(post.guest_id);

        const session = await getSession();
        
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
        if (postOwner?.fcm_token && postOwner.id !== session?.id) {
          // Send push notification
          await sendPostCommentNotification(
            postOwner.fcm_token,
            session.name
          );

          // Save notification in database
          await Notification.create({
            to_guest_id: postOwner.id,
            from_guest_id: session?.id || null,
            post_id: post_id,
            type: 'comment',
            read_post: false,
          });
        }

        return NextResponse.json(commentWithGuest);
      }

      case 'toggle-like': {
        const { post_id, guest_id, is_liked, notificationType } = payload;
        const session = await getSession();
        
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
        if (is_liked) {
          await Like.destroy({
            where: {
              post_id,
              guest_id,
            },
          });
          return NextResponse.json({ liked: false });
        } else {
          await Like.create({
            post_id,
            guest_id,
          });

          const post = await Post.findByPk(post_id);
          if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
          }

          const postOwner = await Guest.findByPk(post.guest_id);
    
          if (postOwner?.fcm_token && postOwner.id !== session.id) {
            // Send notification to post owner
            await sendPostLikeNotification(
              postOwner.fcm_token,
              session.name
            );

            // Save notification in the DB
            await Notification.create({
              to_guest_id: postOwner.id,
              from_guest_id: session.id || null,
              post_id: post_id || null,
              type: notificationType,
              read_post: false,
            });
          }
          return NextResponse.json({ liked: true });
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}