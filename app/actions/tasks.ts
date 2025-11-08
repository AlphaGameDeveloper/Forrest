'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@/app/generated/prisma/client';
import { getUserSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function createTask(formData: FormData) {
  const userId = await getUserSession();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  const title = formData.get('title') as string;
  if (!title || title.trim().length === 0) {
    return { error: 'Task title is required' };
  }

  await prisma.task.create({
    data: {
      userId,
      title: title.trim(),
    },
  });

  revalidatePath('/garden');
  return { success: true };
}

export async function completeTask(taskId: string) {
  const userId = await getUserSession();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    return { error: 'Task not found' };
  }

  // Complete the task
  await prisma.task.update({
    where: { id: taskId },
    data: {
      completed: true,
      completedAt: new Date(),
    },
  });

  // Check if there are rocks to remove
  const rocks = await prisma.gardenItem.findMany({
    where: { userId, type: 'rock' },
    orderBy: { createdAt: 'asc' },
    take: 1,
  });

  if (rocks.length > 0) {
    // Remove the oldest rock
    await prisma.gardenItem.delete({
      where: { id: rocks[0].id },
    });
  } else {
    // Add a tree to the garden
    const existingItems = await prisma.gardenItem.findMany({
      where: { userId },
    });

    // Find an empty spot on the grid
    const gridSize = 8;
    let gridX = 0, gridY = 0;
    let found = false;

    for (let y = 0; y < gridSize && !found; y++) {
      for (let x = 0; x < gridSize && !x; x++) {
        const occupied = existingItems.some(item => item.gridX === x && item.gridY === y);
        if (!occupied) {
          gridX = x;
          gridY = y;
          found = true;
          break;
        }
      }
    }

    // Random tree variant (1-4)
    const variant = Math.floor(Math.random() * 4) + 1;

    await prisma.gardenItem.create({
      data: {
        userId,
        type: 'tree',
        variant,
        gridX,
        gridY,
      },
    });
  }

  revalidatePath('/garden');
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const userId = await getUserSession();
  if (!userId) {
    return { error: 'Not authenticated' };
  }

  await prisma.task.delete({
    where: { id: taskId, userId },
  });

  revalidatePath('/garden');
  return { success: true };
}
