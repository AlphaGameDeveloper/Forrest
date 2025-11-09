# Forrest - AI Coding Agent Instructions

## Project Overview
**Forrest** is a gamified productivity app built with Next.js 16 (React 19) where users grow a 3D isometric garden by completing tasks and focus sessions. Complete tasks → earn trees 🌳. Complete focus sessions → earn big trees 🌲. Cancel focus → get rocks 🪨.

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js Server Actions (no separate API layer for most operations)
- **Database**: SQLite with Prisma ORM
- **Auth**: Cookie-based sessions (manual implementation, no auth library)
- **Styling**: Tailwind + custom 3D CSS transforms for isometric garden

### Key Architectural Decisions

**Prisma Client Location**: Generated to `app/generated/prisma/` (not default `node_modules`). Always import from:
```typescript
import { PrismaClient } from '@/app/generated/prisma/client';
```

**Server Actions Pattern**: Most mutations use Server Actions (`'use server'`) in `app/actions/` instead of API routes. Server Actions call `revalidatePath('/garden')` after mutations to trigger UI updates.

**Authentication Flow**: 
- Cookie-based with `userId` stored in httpOnly cookie
- Helper functions in `lib/auth.ts`: `getUserSession()`, `setUserSession()`, `getCurrentUser()`
- Middleware redirects unauthenticated users (see `middleware.ts`)

**3D Garden Rendering**:
- Pure CSS 3D transforms (`rotateX(60deg) rotateZ(45deg)`) for isometric view
- 8x8 grid with river diagonal (`riverTiles` Set in `GardenGrid.tsx`)
- Drag-and-drop for moving non-rock items with optimistic updates
- Edge lips created with rotated divs for depth illusion

## Critical Workflows

### Development Setup
```bash
npm run dev              # Start dev server on localhost:3000
```

**Database Setup**: 
- Create `.env` file with `DATABASE_URL="file:./dev.db"`
- Prisma migrations already exist in `prisma/migrations/`
- Run `npx prisma migrate dev` if schema changes
- Run `npx prisma studio` to view data

### Adding New Models
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description_of_change`
3. Prisma Client regenerates automatically to `app/generated/prisma/`
4. Import new models from generated client

### Server Action Pattern
```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { getUserSession } from '@/lib/auth';

export async function myAction(data: FormData) {
  const userId = await getUserSession();
  if (!userId) return { error: 'Not authenticated' };
  
  // Do work with Prisma
  
  revalidatePath('/garden');  // Critical for UI updates!
  return { success: true };
}
```

## Project-Specific Conventions

### Garden Mechanics
- **Completing a task**: Removes oldest rock (if any) + adds random tree at random position
- **Completing focus session**: Adds random big-tree at random position  
- **Cancelling focus session**: Adds random rock at random position
- **Grid placement**: Always finds random unoccupied tile in 8x8 grid
- **Rocks are immovable**: Only trees/big-trees can be dragged

### File Organization
- `app/actions/*.ts` - Server Actions for mutations
- `app/api/*/route.ts` - API routes (only used for garden item movement and name updates)
- `app/garden/components/` - Garden page components
- `lib/auth.ts` - Authentication helpers
- `prisma/schema.prisma` - Database schema

### Styling Patterns
- Tailwind 4 (PostCSS plugin, not standalone CLI)
- Mountain background: Layered SVG paths in `app/garden/page.tsx`
- 3D effects: Custom inline styles with `transformStyle: 'preserve-3d'`
- Glass morphism: `backdrop-blur-sm` + `bg-white/80`

### Image Handling
- Static assets in `public/images/`
- Variants: trees (1-4), big-trees (1-4), rocks (1-9), grass (1-3), bird (1-2)
- Image overrides: `app/garden/ImageOverrides.ts` for fine-tuning positions
- Uses `unoptimized` and `imageRendering: 'pixelated'` for pixel art
- Aggressive caching: 1 year TTL (see `next.config.ts` headers)

## Integration Points

### Authentication
- Login/Signup forms POST to Server Actions in `app/actions/auth.ts`
- Session stored in httpOnly cookie (`lib/auth.ts`)
- Protected routes check `getCurrentUser()` and redirect if null

### Garden Updates
- Task completion → `app/actions/tasks.ts` → `completeTask()`
- Focus completion → `app/actions/focus.ts` → `completeFocusSession()`
- Item movement → `app/api/garden/move/route.ts` (uses API route for drag-drop)
- All trigger `revalidatePath('/garden')` to refresh server component

### Database
- Single SQLite file (`dev.db` in root, gitignored)
- All models have `userId` foreign key with `onDelete: Cascade`
- Unique constraint on `GardenItem`: `@@unique([userId, gridX, gridY])`

## Common Pitfalls

1. **Forgetting `revalidatePath()`**: Server Actions won't reflect in UI without it
2. **Wrong Prisma import path**: Must use `@/app/generated/prisma/client`, NOT `@prisma/client`
3. **Hydration errors with random data**: Use `useState` with lazy initializer for client-only randomness (see `birdPositions` in `GardenGrid.tsx`)
4. **3D CSS order**: `transformStyle: 'preserve-3d'` must be on parent of transformed elements
5. **Drag-drop on rocks**: Rocks intentionally have `draggable={false}` and `cursor-default`

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/garden/page.tsx` | Main garden view (server component) |
| `app/garden/components/GardenGrid.tsx` | 3D isometric grid with drag-drop (client component) |
| `lib/auth.ts` | Cookie-based auth helpers |
| `app/actions/tasks.ts` | Task CRUD + tree spawning logic |
| `app/actions/focus.ts` | Focus timer + big-tree/rock spawning |
| `prisma/schema.prisma` | Database models |
| `middleware.ts` | Image caching headers |

## Development Notes

- This was a hackathon project (Mountain Hacks 2025)
- Dev tunnels configured for remote testing (`*.devtunnels.ms` in `next.config.ts`)
- No tests currently implemented
- Birds are purely decorative (not saved to DB, client-side only with mouse avoidance)
