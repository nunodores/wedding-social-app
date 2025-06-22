import { NextResponse } from 'next/server';
import { Guest, Notification } from '@/lib/models';
import { getSession } from '@/lib/auth-server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notifications = await Notification.findAll({
      where: { to_guest_id: session.id },
      include: [{
        model: Guest,
        as: 'from',
        attributes: ['name', 'avatar_url'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}