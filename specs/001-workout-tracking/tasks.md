# Implementation Tasks: Skylifting - Gym Workout Tracker

**Branch**: `001-workout-tracking` | **Date**: 2026-01-18
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Task Overview

| Phase | Tasks | Focus |
|-------|-------|-------|
| Setup | 3 | Project scaffolding, dependencies, PWA config |
| Foundation | 5 | Types, database schema, operations, templates |
| P1 - Execute Workout | 8 | Core workout execution and logging |
| P2 - Select Routine | 4 | Routine browsing and activation |
| P3 - Automatic Cycling | 3 | Workout sequencing logic |
| P4 - Customize Routine | 5 | Exercise editing, add/remove/reorder |
| P5 - View History | 3 | History list and detail views |
| Polish | 3 | PWA icons, offline testing, final cleanup |

---

## Phase: Setup

### TASK-001: Initialize Vue + TypeScript project with Vite
- [x] Create new Vite project with vue-ts template
- [x] Verify TypeScript strict mode enabled in tsconfig.json
- [x] Verify dev server runs successfully

**Files**: `package.json`, `tsconfig.json`, `vite.config.ts`
**Verification**: `npm run dev` starts without errors

---

### TASK-002: Install and configure dependencies
- [x] Install production dependencies: `idb`
- [x] Install dev dependencies: `vite-plugin-pwa`, `vitest`, `@vue/test-utils`, `jsdom`, `fake-indexeddb`
- [x] Add test scripts to package.json

**Files**: `package.json`
**Verification**: `npm install` completes, `npm run test` runs (even if no tests yet)

---

### TASK-003: Configure PWA plugin
- [x] Add VitePWA plugin to vite.config.ts with manifest settings
- [x] Configure workbox for offline asset caching
- [x] Add vitest configuration to vite.config.ts

**Files**: `vite.config.ts`
**Refs**: [quickstart.md](./quickstart.md) PWA configuration section
**Verification**: Build produces service worker file

---

## Phase: Foundation

### TASK-010: Create TypeScript type definitions
- [x] Copy types from contracts/types.ts to src/types/index.ts
- [x] Export all types for use across the application

**Files**: `src/types/index.ts`
**Refs**: [contracts/types.ts](./contracts/types.ts)
**Verification**: Types compile without errors

---

### TASK-011: Implement IndexedDB schema and initialization
- [x] Create database schema with all object stores (routines, workouts, exercises, userState, workoutLogs, setLogs)
- [x] Implement initDB() function with proper indexes
- [x] Handle database versioning

**Files**: `src/db/schema.ts`
**Refs**: [data-model.md](./data-model.md) IndexedDB Schema section
**Verification**: Database initializes in browser DevTools → Application → IndexedDB

---

### TASK-012: Implement database operations
- [x] Implement RoutineOperations (getAllRoutines, getRoutineWithWorkouts, copyRoutineFromTemplate, createRoutine, deleteRoutine)
- [x] Implement WorkoutOperations (getWorkoutsByRoutine, getWorkoutWithExercises, createWorkout, updateWorkout, deleteWorkout)
- [x] Implement ExerciseOperations (getExercisesByWorkout, getExercisesWithLastWeights, createExercise, updateExercise, deleteExercise, reorderExercises)
- [x] Implement UserStateOperations (getUserState, setActiveRoutine, getNextWorkout)
- [x] Implement WorkoutLogOperations (startWorkout, getCurrentWorkoutLog, updateWorkoutLogLocation, completeWorkout, getWorkoutHistory, getWorkoutLogWithSets, deleteWorkoutLog)
- [x] Implement SetLogOperations (logSet, updateSetLog, deleteSetLog, getLastWeightForExercise)
- [x] Implement DatabaseOperations (initializeWithDefaults, isInitialized, exportData, importData)

**Files**: `src/db/operations.ts`
**Refs**: [contracts/operations.ts](./contracts/operations.ts)
**Verification**: Unit tests pass for all operations

---

### TASK-013: Write unit tests for database operations
- [x] Test routine CRUD operations
- [x] Test workout CRUD operations
- [x] Test exercise CRUD operations
- [x] Test set logging and last weight retrieval
- [x] Test workout log lifecycle (start, log sets, complete)
- [x] Test user state transitions

**Files**: `tests/unit/db/operations.test.ts`
**Verification**: `npm run test` passes

---

### TASK-014: Create default routine templates
- [x] Define Push/Pull/Legs template (3 workouts, 5-6 exercises each)
- [x] Define Upper/Lower template (2 workouts, 6-8 exercises each)
- [x] Define Full Body template (3 workouts, 8 exercises each)
- [x] Include target sets and reps for each exercise

**Files**: `src/data/templates.ts`
**Refs**: [quickstart.md](./quickstart.md) Default Routine Templates section
**Verification**: Templates can be inserted into database

---

## Phase: P1 - Execute Workout (Core Value)

**Story**: As a gym-goer, I want to start a workout from my active routine and log the weights I lift for each exercise.

### TASK-100: Create App shell with navigation state || TASK-010
- [x] Set up App.vue with view switching logic (home, workout, history, routine)
- [x] Add basic navigation controls
- [x] Initialize database on app mount

**Files**: `src/App.vue`, `src/main.ts`
**Verification**: App renders with navigation, database initializes

---

### TASK-101: Create Home screen with next workout display || TASK-100
- [x] Show next suggested workout name and position in cycle
- [x] Display "Start Workout" button
- [x] Handle case when no active routine (prompt to select one)

**Files**: `src/components/HomeScreen.vue`
**FR**: FR-005 (display suggested next workout)
**Verification**: Home screen shows next workout or "select routine" prompt

---

### TASK-102: Create useWorkout composable || TASK-012
- [x] Track current workout log state
- [x] Track current exercise index
- [x] Provide methods: startWorkout, logSet, nextExercise, completeWorkout
- [x] Load exercises with last weights on workout start

**Files**: `src/composables/useWorkout.ts`
**Verification**: Composable methods work correctly in tests

---

### TASK-103: Create WorkoutExecution component || TASK-101, TASK-102
- [x] Display current exercise name, target sets/reps
- [x] Display most recent weight logged for exercise (if any)
- [x] Display exercise description/notes if available
- [x] Show set progress (e.g., "Set 2 of 4")

**Files**: `src/components/workout/WorkoutExecution.vue`
**FR**: FR-006, FR-007, FR-008
**Verification**: Exercise displayed with all prescribed info and previous weight

---

### TASK-104: Create SetLogger component || TASK-103
- [x] Weight input field (numeric)
- [x] Optional reps input field
- [x] Optional notes text field
- [x] Log button to save set
- [x] Display logged sets for current exercise

**Files**: `src/components/workout/SetLogger.vue`
**FR**: FR-009
**Verification**: Can input and save weight for a set

---

### TASK-105: Create ExerciseList component || TASK-103
- [x] Show all exercises in workout with completion status
- [x] Allow tapping to jump to specific exercise
- [x] Visual indicator of current exercise

**Files**: `src/components/workout/ExerciseList.vue`
**Verification**: Can see all exercises and navigate between them

---

### TASK-106: Create WorkoutComplete screen || TASK-102
- [x] Summary of completed workout (exercises, sets logged)
- [x] "Finish" button to mark workout complete
- [x] Update user state with completed workout info

**Files**: `src/components/workout/WorkoutComplete.vue`
**FR**: FR-010, FR-011
**Verification**: Completing workout updates lastWorkoutId and saves log

---

### TASK-107: Integration test for P1 flow
- [x] Test: Start workout → log weight for each set → complete workout
- [x] Verify workout log is saved with all sets
- [x] Verify user state updated

**Files**: `tests/integration/workout-execution.test.ts`
**Verification**: Full P1 user journey passes

---

## Phase: P2 - Select Routine

**Story**: As a new user, I want to browse available workout routines and select one to follow.

### TASK-200: Create useRoutines composable || TASK-012
- [x] Load all available routines
- [x] Provide method to activate a routine
- [x] Track active routine state

**Files**: `src/composables/useRoutines.ts`
**Verification**: Can list and activate routines

---

### TASK-201: Create RoutineList component || TASK-200
- [x] Display routine cards with name and description
- [x] Indicate which routine is active (if any)
- [x] Tap to view routine details

**Files**: `src/components/routine/RoutineList.vue`
**FR**: FR-001, FR-002
**Verification**: Routines displayed with active indicator

---

### TASK-202: Create RoutineDetail component || TASK-201
- [x] Show routine name and description
- [x] List all workouts in routine
- [x] Show exercises within each workout (collapsible)
- [x] "Activate" button to set as active routine

**Files**: `src/components/routine/RoutineDetail.vue`
**FR**: FR-003, FR-004
**Verification**: Can browse routine structure and activate it

---

### TASK-203: Integration test for P2 flow
- [x] Test: View routines → inspect detail → activate
- [x] Verify user state updated with activeRoutineId
- [x] Verify home screen shows correct next workout

**Files**: `tests/integration/routine-selection.test.ts`
**Verification**: Full P2 user journey passes

---

## Phase: P3 - Automatic Cycling

**Story**: As a regular gym-goer, I want the app to automatically queue the next workout after completing one.

### TASK-300: Implement getNextWorkout logic || TASK-012
- [x] Calculate next workout based on lastWorkoutId
- [x] Cycle back to first workout after completing last
- [x] Handle edge cases (no history, single workout routine)

**Files**: `src/db/operations.ts` (getNextWorkout)
**FR**: FR-014, FR-015
**Verification**: Unit tests cover all cycling scenarios

---

### TASK-301: Update completeWorkout to advance cycle || TASK-300
- [x] After marking workout complete, update lastWorkoutId
- [x] Update lastWorkoutDate

**Files**: `src/db/operations.ts` (completeWorkout)
**Verification**: Completing workout A causes workout B to be suggested next

---

### TASK-302: Integration test for P3 flow
- [x] Test: Complete workout 1 → verify workout 2 suggested
- [x] Test: Complete last workout → verify workout 1 suggested
- [x] Test: Fresh routine → verify workout 1 suggested

**Files**: `tests/integration/workout-cycling.test.ts`
**FR**: FR-016
**Verification**: Cycling works correctly across multiple sessions

---

## Phase: P4 - Customize Routine

**Story**: As an experienced lifter, I want to edit the exercises, sets, and reps in my routine.

### TASK-400: Create RoutineEditor component || TASK-202
- [x] Display editable list of workouts in routine
- [x] Navigate to workout editor on tap

**Files**: `src/components/routine/RoutineEditor.vue`
**Verification**: Can access editor from routine detail

---

### TASK-401: Create WorkoutEditor component || TASK-400
- [x] Display editable list of exercises
- [x] Edit sets/reps inline
- [x] Edit exercise description

**Files**: `src/components/routine/WorkoutEditor.vue`
**FR**: FR-017
**Verification**: Can change sets/reps and save

---

### TASK-402: Add exercise to workout functionality || TASK-401
- [x] Button to add new exercise
- [x] Exercise name selection (from predefined list)
- [x] Set initial sets/reps

**Files**: `src/components/routine/WorkoutEditor.vue`
**FR**: FR-018
**Verification**: Added exercise appears in workout

---

### TASK-403: Remove and reorder exercise functionality || TASK-401
- [x] Delete button on each exercise
- [x] Drag handle or up/down buttons for reordering
- [x] Confirm before delete

**Files**: `src/components/routine/WorkoutEditor.vue`
**FR**: FR-019, FR-020
**Verification**: Can delete and reorder exercises

---

### TASK-404: Integration test for P4 flow
- [x] Test: Edit sets/reps → verify persisted
- [x] Test: Add exercise → verify appears in workout
- [x] Test: Remove exercise → verify removed
- [x] Test: Reorder → verify new order persisted

**Files**: `tests/integration/routine-customization.test.ts`
**Verification**: Full P4 user journey passes

---

## Phase: P5 - View History

**Story**: As a user tracking my progress, I want to browse my past workouts and see what weights I lifted.

### TASK-500: Create useHistory composable || TASK-012
- [x] Load workout history (most recent first)
- [x] Provide method to load single workout detail
- [x] Support pagination/limit

**Files**: `src/composables/useHistory.ts`
**Verification**: Can fetch workout history

---

### TASK-501: Create HistoryList component || TASK-500
- [x] Display list of past workouts with date and name
- [x] Show location if recorded
- [x] Tap to view details

**Files**: `src/components/history/HistoryList.vue`
**FR**: FR-012
**Verification**: History list displays correctly

---

### TASK-502: Create HistoryDetail component || TASK-501
- [x] Show workout date, name, location
- [x] List all exercises with sets and weights logged
- [x] Display notes for each set

**Files**: `src/components/history/HistoryDetail.vue`
**FR**: FR-013
**Verification**: Can view full details of past workout

---

## Phase: Polish

### TASK-900: Add PWA icons and branding
- [x] Create app icons (192x192, 512x512)
- [x] Add apple-touch-icon
- [x] Update manifest theme colors

**Files**: `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/apple-touch-icon.png`, `public/icon.svg`
**Verification**: PWA installs with correct icon

---

### TASK-901: Offline testing and service worker verification
- [x] Test app works offline after initial load
- [x] Verify all assets cached correctly
- [x] Test IndexedDB operations work offline

**Verification**: App fully functional with network disabled

---

### TASK-902: Final cleanup and build verification
- [x] Remove unused imports and code
- [x] Verify build produces no errors or warnings
- [x] Test production build locally

**Verification**: `npm run build && npm run preview` works correctly

---

## Dependency Graph

```text
Setup: TASK-001 → TASK-002 → TASK-003

Foundation: TASK-003 → TASK-010 → TASK-011 → TASK-012 → TASK-013
                                            ↓
                                      TASK-014

P1 (Execute):     TASK-010 → TASK-100 → TASK-101 → TASK-103 → TASK-104
                  TASK-012 → TASK-102 ↗           ↘ TASK-105
                                                   ↘ TASK-106 → TASK-107

P2 (Select):      TASK-012 → TASK-200 → TASK-201 → TASK-202 → TASK-203

P3 (Cycling):     TASK-012 → TASK-300 → TASK-301 → TASK-302

P4 (Customize):   TASK-202 → TASK-400 → TASK-401 → TASK-402
                                      ↘ TASK-403 → TASK-404

P5 (History):     TASK-012 → TASK-500 → TASK-501 → TASK-502

Polish:           All above → TASK-900, TASK-901, TASK-902
```

## Task Count Summary

| Category | Count |
|----------|-------|
| Setup | 3 |
| Foundation | 5 |
| P1 - Execute Workout | 8 |
| P2 - Select Routine | 4 |
| P3 - Automatic Cycling | 3 |
| P4 - Customize Routine | 5 |
| P5 - View History | 3 |
| Polish | 3 |
| **Total** | **34** |
