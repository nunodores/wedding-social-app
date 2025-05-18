import { NextResponse } from 'next/server';
import { Notification } from '@/lib/models';
import { getSession } from '@/lib/auth-server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await Notification.count({
      where: {
        to_guest_id: session.id,
        read_post: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}