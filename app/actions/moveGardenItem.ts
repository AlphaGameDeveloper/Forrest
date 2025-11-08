'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@/app/generated/prisma/client';

const prisma = new PrismaClient();

export async function moveGardenItem(
    itemId: string,
    newGridX: number,
    newGridY: number
) {
    try {
        // Check if the target position is already occupied
        const existingItem = await prisma.gardenItem.findFirst({
            where: {
                id: { not: itemId },
                gridX: newGridX,
                gridY: newGridY,
            },
        });

        if (existingItem) {
            return { success: false, error: 'Position already occupied' };
        }

        // Update the item position
        await prisma.gardenItem.update({
            where: { id: itemId },
            data: {
                gridX: newGridX,
                gridY: newGridY,
            },
        });

        revalidatePath('/garden');
        return { success: true };
    } catch (error) {
        console.error('Failed to move garden item:', error);
        return { success: false, error: 'Failed to move item' };
    }
}
