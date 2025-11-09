"use client";
// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import React, { useEffect, useState, useRef } from "react";
export default function GardenName({ user }: { user: { gardenName: string, id: string } }) {
    const [name, setName] = useState(user.gardenName);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setName(user.gardenName);
        setEditValue(user.gardenName);
    }, [user.gardenName]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = async () => {
        const trimmed = editValue.trim();
        if (!trimmed || trimmed === name) {
            setIsEditing(false);
            setEditValue(name);
            return;
        }

        try {
            const response = await fetch('/api/garden/name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gardenName: trimmed }),
            });
            const result = await response.json();

            if (result.success) {
                setName(trimmed);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Failed to update garden name:', error);
            setEditValue(name);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditValue(name);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleCancel}
                className="text-4xl font-bold text-green-800 bg-transparent border-b-2 border-green-600 outline-none px-1"
                style={{ width: `${Math.max(editValue.length, 10)}ch` }}
            />
        );
    }

    return (
        <h1
            className="text-4xl font-bold text-green-800 cursor-pointer hover:opacity-80 transition-opacity"
            role="button"
            tabIndex={0}
            onClick={() => setIsEditing(true)}
            onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsEditing(true);
                }
            }}
        >
            {name}
        </h1>
    );
}