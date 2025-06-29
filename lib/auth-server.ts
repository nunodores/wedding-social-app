'use server';

import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Guest, Event } from './models';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;

export async function getSession() {
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

export async function verifyEventAccess(event_code: string, hashed_password: string) {
  const event = await Event.findOne({ where: { event_code } });

  if (!event) return null;
  
  const passwordValid = await compare(hashed_password, event.hashed_password);
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

  const passwordValid = await compare(password, guest.hashed_password);
  if (!passwordValid) {
    throw new Error('Invalid credentials');
  }

  const token = sign({ id: guest.id }, JWT_SECRET, { expiresIn: '7d' });

  const cookieStore = cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return {
    guest: guest.toJSON(),
  };
}

export async function registerGuest(name: string, email: string, password: string, wedding_event_id: string) {
  const existingGuest = await Guest.findOne({
    where: {
      email,
      wedding_event_id,
    },
  });

  if (existingGuest) {
    throw new Error('Guest already exists');
  }

  const hashed_password = await hash(password, 12);

  const guest = await Guest.create({
    id: crypto.randomUUID(),
    name,
    email,
    hashed_password,
    wedding_event_id,
  });

  const token = sign({ id: guest.id }, JWT_SECRET, { expiresIn: '7d' });

  const cookieStore = cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return {
    guest: guest.toJSON(),
  };
}