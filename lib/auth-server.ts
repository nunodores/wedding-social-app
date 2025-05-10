import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Guest, WeddingEvent } from './models';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export type { Guest, WeddingEvent };

export async function getSession(): Promise<Guest | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const decoded = verify(token, JWT_SECRET) as { id: string };
    const guest = await Guest.findByPk(decoded.id);
    return guest?.toJSON();
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function signOut() {
  const cookieStore = cookies();
  cookieStore.delete('auth_token');
  return { success: true };
}

export async function verifyEventAccess(slug: string, password: string): Promise<WeddingEvent | null> {
  const event = await WeddingEvent.findOne({ where: { slug } });

  if (!event) return null;

  const passwordValid = await compare(password, event.hashedPassword);
  if (!passwordValid) return null;

  return event.toJSON();
}

export async function signInGuest(email: string, password: string, wedding_event_id: string) {
  const guest = await Guest.findOne({
    where: {
      email,
      wedding_event_id,
    },
  });

  if (!guest) {
    throw new Error('Invalid credentials');
  }

  const passwordValid = await compare(password, guest.hashedPassword);
  if (!passwordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = sign({ id: guest.id }, JWT_SECRET, { expiresIn: '7d' });

  // Set cookie
  const cookieStore = cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return {
    guest: guest.toJSON(),
  };
}

export async function registerGuest(name: string, email: string, password: string, wedding_event_id: string) {
  // Check if guest already exists
  const existingGuest = await Guest.findOne({
    where: {
      email,
      wedding_event_id,
    },
  });

  if (existingGuest) {
    throw new Error('Guest already exists');
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Create guest
  const guest = await Guest.create({
    name,
    email,
    hashedPassword,
    wedding_event_id,
  });

  // Generate JWT token
  const token = sign({ id: guest.id }, JWT_SECRET, { expiresIn: '7d' });

  // Set cookie
  const cookieStore = cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return {
    guest: guest.toJSON(),
  };
}