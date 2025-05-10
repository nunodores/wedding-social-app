import { Story, Guest } from './models';
import { pusher } from './pusher';
import { uploadFile } from './posts';

export type { Story };

export async function getStories(wedding_event_id: string): Promise<Story[]> {
  const stories = await Story.findAll({
    where: {
      wedding_event_id,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
    include: [{
      model: Guest,
      attributes: ['name', 'avatar_url'],
    }],
    order: [['createdAt', 'DESC']],
  });

  return stories.map(story => ({
    ...story.toJSON(),
    isImage: story.media_url.match(/\.(jpeg|jpg|gif|png)$/i) !== null,
  }));
}

export async function createStory(
  wedding_event_id: string,
  guest_id: string,
  mediaFile: File
): Promise<Story> {
  // Calculate expiration time (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Upload the media file
  const isImage = mediaFile.type.startsWith('image/');
  const media_url = await uploadFile(mediaFile, isImage ? 'image' : 'video');

  const story = await Story.create({
    media_url,
    guest_id,
    wedding_event_id,
    expiresAt,
  });

  const storyWithGuest = await Story.findByPk(story.id, {
    include: [{
      model: Guest,
      attributes: ['name', 'avatar_url'],
    }],
  });

  const storyData = {
    ...storyWithGuest?.toJSON(),
    isImage,
  };

  // Trigger real-time update
  await pusher.trigger(`wedding-${wedding_event_id}`, 'story-created', {
    story: storyData,
  });

  return storyData;
}

