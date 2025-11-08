'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { moveGardenItem } from '@/app/actions/moveGardenItem';
import { imageOverrides } from '../ImageOverrides';

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
  const [draggedItem, setDraggedItem] = useState<GardenItem | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
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

  const handleDragStart = (item: GardenItem) => {
    // Only allow dragging if it's not a rock
    if (item.type !== 'rock') {
      setDraggedItem(item);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = async (x: number, y: number) => {
    if (!draggedItem) return;

    // Don't allow dropping on the same position
    if (draggedItem.gridX === x && draggedItem.gridY === y) {
      setDraggedItem(null);
      return;
    }

    // Check if there's already an item at this position
    if (itemMap.has(`${x}-${y}`)) {
      setDraggedItem(null);
      return;
    }

    // Move the item
    await moveGardenItem(draggedItem.id, x, y);
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    setHoveredTile({ x, y });
  };

  const handleDragLeave = () => {
    setHoveredTile(null);
  };

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
            const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;

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
                onDragOver={(e) => handleDragOver(e, x, y)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(x, y)}
              >
                {/* Grass tile */}
                <div
                  className="absolute inset-0 border border-green-600/20 transition-colors duration-200"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)'
                      : (x + y) % 2 === 0
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
                    draggable={item.type !== 'rock'}
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={handleDragEnd}
                  >

                    <div
                      className={`relative w-20 h-24 ${item.type !== 'rock' ? 'cursor-move' : 'cursor-default'}`}
                      style={imageOverrides.find(override => override.type === item.type && override.variant === item.variant)?.adjustment}
                    >
                      <Image
                        src={`/images/${item.type}/${item.type}${item.variant}.png?nukeTheCache=0`}
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
