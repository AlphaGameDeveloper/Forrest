// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { CSSProperties } from "react";

interface ImageOverride {
    type: 'tree' | 'big-tree' | 'rock';
    variant: number;
    adjustment: CSSProperties;
}
export const imageOverrides: ImageOverride[] = [
    { type: 'tree', variant: 1, adjustment: { transform: 'translateY(-2.5vh)' } },
    { type: 'tree', variant: 2, adjustment: { transform: 'translateY(-3.5vh)', zIndex: 100 } },
    { type: 'tree', variant: 3, adjustment: { transform: 'translateY(-3.5vh)' } },
    { type: 'tree', variant: 4, adjustment: { transform: 'translateY(-2.5vh)' } },
    { type: 'big-tree', variant: 1, adjustment: { transform: 'translateY(-3.5vh)' } },
    { type: 'big-tree', variant: 2, adjustment: { transform: 'translateY(-3.5vh)' } },
    { type: 'big-tree', variant: 3, adjustment: { transform: 'translateY(-3.5vh)' } },
    { type: 'big-tree', variant: 4, adjustment: { transform: 'translateY(-3.5vh)' } },
];