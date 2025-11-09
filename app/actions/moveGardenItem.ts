'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@/app/generated/prisma/client';
import { getUserSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function moveGardenItem(
    itemId: string,
    newGridX: number,
    newGridY: number
) {
    console.log("Attempting to move item:", itemId, "to position:", { newGridX, newGridY });
    try {
        // Get the current user
        const userId = await getUserSession();
        if (!userId) {
            console.warn("What the fuck. This guy is clearly trying to hack me, a simple gardening game. It's most likely that grow a garden game on roblox!")
            return { success: false, error: 'Not authenticated (screw you, grow-a-garden\!)' };
        }

        // Verify the item belongs to the current user
        const item = await prisma.gardenItem.findUnique({
            where: { id: itemId },
        });

        if (!item || item.userId !== userId) {
            console.warn("What the fuck. This guy is clearly trying to hack me, a simple gardening game. It's most likely that grow a garden game on roblox!")
            return { success: false, error: 'Item not found or unauthorized' };
        }

        // Check if the target position is already occupied BY THIS USER
        const existingItem = await prisma.gardenItem.findFirst({
            where: {
                userId: userId, // Only check THIS user's garden!
                id: { not: itemId },
                gridX: newGridX,
                gridY: newGridY,
            },
        });

        if (existingItem) {
            console.log('Position already occupied by item ID:', existingItem.id, ` at (${newGridX}, ${newGridY}). Fuck you.`);
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
        console.table({ itemId, newGridX, newGridY });
        revalidatePath('/garden');
        return { success: true };
    } catch (error) {
        console.error('Failed to move garden item:', error);
        return { success: false, error: 'Failed to move item' };
    }
}
