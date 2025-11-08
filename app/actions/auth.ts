'use server';

import { redirect } from 'next/navigation';
import { PrismaClient } from '@/app/generated/prisma/client';
import { hashPassword, verifyPassword, setUserSession, clearUserSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function signup(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  if (username.length < 3) {
    return { error: 'Username must be at least 3 characters' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return { error: 'Username already exists' };
  }

  // Create user
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      gardenName: `${username}'s Garden`,
    },
  });

  await setUserSession(user.id);
  redirect('/garden');
}

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { error: 'Invalid username or password' };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: 'Invalid username or password' };
  }

  await setUserSession(user.id);
  redirect('/garden');
}

export async function logout() {
  await clearUserSession();
  redirect('/');
}
