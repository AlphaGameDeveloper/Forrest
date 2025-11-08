'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
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
  const [optimisticUpdate, setOptimisticUpdate] = useState<{ id: string; x: number; y: number } | null>(null);
  const gridSize = 8;
  const lipHorizontalOffset = -16; // Controls the horizontal Z-axis offset for lip edges (negative = inward)
  const lipVerticalOffset = 0 - 17; // Controls the vertical Y-axis offset for lip edges (negative = down, positive = up)

  // Define river positions (diagonal river flowing through the garden)
  const riverTiles = new Set<string>([
    '0-2', '1-2', '1-3', '2-3', '2-4', '3-4', '3-5', '4-5', '4-6', '5-6', '5-7', '6-7'
  ]);

  // Apply optimistic update to items
  const displayItems = useMemo(() => {
    if (!optimisticUpdate) return items;

    return items.map(item =>
      item.id === optimisticUpdate.id
        ? { ...item, gridX: optimisticUpdate.x, gridY: optimisticUpdate.y }
        : item
    );
  }, [items, optimisticUpdate]);

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
  displayItems.forEach(item => {
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

    // Don't allow dropping on river tiles
    if (riverTiles.has(`${x}-${y}`)) {
      setDraggedItem(null);
      return;
    }

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

    // Set optimistic update immediately for instant UI feedback
    setOptimisticUpdate({ id: draggedItem.id, x, y });
    setDraggedItem(null);

    // Then update the server in the background
    await moveGardenItem(draggedItem.id, x, y);

    // Clear optimistic update once server responds (successfully or not)
    setOptimisticUpdate(null);

    // Note: No need to revert on failure since the server will send fresh data
    // and our optimisticUpdate will be cleared, showing the real server state
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
        {/* Vertical waterfall tiles at (5,7) and (6,7) - actual 3D vertical surfaces */}
        {[5, 6].map((xPos) => (
          <div
            key={`waterfall-${xPos}`}
            className="absolute"
            style={{
              width: `${100 / 8}%`,
              height: `${100 / 8}%`,
              left: `${(xPos * 100) / 8}%`,
              top: `${(7 * 100) / 8}%`,
              transformStyle: 'preserve-3d',
              pointerEvents: 'none',
            }}
          >
            {/* The actual vertical tile face - rotated 90 degrees to be vertical */}
            <div
              className="absolute"
              style={{
                width: '100%',
                height: '200%', // Height of the vertical wall
                bottom: 0,
                left: 0,
                backgroundColor: '#4A9EDA',
                transformOrigin: 'bottom center',
                transform: 'rotateX(90deg)', // Makes it vertical!
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              {/* Animated waterfall effect on the vertical surface */}
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${i * 30}%`,
                    top: 0,
                    width: '20%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(255, 255, 255, 0.4) 100%)',
                    opacity: 0.6,
                    animation: `waterfall ${1.2 + i * 0.2}s linear infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}

              {/* White water splash at the bottom */}
              <div
                className="absolute"
                style={{
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '15%',
                  background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 40%, rgba(255, 255, 255, 0.3) 70%, transparent 100%)',
                  animation: 'splash 1s ease-in-out infinite',
                }}
              />

              {/* Additional splashing particles */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={`splash-${i}`}
                  className="absolute"
                  style={{
                    bottom: '0%',
                    left: `${20 + i * 20}%`,
                    width: '15%',
                    height: '10%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.7)',
                    animation: `splash ${0.8 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>

            {/* BIG white water splash BELOW the waterfall tile - on the ground */}
            <div
              className="absolute"
              style={{
                bottom: '-100%', // Position it at the bottom of the vertical tile
                left: '-50%',
                width: '200%',
                height: '100%',
                transformOrigin: 'top center',
                transform: 'rotateX(90deg)', // Make it horizontal like a puddle
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {/* Main splash cloud */}
              <div
                className="absolute"
                style={{
                  top: '-200%',
                  left: '20%',
                  width: '60%',
                  height: '70%',
                  background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
                  animation: 'splash 0.7s ease-in-out infinite',
                  borderRadius: '50%',
                }}
              />

              {/* Additional splashing particles around the main splash */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={`splash-ground-${i}`}
                  className="absolute"
                  style={{
                    top: `${-225 + (i % 3) * 20}%`,
                    left: `${10 + i * 13}%`,
                    width: '20%',
                    height: '30%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.85)',
                    animation: `splash ${0.6 + i * 0.08}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        {Array.from({ length: gridSize }).map((_, y) =>
          Array.from({ length: gridSize }).map((_, x) => {
            const item = itemMap.get(`${x}-${y}`);
            const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
            const isRiver = riverTiles.has(`${x}-${y}`);
            const isEdge = x === 0 || x === gridSize - 1 || y === 0 || y === gridSize - 1;
            const isWaterfallTile = (x === 5 || x === 6) && y === 7;

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
                {/* Grass or River tile */}
                <div
                  title={`Tile @ (${x},${y})`}
                  className="absolute inset-0 border transition-colors duration-200"
                  style={{
                    backgroundSize: "cover",
                    background: isRiver
                      ? '#4A9EDA' // Solid blue for river
                      : isHovered
                        ? 'url(/images/grass/grass3.png?nukeTheCache=2)'
                        : (x + y) % 2 === 0
                          ? 'url(/images/grass/grass1.png?nukeTheCache=1)'
                          : 'url(/images/grass/grass2.png?nukeTheCache=0)',
                    borderColor: isRiver ? 'rgba(59, 130, 246, 0.3)' : 'rgba(22, 163, 74, 0.2)',
                  }}
                />

                {/* Small vertical lip on outer edges (not on waterfall tiles) */}
                {isEdge && !isWaterfallTile && (
                  <>
                    {/* Bottom edge lip - Southwest (works perfectly) */}
                    {y === gridSize - 1 && (
                      <div
                        className="absolute"
                        style={{
                          width: '100%',
                          height: '20%',
                          bottom: 0,
                          left: 0,
                          backgroundSize: 'cover',
                          background: isRiver
                            ? '#4A9EDA'
                            : (x + y) % 2 === 0
                              ? 'url(/images/grass/grass1.png?nukeTheCache=1)'
                              : 'url(/images/grass/grass2.png?nukeTheCache=0)',
                          transformOrigin: 'top center',
                          transform: `rotateX(90deg) translateZ(${lipHorizontalOffset}px) translateY(${lipVerticalOffset}px)`,
                          borderTop: '1px solid rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    )}
                    {/* Right edge lip - Southeast (was pushed forward, needs translateX instead) */}
                    {x === gridSize - 1 && (
                      <div
                        className="absolute"
                        style={{
                          width: '20%',
                          height: '100%',
                          top: 0,
                          right: 0,
                          backgroundSize: 'cover',
                          background: isRiver
                            ? '#4A9EDA'
                            : (x + y) % 2 === 0
                              ? 'url(/images/grass/grass1.png?nukeTheCache=1)'
                              : 'url(/images/grass/grass2.png?nukeTheCache=0)',
                          transformOrigin: 'center left',
                          transform: `rotateY(-90deg) translateZ(${lipHorizontalOffset}px) translateX(${lipVerticalOffset}px)`,
                          borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    )}
                    {/* Left edge lip - Northwest (was pushed away, needs negative translateX) */}
                    {x === 0 && (
                      <div
                        className="absolute"
                        style={{
                          width: '20%',
                          height: '100%',
                          top: 0,
                          left: 0,
                          backgroundSize: 'cover',
                          background: isRiver
                            ? '#4A9EDA'
                            : (x + y) % 2 === 0
                              ? 'url(/images/grass/grass1.png?nukeTheCache=1)'
                              : 'url(/images/grass/grass2.png?nukeTheCache=0)',
                          transformOrigin: 'center right',
                          transform: `rotateY(90deg) translateZ(${lipHorizontalOffset}px) translateX(${-lipVerticalOffset}px)`,
                          borderRight: '1px solid rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    )}
                    {/* Top edge lip - Northeast (was pushed up, needs negative translateY) */}
                    {y === 0 && (
                      <div
                        className="absolute"
                        style={{
                          width: '100%',
                          height: '20%',
                          top: 0,
                          left: 0,
                          backgroundSize: 'cover',
                          background: isRiver
                            ? '#4A9EDA'
                            : (x + y) % 2 === 0
                              ? 'url(/images/grass/grass1.png?nukeTheCache=1)'
                              : 'url(/images/grass/grass2.png?nukeTheCache=0)',
                          transformOrigin: 'bottom center',
                          transform: `rotateX(-90deg) translateZ(${lipHorizontalOffset}px) translateY(${-lipVerticalOffset}px)`,
                          borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    )}
                  </>
                )}

                {/* Item on tile */}
                {item && !isRiver && (
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
                      title={`Type: ${item.type}, Variant: ${item.variant} (DB: ${item.id} @ ${item.gridX},${item.gridY})`}
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
