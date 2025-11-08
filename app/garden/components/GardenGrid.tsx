'use client';

import Image from 'next/image';
import { useEffect } from 'react';

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
  
  // Preload all possible images on mount
  useEffect(() => {
    const imagesToPreload = [
      // Trees
      ...Array.from({ length: 4 }, (_, i) => `/images/tree/tree${i + 1}.png`),
      // Big trees
      ...Array.from({ length: 4 }, (_, i) => `/images/big-tree/big-tree${i + 1}.png`),
      // Rocks
      ...Array.from({ length: 9 }, (_, i) => `/images/rock/rock${i + 1}.png`),
    ];

    imagesToPreload.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);
  
  // Create a map of grid positions to items
  const itemMap = new Map<string, GardenItem>();
  items.forEach(item => {
    itemMap.set(`${item.gridX}-${item.gridY}`, item);
  });

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      {/* SVG filter to make white transparent */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="remove-white">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      -1 -1 -1 1 0"
              result="removeWhite"
            />
          </filter>
        </defs>
      </svg>
      
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
                    className="absolute inset-0 flex items-end justify-center"
                    style={{
                      transform: 'rotateZ(-45deg) rotateX(-60deg) translateZ(20px)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="relative w-20 h-24">
                      <Image
                        src={`/images/${item.type}/${item.type}${item.variant}.png`}
                        alt={item.type}
                        fill
                        className="object-contain drop-shadow-lg"
                        quality={90}
                        priority={y < 3 && x < 3}
                        unoptimized
                        style={{
                          imageRendering: 'pixelated',
                        }}
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
