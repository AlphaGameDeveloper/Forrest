"use client";
import setGardenName from "@/app/actions/setGardenName";
import { User } from "@/app/generated/prisma/client";
// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import React, { useEffect, useState } from "react";
export default function GardenName({ user }: { user: { gardenName: string, id: string } }) {
    const [name, setName] = useState(user.gardenName);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setName(user.gardenName);
    }, [user.gardenName, name]);

    const handleEdit = () => {
        const newName = prompt("Enter new garden name", name);
        if (newName === null) return; // user cancelled
        setGardenName(user.id, newName);
        const trimmed = newName.trim();
        if (trimmed) setName(trimmed);
    };

    return (
        <h1
            className="text-4xl font-bold text-green-800 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={handleEdit}
            onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleEdit();
                }
            }}
        >
            {name}
        </h1>
    );
}