import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { PrismaClient } from '../generated/prisma/client';
import GardenGrid from './components/GardenGrid';
import TaskList from './components/TaskList';
import FocusTimer from './components/FocusTimer';
import LogoutButton from './components/LogoutButton';
import GardenName from './components/GardenName';

const prisma = new PrismaClient();

export default async function GardenPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const gardenItems = await prisma.gardenItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    trees: gardenItems.filter(item => item.type === 'tree').length,
    bigTrees: gardenItems.filter(item => item.type === 'big-tree').length,
    rocks: gardenItems.filter(item => item.type === 'rock').length,
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-green-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <GardenName user={user} />
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-700">🌳 Trees: {stats.trees}</span>
              <span className="text-green-700">🌲 Big Trees: {stats.bigTrees}</span>
              <span className="text-green-700">🪨 Rocks: {stats.rocks}</span>
            </div>
          </div>
          <LogoutButton />
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Your Garden</h2>
              <GardenGrid items={gardenItems} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Focus Timer</h2>
              <FocusTimer />
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Tasks</h2>
              <TaskList tasks={tasks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
