import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { Event, Guest } from '@/lib/models';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(null);
    }

    // Get the guest to find their wedding event
    const guest = await Guest.findByPk(session.id, {
      include: [{
        model: Event,
        attributes: ['id', 'name', 'primary_color', 'logo_url', 'use_logo_text', 'font_name']
      }]
    });
    const event = await Event.findByPk(guest?.wedding_event_id);
    if (!guest) {
        return NextResponse.json(null);
      }

    if (!event) {
      return NextResponse.json(null);
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Event error:', error);
    return NextResponse.json(null);
  }
}