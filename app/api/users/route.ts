import { NextResponse } from 'next/server';
import { Guest } from '@/lib/models';
import { getSession } from '@/lib/auth-server';

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


        return NextResponse.json({
          ...user.toJSON(),
        });
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