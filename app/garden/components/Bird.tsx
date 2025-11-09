'use client';

import { useEffect, useState } from 'react';

interface BirdProps {
    startX: number;
    startY: number;
    gridSize: number;
    items?: Array<{ gridX: number; gridY: number; type: string }>;
    riverTiles?: Set<string>;
    mousePosition?: { x: number; y: number } | null;
}

type BirdState = 'flying' | 'perching' | 'drinking';

export default function Bird({ startX, startY, gridSize, items = [], riverTiles = new Set(), mousePosition = null }: BirdProps) {
    const [frame, setFrame] = useState(0);
    const [position, setPosition] = useState({ x: startX, y: startY });
    const [targetPosition, setTargetPosition] = useState({ x: startX, y: startY });
    const [birdState, setBirdState] = useState<BirdState>('perching');
    const [isOnWater, setIsOnWater] = useState(false);
    const [spookTimeout, setSpookTimeout] = useState<NodeJS.Timeout | null>(null);
    const [lastSpookTime, setLastSpookTime] = useState(0);

    // Animation frame configuration
    const frameWidth = 32; // Width of each frame in pixels
    const frameHeight = 32; // Height of each frame in pixels

    // Different animations use different rows and frame counts
    const idleFrames = 2; // Row 0 - idle animation (2 frames)
    const flyingFrames = 8; // Row 1 - flying animation (8 frames)
    const drinkingFrames = 3; // Row 2 - eating/drinking animation (3 frames)

    // Animate sprite frames - different speeds and frame counts for different states
    useEffect(() => {
        let frameSpeed: number;
        let maxFrames: number;

        if (birdState === 'flying') {
            frameSpeed = 100;
            maxFrames = flyingFrames;
        } else if (birdState === 'drinking') {
            frameSpeed = 250; // Slower drinking animation
            maxFrames = drinkingFrames;
        } else { // perching/idle
            frameSpeed = 200;
            maxFrames = idleFrames;
        }

        // Reset frame to 0 when state changes to sync animation with behavior
        setFrame(0);

        const frameInterval = setInterval(() => {
            setFrame((prev) => (prev + 1) % maxFrames);
        }, frameSpeed);

        return () => clearInterval(frameInterval);
    }, [birdState, idleFrames, drinkingFrames, flyingFrames]);

    // Check for mouse proximity and spook the bird
    useEffect(() => {
        if (!mousePosition) return;

        // Debounce - don't spook again within 1 second
        const now = Date.now();
        if (now - lastSpookTime < 1000) return;

        // Calculate distance between mouse and bird
        const dx = mousePosition.x - position.x;
        const dy = mousePosition.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Spook distance threshold (in grid units)
        const spookDistance = 1.5;

        if (distance < spookDistance) {
            setLastSpookTime(now);

            // Clear any existing timeout
            if (spookTimeout) {
                clearTimeout(spookTimeout);
            }

            // Fly away to a random spot, preferring away from the cursor
            const awayX = position.x + (position.x - mousePosition.x) * 2;
            const awayY = position.y + (position.y - mousePosition.y) * 2;

            // Clamp to grid bounds
            const targetX = Math.max(0.5, Math.min(gridSize - 0.5, awayX));
            const targetY = Math.max(0.5, Math.min(gridSize - 0.5, awayY));

            setTargetPosition({ x: targetX, y: targetY });
            setBirdState('flying');
            setIsOnWater(false);

            // After flying away, find a new safe spot after a short time
            const timeout = setTimeout(() => {
                // Find a new destination that's far from current position
                let attempts = 0;
                let newX = 0;
                let newY = 0;

                while (attempts < 10) {
                    newX = Math.floor(Math.random() * gridSize);
                    newY = Math.floor(Math.random() * gridSize);

                    const distFromCurrent = Math.sqrt(
                        Math.pow(newX - position.x, 2) + Math.pow(newY - position.y, 2)
                    );

                    if (distFromCurrent > 3) break;
                    attempts++;
                }

                const onWater = riverTiles.has(`${newX}-${newY}`);
                const treeAtLocation = items.find(
                    item => item.gridX === newX && item.gridY === newY &&
                        (item.type === 'tree' || item.type === 'big-tree')
                );

                const heightBonus = treeAtLocation ? 0.8 : 0;
                setTargetPosition({
                    x: newX + 0.5,
                    y: newY + 0.5 + heightBonus
                });
                setIsOnWater(onWater);
            }, 1000);

            setSpookTimeout(timeout);
        }
    }, [mousePosition, position, gridSize, items, riverTiles, spookTimeout, lastSpookTime]);

    // Main bird behavior - choose destination, fly, perch, wait, repeat
    useEffect(() => {
        const chooseNewDestination = () => {
            let newX = 0;
            let newY = 0;
            let attempts = 0;
            let foundPreferredSpot = false;

            // Try to find a tree or water spot (70% chance to prefer these)
            const preferSpecialSpot = Math.random() < 0.7;

            if (preferSpecialSpot) {
                // Try to find a tree or water tile
                while (attempts < 20 && !foundPreferredSpot) {
                    newX = Math.floor(Math.random() * gridSize);
                    newY = Math.floor(Math.random() * gridSize);

                    const isWater = riverTiles.has(`${newX}-${newY}`);
                    const hasTree = items.find(
                        item => item.gridX === newX && item.gridY === newY &&
                            (item.type === 'tree' || item.type === 'big-tree')
                    );

                    if (isWater || hasTree) {
                        foundPreferredSpot = true;
                        break;
                    }
                    attempts++;
                }
            }

            // If no preferred spot found, pick any random tile
            if (!foundPreferredSpot) {
                newX = Math.floor(Math.random() * gridSize);
                newY = Math.floor(Math.random() * gridSize);
            }

            // Check if landing on water
            const onWater = riverTiles.has(`${newX}-${newY}`);

            // Check if there's a tree at this location for extra height
            const treeAtLocation = items.find(
                item => item.gridX === newX && item.gridY === newY &&
                    (item.type === 'tree' || item.type === 'big-tree')
            );

            // Add 0.5 to center the bird on the tile, plus extra height if tree
            const heightBonus = treeAtLocation ? 0.8 : 0;
            setTargetPosition({
                x: newX + 0.5,
                y: newY + 0.5 + heightBonus
            });
            setIsOnWater(onWater);
            setBirdState('flying');
        };

        const checkIfReachedTarget = () => {
            const dx = targetPosition.x - position.x;
            const dy = targetPosition.y - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If close enough to target, start perching or drinking
            if (distance < 0.1 && birdState === 'flying') {
                setPosition({ x: targetPosition.x, y: targetPosition.y });

                // If on water, drink; otherwise perch
                if (isOnWater) {
                    setBirdState('drinking');
                    // Drink for 5-10 seconds then choose new destination
                    const drinkTime = 5000 + Math.random() * 5000;
                    setTimeout(() => {
                        chooseNewDestination();
                    }, drinkTime);
                } else {
                    setBirdState('perching');
                    // Wait for random time (8-15 seconds) then choose new destination
                    const waitTime = 8000 + Math.random() * 7000;
                    setTimeout(() => {
                        chooseNewDestination();
                    }, waitTime);
                }
            }
        };

        const checkInterval = setInterval(checkIfReachedTarget, 100);

        // Start with first destination after a brief delay
        const initialTimeout = setTimeout(() => {
            chooseNewDestination();
        }, 2000 + Math.random() * 3000);

        return () => {
            clearInterval(checkInterval);
            clearTimeout(initialTimeout);
        };
    }, [gridSize, position, targetPosition, birdState, items, riverTiles, isOnWater]);    // Smooth movement towards target when flying
    useEffect(() => {
        if (birdState !== 'flying') return;

        const moveInterval = setInterval(() => {
            setPosition((prev) => {
                const dx = targetPosition.x - prev.x;
                const dy = targetPosition.y - prev.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 0.1) {
                    return prev; // Close enough
                }

                // Move towards target at a consistent speed
                const speed = 0.15; // Much faster speed!
                const moveX = (dx / distance) * speed;
                const moveY = (dy / distance) * speed;

                return {
                    x: prev.x + moveX,
                    y: prev.y + moveY
                };
            });
        }, 50);

        return () => clearInterval(moveInterval);
    }, [birdState, targetPosition]);

    // Calculate which row to show based on state
    const getAnimationRow = () => {
        if (birdState === 'drinking') return 2; // Row 2 - eating/drinking
        if (birdState === 'flying') return 1; // Row 1 - flying
        return 0; // Row 0 - idle/perching
    };

    const currentRow = getAnimationRow();
    const yOffset = currentRow * frameHeight; // Which row in the sprite sheet

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left: `${(position.x * 100) / gridSize}%`,
                top: `${(position.y * 100) / gridSize}%`,
                width: `${100 / gridSize}%`,
                height: `${100 / gridSize}%`,
                transformStyle: 'preserve-3d',
                transition: 'left 0.5s ease-out, top 0.5s ease-out',
            }}
        >
            <div
                className="absolute"
                style={{
                    width: `${frameWidth}px`, // Show one full frame
                    height: `${frameHeight}px`, // Show one full frame height
                    left: '50%',
                    top: '50%',
                    transform: 'rotateZ(-45deg) rotateX(-60deg) translateZ(60px) translate(-50%, -50%) scale(1)',
                    transformStyle: 'preserve-3d',
                    overflow: 'hidden', // Crop to hide other frames
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        width: `${frameWidth * 8}px`, // Full sprite sheet width (8 frames max in row 1)
                        height: `${frameHeight * 3}px`, // Full sprite sheet height (3 rows)
                        backgroundImage: 'url(/images/bird/bird.png)',
                        backgroundPosition: '0 0',
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated',
                        // filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))',
                        transform: `translateX(-${frame * frameWidth}px) translateY(-${yOffset}px)`,
                        transformOrigin: 'top left',
                    }}
                />
            </div>
        </div>
    );
}
