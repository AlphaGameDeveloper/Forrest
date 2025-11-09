import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma/client';
import { getUserSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    console.log('[API /api/tasks] POST request received');
    
    try {
        const body = await request.json();
        const { title } = body;
        
        console.log('[API /api/tasks] Request body:', { title });

        const userId = await getUserSession();
        if (!userId) {
            console.warn('[API /api/tasks] Unauthorized access attempt');
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        if (!title || title.trim().length === 0) {
            console.warn('[API /api/tasks] Task title is required');
            return NextResponse.json(
                { success: false, error: 'Task title is required' },
                { status: 400 }
            );
        }

        console.log('[API /api/tasks] Creating task for user:', userId);

        await prisma.task.create({
            data: {
                userId,
                title: title.trim(),
            },
        });

        console.log('[API /api/tasks] Successfully created task');
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API /api/tasks] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create task' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    console.log('[API /api/tasks] DELETE request received');
    
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('id');
        
        console.log('[API /api/tasks] Request params:', { taskId });

        if (!taskId) {
            console.warn('[API /api/tasks] Task ID is required');
            return NextResponse.json(
                { success: false, error: 'Task ID is required' },
                { status: 400 }
            );
        }

        const userId = await getUserSession();
        if (!userId) {
            console.warn('[API /api/tasks] Unauthorized access attempt');
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        console.log('[API /api/tasks] Deleting task:', { taskId, userId });

        await prisma.task.delete({
            where: { id: taskId, userId },
        });

        console.log('[API /api/tasks] Successfully deleted task');
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API /api/tasks] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}
