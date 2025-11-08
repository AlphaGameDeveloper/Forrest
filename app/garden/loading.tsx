export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🌲</div>
        <h2 className="text-3xl font-bold text-green-800 mb-2">Loading your garden...</h2>
        <p className="text-green-600">Growing trees and arranging rocks</p>
      </div>
    </div>
  );
}
