"use server";
// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { PrismaClient } from '@/app/generated/prisma/client';
const prisma = new PrismaClient();
export default async function setGardenName(userId: string, gardenName: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { gardenName }
    });
}