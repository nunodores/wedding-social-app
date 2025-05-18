import { NextResponse } from 'next/server';
import { Guest, Follow } from '@/lib/models';
import { getSession } from '@/lib/auth-server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...payload } = body;

    switch (type) {
      case 'get-user': {
        const { user_id, wedding_event_id } = payload;
        
        // Get current session
        const session = await getSession();
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user data
        const user = await Guest.findOne({
          where: { 
            id: user_id,
            wedding_event_id 
          },
          attributes: ['id', 'name', 'email', 'avatar_url', 'bio', 'wedding_event_id'],
        });

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get follow counts
        const followersCount = await Follow.count({
          where: { following_id: user_id }
        });

        const followingCount = await Follow.count({
          where: { follower_id: user_id }
        });

        // Check if current user follows this user
        const isFollowing = await Follow.findOne({
          where: {
            follower_id: session.id,
            following_id: user_id
          }
        });

        return NextResponse.json({
          ...user.toJSON(),
          followersCount,
          followingCount,
          isFollowing: !!isFollowing
        });
      }

      case 'follow': {
        const { user_id } = payload;
        
        const session = await getSession();
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.id === user_id) {
          return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
        }

        await Follow.create({
          follower_id: session.id,
          following_id: user_id
        });

        return NextResponse.json({ success: true });
      }

      case 'unfollow': {
        const { user_id } = payload;
        
        const session = await getSession();
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await Follow.destroy({
          where: {
            follower_id: session.id,
            following_id: user_id
          }
        });

        return NextResponse.json({ success: true });
      }

      case 'update-profile': {
        const { name, bio, avatar } = payload;
        
        const session = await getSession();
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updateData: any = { name, bio };

        // Upload avatar if provided
        if (avatar) {
     
          updateData.avatar_url = avatar;
        }

        await Guest.update(updateData, {
          where: { id: session.id }
        });

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}