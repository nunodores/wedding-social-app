import { NextResponse } from 'next/server';
import { Guest, Story } from '@/lib/models';
import { Op } from 'sequelize';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, ...payload } = body;

    switch (type) {
      case 'create-story': {
        const { media_url, wedding_event_id, guest_id, expires_at } = payload;
        const story = await Story.create({
          media_url,
          guest_id,
          wedding_event_id,
          expiresAt: expires_at,
        });

        const storyWithGuest = await Story.findByPk(story.id, {
          include: [{
            model: Guest,
            attributes: ['name', 'avatar_url'],
          }],
        });

        return NextResponse.json(storyWithGuest);
      }

      case 'get-stories': {
        const { wedding_event_id } = payload;
        const stories = await Story.findAll({
          where: { 
            wedding_event_id,
            expiresAt: {
              [Op.gt]: new Date(), // Only get non-expired stories
            }
          },
          include: [{
            model: Guest,
            attributes: ['id', 'name', 'avatar_url'],
          }],
          order: [['createdAt', 'DESC']],
        });

        return NextResponse.json(stories);
      }

      case 'delete-story': {
        const { story_id, guest_id, wedding_event_id } = payload;
        
        const story = await Story.findOne({
          where: {
            id: story_id,
            guest_id,
          },
        });

        if (!story) {
          return NextResponse.json(
            { message: 'Story not found or unauthorized' },
            { status: 404 }
          );
        }

        await story.destroy();
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Stories API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}