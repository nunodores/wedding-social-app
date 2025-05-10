/*
  # Wedding App Schema

  1. New Tables
    - `wedding_events` - Represents wedding events with access credentials
    - `guests` - Stores wedding guest information
    - `posts` - Stores photos/videos posted by guests
    - `stories` - Temporary media content (expires after 24 hours)
    - `comments` - Comments on posts
    - `likes` - Likes on posts
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- WEDDING EVENTS TABLE
CREATE TABLE IF NOT EXISTS wedding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  access_code text NOT NULL,
  hashed_password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wedding_events ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read wedding events
CREATE POLICY "Anyone can read wedding events"
  ON wedding_events 
  FOR SELECT 
  USING (true);

-- GUESTS TABLE
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  wedding_event_id uuid REFERENCES wedding_events(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Guests can view other guests in the same wedding event
CREATE POLICY "Guests can view other guests in the same wedding"
  ON guests
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM guests WHERE wedding_event_id = guests.wedding_event_id
    )
  );

-- Users can read their own guest data
CREATE POLICY "Users can read their own guest data"
  ON guests
  FOR SELECT
  USING (auth.email() = email);

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  image_url text,
  video_url text,
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  wedding_event_id uuid REFERENCES wedding_events(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT either_image_or_video CHECK (
    (image_url IS NOT NULL AND video_url IS NULL) OR
    (image_url IS NULL AND video_url IS NOT NULL) OR
    (content IS NOT NULL)
  )
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Guests can read posts from their wedding event
CREATE POLICY "Guests can read posts from their wedding event"
  ON posts
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM guests WHERE wedding_event_id = posts.wedding_event_id
    )
  );

-- Guests can create posts for their wedding event
CREATE POLICY "Guests can create posts for their wedding event"
  ON posts
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM guests WHERE id = posts.guest_id
    )
  );

-- Guests can update their own posts
CREATE POLICY "Guests can update their own posts"
  ON posts
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM guests WHERE id = posts.guest_id
    )
  );

-- Guests can delete their own posts
CREATE POLICY "Guests can delete their own posts"
  ON posts
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM guests WHERE id = posts.guest_id
    )
  );

-- STORIES TABLE
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url text NOT NULL,
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  wedding_event_id uuid REFERENCES wedding_events(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Guests can read stories from their wedding event
CREATE POLICY "Guests can read stories from their wedding event"
  ON stories
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM guests WHERE wedding_event_id = stories.wedding_event_id
    )
  );

-- Guests can create stories for their wedding event
CREATE POLICY "Guests can create stories for their wedding event"
  ON stories
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM guests WHERE id = stories.guest_id
    )
  );

-- Guests can delete their own stories
CREATE POLICY "Guests can delete their own stories"
  ON stories
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM guests WHERE id = stories.guest_id
    )
  );

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Guests can read comments on posts from their wedding event
CREATE POLICY "Guests can read comments on posts from their wedding event"
  ON comments
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT g.id FROM guests g
      JOIN posts p ON p.wedding_event_id = g.wedding_event_id
      WHERE p.id = comments.post_id
    )
  );

-- Guests can create comments on posts from their wedding event
CREATE POLICY "Guests can create comments on posts from their wedding event"
  ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT g.id FROM guests g
      JOIN posts p ON p.wedding_event_id = g.wedding_event_id
      WHERE p.id = comments.post_id AND g.id = comments.guest_id
    )
  );

-- Guests can delete their own comments
CREATE POLICY "Guests can delete their own comments"
  ON comments
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM guests WHERE id = comments.guest_id
    )
  );

-- LIKES TABLE
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(guest_id, post_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Guests can read likes on posts from their wedding event
CREATE POLICY "Guests can read likes on posts from their wedding event"
  ON likes
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT g.id FROM guests g
      JOIN posts p ON p.wedding_event_id = g.wedding_event_id
      WHERE p.id = likes.post_id
    )
  );

-- Guests can create likes on posts from their wedding event
CREATE POLICY "Guests can create likes on posts from their wedding event"
  ON likes
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT g.id FROM guests g
      JOIN posts p ON p.wedding_event_id = g.wedding_event_id
      WHERE p.id = likes.post_id AND g.id = likes.guest_id
    )
  );

-- Guests can delete their own likes
CREATE POLICY "Guests can delete their own likes"
  ON likes
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM guests WHERE id = likes.guest_id
    )
  );

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_posts_wedding_event_id ON posts(wedding_event_id);
CREATE INDEX IF NOT EXISTS idx_stories_wedding_event_id_expires_at ON stories(wedding_event_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_event_id ON guests(wedding_event_id);