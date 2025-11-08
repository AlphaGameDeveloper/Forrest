export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-4">
          <span className="text-5xl animate-bounce" style={{ animationDelay: '0ms' }}>🌱</span>
          <span className="text-5xl animate-bounce" style={{ animationDelay: '150ms' }}>🌿</span>
          <span className="text-5xl animate-bounce" style={{ animationDelay: '300ms' }}>🌲</span>
        </div>
        <h2 className="text-3xl font-bold text-green-800">Loading...</h2>
      </div>
    </div>
  );
}
