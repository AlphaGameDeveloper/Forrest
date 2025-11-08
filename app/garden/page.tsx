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
    <div className="min-h-screen relative overflow-hidden p-4">
      {/* Layered Mountain Background */}
      <div className="fixed inset-0 -z-10">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-sky-300 via-sky-200 to-sky-100"></div>

        {/* Far mountains */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
            <path d="M0,600 L0,300 L200,150 L400,250 L600,100 L800,200 L1000,150 L1200,250 L1200,600 Z"
              fill="#8B9DC3" opacity="0.6" />
          </svg>
        </div>

        {/* Middle mountains */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path d="M0,400 L0,250 L150,120 L350,180 L550,80 L750,160 L950,100 L1200,200 L1200,400 Z"
              fill="#6B7A99" opacity="0.7" />
          </svg>
        </div>

        {/* Near mountains with snow caps */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <path d="M0,300 L0,200 L200,50 L400,150 L600,30 L800,120 L1000,80 L1200,180 L1200,300 Z"
              fill="#4A5A78" />
            {/* Snow caps */}
            <path d="M200,50 L230,80 L170,80 Z M600,30 L640,70 L560,70 Z M1000,80 L1035,115 L965,115 Z"
              fill="#FFFFFF" opacity="0.9" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div>
            <GardenName user={user} />
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-700 font-semibold">🌳 Trees: {stats.trees}</span>
              <span className="text-green-700 font-semibold">🌲 Big Trees: {stats.bigTrees}</span>
              <span className="text-green-700 font-semibold">🪨 Rocks: {stats.rocks}</span>
            </div>
          </div>
          <LogoutButton />
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-8">
              <GardenGrid items={gardenItems} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border-4 border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <span>⏱️</span> Focus Timer
              </h2>
              <FocusTimer />
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border-4 border-purple-200">
              <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                <span>✅</span> Tasks
              </h2>
              <TaskList tasks={tasks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
