import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();
  
  if (user) {
    redirect('/garden');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-6xl font-bold text-green-800 mb-4">
          🌲 Forrest 🌲
        </h1>
        <p className="text-xl text-green-700 mb-8">
          Grow your digital garden by completing tasks and staying focused!
        </p>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">How it works:</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🌳</span>
              <p className="text-green-700">
                <strong>Complete tasks</strong> to plant trees in your garden
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-3xl">🌲</span>
              <p className="text-green-700">
                <strong>Finish focus sessions</strong> to grow big trees (bushes)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-3xl">🪨</span>
              <p className="text-green-700">
                <strong>Cancel focus sessions?</strong> Rocks appear in your garden!
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-3xl">✅</span>
              <p className="text-green-700">
                <strong>Remove rocks</strong> by completing more tasks
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-white hover:bg-green-50 text-green-600 font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg border-2 border-green-600"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
