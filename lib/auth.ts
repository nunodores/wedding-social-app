'use client';

import { Guest, Event } from './models';

export type { Guest, Event };

export async function getCurrentGuest(): Promise<Guest | null> {
  try {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error getting current guest:', error);
    return null;
  }
}

export async function getCurrentEvent(): Promise<Event | null> {
  try {
    const response = await fetch('/api/auth/event');
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error getting current event:', error);
    return null;
  }
}

export async function signOut(): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/auth/signout', { method: 'POST' });
    if (!response.ok) throw new Error('Failed to sign out');
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false };
  }
}