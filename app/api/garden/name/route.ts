import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { getUserSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    console.log('[API /api/garden/name] POST request received');

    try {
        const body = await request.json();
        const { gardenName } = body;

        console.log('[API /api/garden/name] Request body:', { gardenName });

        if (!gardenName || typeof gardenName !== 'string') {
            console.warn('[API /api/garden/name] Invalid garden name');
            return NextResponse.json(
                { success: false, error: 'Invalid garden name' },
                { status: 400 }
            );
        }

        // Get the current user
        const userId = await getUserSession();
        if (!userId) {
            console.warn('[API /api/garden/name] Unauthorized access attempt');
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        console.log('[API /api/garden/name] User authenticated:', userId);

        // Update the garden name
        await prisma.user.update({
            where: { id: userId },
            data: { gardenName: gardenName.trim() },
        });

        console.log('[API /api/garden/name] Successfully updated garden name for user:', userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API /api/garden/name] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update garden name' },
            { status: 500 }
        );
    }
}
