import { NextResponse } from 'next/server';
import { Notification } from '@/lib/models';
import { getSession } from '@/lib/auth-server';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await Notification.update(
      { read_post: true },
      { 
        where: { 
          to_guest_id: session.id,
          read_post: false 
        } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}