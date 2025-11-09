import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { getUserSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    console.log('[API /api/tasks/complete] POST request received');
    
    try {
        const body = await request.json();
        const { taskId } = body;
        
        console.log('[API /api/tasks/complete] Request body:', { taskId });

        const userId = await getUserSession();
        if (!userId) {
            console.warn('[API /api/tasks/complete] Unauthorized access attempt');
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const task = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });

        if (!task) {
            console.warn('[API /api/tasks/complete] Task not found:', { taskId, userId });
            return NextResponse.json(
                { success: false, error: 'Task not found' },
                { status: 404 }
            );
        }

        console.log('[API /api/tasks/complete] Completing task:', taskId);

        // Complete the task
        await prisma.task.update({
            where: { id: taskId },
            data: {
                completed: true,
                completedAt: new Date(),
            },
        });

        console.log('[API /api/tasks/complete] Task completed, checking for rocks to remove');

        // Check if there are rocks to remove
        const rocks = await prisma.gardenItem.findMany({
            where: { userId, type: 'rock' },
            orderBy: { createdAt: 'asc' },
            take: 1,
        });

        if (rocks.length > 0) {
            console.log('[API /api/tasks/complete] Removing oldest rock:', rocks[0].id);
            await prisma.gardenItem.delete({
                where: { id: rocks[0].id },
            });
        } else {
            console.log('[API /api/tasks/complete] No rocks to remove');
        }

        console.log('[API /api/tasks/complete] Finding empty spot for new tree');

        // Add a tree to the garden
        const existingItems = await prisma.gardenItem.findMany({
            where: { userId },
        });

        // Find an empty spot on the grid
        const gridSize = 8;
        let gridX = 0, gridY = 0;

        // Build a set of occupied coordinates for quick lookup
        const occupied = new Set(existingItems.map(item => `${item.gridX},${item.gridY}`));

        // Gather all free spots
        const freeSpots: { x: number; y: number }[] = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (!occupied.has(`${x},${y}`)) {
                    freeSpots.push({ x, y });
                }
            }
        }

        // If there is at least one free spot, pick one at random and create the tree
        if (freeSpots.length > 0) {
            const spot = freeSpots[Math.floor(Math.random() * freeSpots.length)];
            gridX = spot.x;
            gridY = spot.y;

            // Random tree variant (1-4)
            const variant = Math.floor(Math.random() * 4) + 1;

            console.log('[API /api/tasks/complete] Creating new tree:', { gridX, gridY, variant });

            await prisma.gardenItem.create({
                data: {
                    userId,
                    type: 'tree',
                    variant,
                    gridX,
                    gridY,
                },
            });
        } else {
            console.log('[API /api/tasks/complete] No free spots available for new tree');
        }

        console.log('[API /api/tasks/complete] Successfully completed task');
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API /api/tasks/complete] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to complete task' },
            { status: 500 }
        );
    }
}
