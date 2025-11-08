'use client';

import Image from 'next/image';

interface GardenItem {
  id: string;
  type: string;
  variant: number;
  gridX: number;
  gridY: number;
}

interface GardenGridProps {
  items: GardenItem[];
}

export default function GardenGrid({ items }: GardenGridProps) {
  const gridSize = 8;
  
  // Create a map of grid positions to items
  const itemMap = new Map<string, GardenItem>();
  items.forEach(item => {
    itemMap.set(`${item.gridX}-${item.gridY}`, item);
  });

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      <div 
        className="relative w-full h-full"
        style={{
          transform: 'rotateX(60deg) rotateZ(45deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {Array.from({ length: gridSize }).map((_, y) =>
          Array.from({ length: gridSize }).map((_, x) => {
            const item = itemMap.get(`${x}-${y}`);
            
            return (
              <div
                key={`${x}-${y}`}
                className="absolute"
                style={{
                  width: `${100 / gridSize}%`,
                  height: `${100 / gridSize}%`,
                  left: `${(x * 100) / gridSize}%`,
                  top: `${(y * 100) / gridSize}%`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Grass tile */}
                <div
                  className="absolute inset-0 border border-green-600/20"
                  style={{
                    background: (x + y) % 2 === 0 
                      ? 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)'
                      : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  }}
                />
                
                {/* Item on tile */}
                {item && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: 'rotateZ(-45deg) rotateX(-60deg) translateZ(10px)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="relative w-16 h-16">
                      <Image
                        src={`/images/${item.type}/${item.type}${item.variant}.png`}
                        alt={item.type}
                        fill
                        className="object-contain drop-shadow-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
