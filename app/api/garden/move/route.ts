import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { getUserSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    console.log('[API /api/garden/move] POST request received');
    
    try {
        const body = await request.json();
        const { itemId, newGridX, newGridY } = body;
        
        console.log('[API /api/garden/move] Request body:', { itemId, newGridX, newGridY });

        if (!itemId || newGridX === undefined || newGridY === undefined) {
            console.warn('[API /api/garden/move] Missing required fields');
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get the current user
        const userId = await getUserSession();
        if (!userId) {
            console.warn('[API /api/garden/move] Unauthorized access attempt');
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        console.log('[API /api/garden/move] User authenticated:', userId);

        // Verify the item belongs to the current user
        const item = await prisma.gardenItem.findUnique({
            where: { id: itemId },
        });

        if (!item || item.userId !== userId) {
            console.warn('[API /api/garden/move] Item not found or unauthorized:', { itemId, userId });
            return NextResponse.json(
                { success: false, error: 'Item not found or unauthorized' },
                { status: 403 }
            );
        }

        // Check if the target position is already occupied BY THIS USER
        const existingItem = await prisma.gardenItem.findFirst({
            where: {
                userId: userId,
                id: { not: itemId },
                gridX: newGridX,
                gridY: newGridY,
            },
        });

        if (existingItem) {
            console.log('[API /api/garden/move] Position already occupied by item:', existingItem.id);
            return NextResponse.json(
                { success: false, error: 'Position already occupied' },
                { status: 409 }
            );
        }

        // Update the item position
        await prisma.gardenItem.update({
            where: { id: itemId },
            data: {
                gridX: newGridX,
                gridY: newGridY,
            },
        });

        console.log('[API /api/garden/move] Successfully moved item:', { itemId, newGridX, newGridY });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API /api/garden/move] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to move item' },
            { status: 500 }
        );
    }
}
