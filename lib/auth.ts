import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@/app/generated/prisma/client';

const prisma = new PrismaClient();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function setUserSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set('userId', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function getUserSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('userId');
  return userIdCookie?.value || null;
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
}

export async function getCurrentUser() {
  const userId = await getUserSession();
  if (!userId) return null;
  
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, createdAt: true, gardenName: true },
  });
}
