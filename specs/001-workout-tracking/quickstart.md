# Quickstart: Skylifting Development

**Date**: 2026-01-18
**Feature**: 001-workout-tracking

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+
- Modern browser (Chrome, Firefox, Safari, Edge)

## Project Setup

### 1. Initialize the Project

```bash
# Create Vue + TypeScript project with Vite
npm create vite@latest skylifting -- --template vue-ts
cd skylifting

# Install dependencies
npm install

# Install PWA and storage dependencies
npm install idb
npm install -D vite-plugin-pwa
```

### 2. Configure PWA

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Skylifting',
        short_name: 'Skylifting',
        description: 'Track your gym workouts',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
})
```

### 3. Configure Testing

```bash
# Install test dependencies
npm install -D vitest @vue/test-utils jsdom
```

Add to `vite.config.ts`:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  // ... existing config
  test: {
    globals: true,
    environment: 'jsdom',
  }
})
```

Add test script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

## Development Commands

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

After setup, organize the source code:

```
src/
├── components/          # Vue components
│   ├── workout/         # Workout execution
│   ├── routine/         # Routine selection/editing
│   └── history/         # History viewing
├── composables/         # Vue composition functions
│   ├── useRoutines.ts
│   ├── useWorkout.ts
│   └── useHistory.ts
├── db/                  # IndexedDB layer
│   ├── schema.ts        # Database schema
│   └── operations.ts    # CRUD operations
├── data/                # Static data
│   └── templates.ts     # Default routine templates
├── types/               # TypeScript definitions
│   └── index.ts
├── App.vue
└── main.ts
```

## IndexedDB Setup

Create `src/db/schema.ts`:

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SkyLiftingDB extends DBSchema {
  routines: {
    key: string;
    value: Routine;
  };
  workouts: {
    key: string;
    value: Workout;
    indexes: {
      byRoutine: string;
      byRoutinePosition: [string, number];
    };
  };
  exercises: {
    key: string;
    value: Exercise;
    indexes: {
      byWorkout: string;
      byWorkoutPosition: [string, number];
    };
  };
  userState: {
    key: string;
    value: UserState;
  };
  workoutLogs: {
    key: string;
    value: WorkoutLog;
    indexes: {
      byDate: string;
      byWorkoutDate: [string, string];
    };
  };
  setLogs: {
    key: string;
    value: SetLog;
    indexes: {
      byWorkoutLog: string;
    };
  };
}

export async function initDB(): Promise<IDBPDatabase<SkyLiftingDB>> {
  return openDB<SkyLiftingDB>('skylifting-db', 1, {
    upgrade(db) {
      // Create object stores with indexes
      db.createObjectStore('routines', { keyPath: 'id' });

      const workouts = db.createObjectStore('workouts', { keyPath: 'id' });
      workouts.createIndex('byRoutine', 'routineId');
      workouts.createIndex('byRoutinePosition', ['routineId', 'position']);

      const exercises = db.createObjectStore('exercises', { keyPath: 'id' });
      exercises.createIndex('byWorkout', 'workoutId');
      exercises.createIndex('byWorkoutPosition', ['workoutId', 'position']);

      db.createObjectStore('userState', { keyPath: 'id' });

      const workoutLogs = db.createObjectStore('workoutLogs', { keyPath: 'id' });
      workoutLogs.createIndex('byDate', 'date');
      workoutLogs.createIndex('byWorkoutDate', ['workoutId', 'date'], { unique: true });

      const setLogs = db.createObjectStore('setLogs', { keyPath: 'id' });
      setLogs.createIndex('byWorkoutLog', 'workoutLogId');
    }
  });
}
```

## Default Routine Templates

Create `src/data/templates.ts` with at least 3 default routines:

1. **Push/Pull/Legs** (3 workouts)
2. **Upper/Lower** (2 workouts)
3. **Full Body** (3 workouts)

Example structure:

```typescript
export const defaultRoutines = [
  {
    name: 'Push/Pull/Legs',
    description: 'Classic 3-day split targeting push, pull, and leg muscles',
    workouts: [
      {
        name: 'Push Day',
        exercises: [
          { name: 'Bench Press', targetSets: 4, targetReps: 8 },
          { name: 'Overhead Press', targetSets: 3, targetReps: 10 },
          { name: 'Incline Dumbbell Press', targetSets: 3, targetReps: 10 },
          { name: 'Tricep Pushdown', targetSets: 3, targetReps: 12 },
          { name: 'Lateral Raises', targetSets: 3, targetReps: 15 },
        ]
      },
      // ... Pull Day, Legs Day
    ]
  },
  // ... Upper/Lower, Full Body
];
```

## Testing IndexedDB

For testing IndexedDB operations, use `fake-indexeddb`:

```bash
npm install -D fake-indexeddb
```

In tests:

```typescript
import 'fake-indexeddb/auto';
import { initDB } from '../db/schema';

describe('Database operations', () => {
  it('initializes database', async () => {
    const db = await initDB();
    expect(db.name).toBe('skylifting-db');
  });
});
```

## PWA Testing

1. **Build the app**: `npm run build`
2. **Preview**: `npm run preview`
3. **Open DevTools** → Application → Service Workers
4. **Check "Offline"** to test offline mode
5. **Install the PWA** via browser prompt or DevTools

## Mobile Testing

1. Run `npm run dev -- --host` to expose on network
2. Access `http://<your-ip>:5173` from mobile device
3. For HTTPS (required for PWA install), use ngrok or similar

## Next Steps

After setup:

1. Copy type definitions from `specs/001-workout-tracking/contracts/types.ts`
2. Implement database operations per `contracts/operations.ts`
3. Build UI components incrementally per user stories
4. Test offline functionality regularly

## Useful Resources

- [Vue 3 Composition API](https://vuejs.org/guide/introduction.html)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [idb Library](https://github.com/jakearchibald/idb)
- [Vitest](https://vitest.dev/)
