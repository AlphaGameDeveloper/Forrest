'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@/app/generated/prisma/client';
import { getUserSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function startFocusSession(duration: number) {
  const userId = await getUserSession();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  const session = await prisma.focusSession.create({
    data: {
      userId,
      duration,
    },
  });

  return { success: true, sessionId: session.id };
}

export async function completeFocusSession(sessionId: string) {
  const userId = await getUserSession();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  const session = await prisma.focusSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    return { error: 'Session not found' };
  }

  // Complete the session
  await prisma.focusSession.update({
    where: { id: sessionId },
    data: {
      completed: true,
      completedAt: new Date(),
    },
  });

  // Add a bush (big-tree) to the garden
  const existingItems = await prisma.gardenItem.findMany({
    where: { userId },
  });

  const gridSize = 8;
  let gridX = 0, gridY = 0;
  let found = false;

  for (let y = 0; y < gridSize && !found; y++) {
    for (let x = 0; x < gridSize && !found; x++) {
      const occupied = existingItems.some(item => item.gridX === x && item.gridY === y);
      if (!occupied) {
        gridX = x;
        gridY = y;
        found = true;
        break;
      }
    }
  }

  const variant = Math.floor(Math.random() * 4) + 1;

  await prisma.gardenItem.create({
    data: {
      userId,
      type: 'big-tree',
      variant,
      gridX,
      gridY,
    },
  });

  revalidatePath('/garden');
  return { success: true };
}

export async function cancelFocusSession(sessionId: string) {
  const userId = await getUserSession();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  const session = await prisma.focusSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    return { error: 'Session not found' };
  }

  // Mark as cancelled
  await prisma.focusSession.update({
    where: { id: sessionId },
    data: {
      cancelled: true,
    },
  });

  // Add a rock to the garden
  const existingItems = await prisma.gardenItem.findMany({
    where: { userId },
  });

  const gridSize = 8;
  let gridX = 0, gridY = 0;
  let found = false;

  for (let y = 0; y < gridSize && !found; y++) {
    for (let x = 0; x < gridSize && !found; x++) {
      const occupied = existingItems.some(item => item.gridX === x && item.gridY === y);
      if (!occupied) {
        gridX = x;
        gridY = y;
        found = true;
        break;
      }
    }
  }

  const variant = Math.floor(Math.random() * 9) + 1;

  await prisma.gardenItem.create({
    data: {
      userId,
      type: 'rock',
      variant,
      gridX,
      gridY,
    },
  });

  revalidatePath('/garden');
  return { success: true };
}
