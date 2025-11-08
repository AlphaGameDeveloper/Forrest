'use client';

import { useEffect, useState } from 'react';

interface BirdProps {
    startX: number;
    startY: number;
    gridSize: number;
}

export default function Bird({ startX, startY, gridSize }: BirdProps) {
    const [frame, setFrame] = useState(0);
    const [position, setPosition] = useState({ x: startX, y: startY });
    const totalFrames = 4; // Assuming 4 frames in the sprite sheet
    const frameWidth = 32; // Width of each frame in pixels
    const frameHeight = 32; // Height of each frame in pixels

    // Animate sprite frames
    useEffect(() => {
        const frameInterval = setInterval(() => {
            setFrame((prev) => (prev + 1) % totalFrames);
        }, 150); // Change frame every 150ms

        return () => clearInterval(frameInterval);
    }, [totalFrames]);

    // Animate bird position
    useEffect(() => {
        const moveInterval = setInterval(() => {
            setPosition((prev) => {
                // Random movement
                const dx = (Math.random() - 0.5) * 2;
                const dy = (Math.random() - 0.5) * 2;

                // Keep bird within grid bounds with some padding
                const newX = Math.max(0.5, Math.min(gridSize - 0.5, prev.x + dx));
                const newY = Math.max(0.5, Math.min(gridSize - 0.5, prev.y + dy));

                return { x: newX, y: newY };
            });
        }, 2000); // Move every 2 seconds

        return () => clearInterval(moveInterval);
    }, [gridSize]);

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left: `${(position.x * 100) / gridSize}%`,
                top: `${(position.y * 100) / gridSize}%`,
                width: `${100 / gridSize}%`,
                height: `${100 / gridSize}%`,
                transformStyle: 'preserve-3d',
                transition: 'left 2s ease-in-out, top 2s ease-in-out',
            }}
        >
            <div
                className="absolute"
                style={{
                    width: `${frameWidth / 2}px`, // Crop width to show one bird
                    height: `${frameHeight / 3}px`, // Crop height to middle third
                    left: '50%',
                    top: '50%',
                    transform: 'rotateZ(-45deg) rotateX(-60deg) translateZ(60px) translate(-50%, -50%) scale(2)', // Scale AFTER cropping
                    transformStyle: 'preserve-3d',
                    overflow: 'hidden', // Crop to hide other frames
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        width: `${frameWidth * totalFrames}px`, // Full sprite sheet width
                        height: `${frameHeight}px`,
                        backgroundImage: 'url(/images/bird/bird.png)',
                        backgroundPosition: '0 0',
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated',
                        filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))',
                        transform: `translateX(-${frame * frameWidth}px) translateY(-${frameHeight / 3}px)`, // Shift horizontally for frame and vertically to show middle
                        transformOrigin: 'top left',
                    }}
                />
            </div>
        </div>
    );
}
