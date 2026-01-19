# Data Model: Skylifting

**Date**: 2026-01-18
**Feature**: 001-workout-tracking

## Entity Relationship Diagram

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Routine      │ 1───* │    Workout      │ 1───* │    Exercise     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │       │ id              │
│ name            │       │ routineId (FK)  │       │ workoutId (FK)  │
│ description     │       │ name            │       │ name            │
│ isTemplate      │       │ position        │       │ description     │
│ createdAt       │       │ createdAt       │       │ targetSets      │
└─────────────────┘       └─────────────────┘       │ targetReps      │
                                                     │ position        │
                                                     └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   UserState     │       │   WorkoutLog    │ 1───* ┌─────────────────┐
├─────────────────┤       ├─────────────────┤       │    SetLog       │
│ activeRoutineId │       │ id              │       ├─────────────────┤
│ lastWorkoutId   │       │ workoutId (FK)  │       │ id              │
│ lastWorkoutDate │       │ routineId (FK)  │       │ workoutLogId(FK)│
└─────────────────┘       │ date            │       │ exerciseId (FK) │
                          │ location        │       │ setNumber       │
                          │ completedAt     │       │ weight          │
                          │ isComplete      │       │ reps            │
                          └─────────────────┘       │ notes           │
                                                     └─────────────────┘
```

---

## Entities

### Routine

A named collection of workouts designed to be followed cyclically.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, UUID | Unique identifier |
| name | string | Required, max 100 chars | Display name (e.g., "Push/Pull/Legs") |
| description | string | Optional, max 500 chars | Brief description of the routine |
| isTemplate | boolean | Required | True for default templates, false for user copies |
| createdAt | number | Required | Unix timestamp of creation |

**Validation Rules**:
- Name must be non-empty
- User can only have one active routine (enforced at UserState level)

**State Transitions**: None (static after creation, can be deleted)

---

### Workout

A single gym session template within a routine.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, UUID | Unique identifier |
| routineId | string | FK → Routine.id, Required | Parent routine |
| name | string | Required, max 100 chars | Display name (e.g., "Push Day", "Workout A") |
| position | number | Required, >= 0 | Order within routine (0-indexed) |
| createdAt | number | Required | Unix timestamp of creation |

**Validation Rules**:
- Position must be unique within routine
- Position determines cycling order

**Indexes**: `[routineId, position]` for ordered retrieval

---

### Exercise

A specific movement with prescribed volume within a workout.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, UUID | Unique identifier |
| workoutId | string | FK → Workout.id, Required | Parent workout |
| name | string | Required, max 100 chars | Exercise name (e.g., "Bench Press") |
| description | string | Optional, max 500 chars | Instructions or notes about the exercise (e.g., "Keep elbows tucked, pause at bottom") |
| targetSets | number | Required, 1-20 | Number of sets to perform |
| targetReps | number | Required, 1-100 | Target reps per set |
| position | number | Required, >= 0 | Order within workout (0-indexed) |

**Validation Rules**:
- Name comes from predefined list (for initial release)
- Position must be unique within workout
- targetSets and targetReps must be positive integers
- description is optional freeform text for user guidance

**Indexes**: `[workoutId, position]` for ordered retrieval

---

### UserState

Singleton storing user's current active state.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, always "user" | Singleton key |
| activeRoutineId | string \| null | FK → Routine.id | Currently active routine |
| lastWorkoutId | string \| null | FK → Workout.id | Most recently completed workout |
| lastWorkoutDate | string \| null | ISO date string | Date of last completed workout |

**Validation Rules**:
- Only one record exists (singleton pattern)
- activeRoutineId must reference existing routine or be null

**State Transitions**:
- `null → activeRoutineId`: User selects first routine
- `activeRoutineId → different`: User switches routine (resets lastWorkoutId)
- `lastWorkoutId → next`: Advances after workout completion

---

### WorkoutLog

A record of a completed or in-progress workout session.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, UUID | Unique identifier |
| workoutId | string | FK → Workout.id, Required | Which workout template was used |
| routineId | string | FK → Routine.id, Required | Which routine (denormalized for history) |
| date | string | Required, ISO date | Calendar date of workout (YYYY-MM-DD) |
| location | string | Optional, max 100 chars | Where the workout took place (e.g., "LA Fitness", "Home Gym") |
| startedAt | number | Required | Unix timestamp when started |
| completedAt | number \| null | Optional | Unix timestamp when finished |
| isComplete | boolean | Required | Whether all exercises were logged |

**Validation Rules**:
- One log per workout per day (unique constraint on `[workoutId, date]`)
- Starting new workout on same day replaces incomplete session
- location is optional freeform text for gym/location tracking

**Indexes**:
- `date` for history browsing (descending)
- `[workoutId, date]` for uniqueness check

**State Transitions**:
- Created with `isComplete: false` when workout started
- Updated to `isComplete: true, completedAt: timestamp` when finished

---

### SetLog

A record of one set performed during a workout.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, UUID | Unique identifier |
| workoutLogId | string | FK → WorkoutLog.id, Required | Parent workout log |
| exerciseId | string | FK → Exercise.id, Required | Which exercise this set belongs to |
| setNumber | number | Required, >= 1 | Which set (1-indexed) |
| weight | number | Required, >= 0 | Weight lifted (0 = bodyweight) |
| reps | number | Optional, >= 0 | Actual reps performed (optional tracking) |
| notes | string | Optional, max 500 chars | Freeform notes about how the set felt (e.g., "Felt easy", "Form broke down on last rep") |

**Validation Rules**:
- exerciseId must reference an existing Exercise
- Weight can be 0 (bodyweight exercises)
- setNumber should be sequential per exercise within workout
- notes is optional freeform text for user reflection

**Indexes**:
- `workoutLogId` for retrieval with workout log
- `exerciseId` for querying last weight per exercise

---

## IndexedDB Schema

```typescript
// Database name: 'skylifting-db'
// Version: 1

const dbSchema = {
  routines: {
    keyPath: 'id',
    indexes: []
  },
  workouts: {
    keyPath: 'id',
    indexes: [
      { name: 'byRoutine', keyPath: 'routineId' },
      { name: 'byRoutinePosition', keyPath: ['routineId', 'position'] }
    ]
  },
  exercises: {
    keyPath: 'id',
    indexes: [
      { name: 'byWorkout', keyPath: 'workoutId' },
      { name: 'byWorkoutPosition', keyPath: ['workoutId', 'position'] }
    ]
  },
  userState: {
    keyPath: 'id'  // Always 'user'
  },
  workoutLogs: {
    keyPath: 'id',
    indexes: [
      { name: 'byDate', keyPath: 'date' },
      { name: 'byWorkoutDate', keyPath: ['workoutId', 'date'], unique: true }
    ]
  },
  setLogs: {
    keyPath: 'id',
    indexes: [
      { name: 'byWorkoutLog', keyPath: 'workoutLogId' },
      { name: 'byExercise', keyPath: 'exerciseId' }
    ]
  }
};
```

---

## Query Patterns

| Use Case | Query |
|----------|-------|
| Get active routine | `userState.get('user')` → `routines.get(activeRoutineId)` |
| Get workouts in routine | `workouts.index('byRoutinePosition').getAll(IDBKeyRange.bound([routineId, 0], [routineId, Infinity]))` |
| Get exercises in workout | `exercises.index('byWorkoutPosition').getAll(IDBKeyRange.bound([workoutId, 0], [workoutId, Infinity]))` |
| Get next workout (cycling) | Calculate from `userState.lastWorkoutId` + routine's workout count |
| Get last weight for exercise | `setLogs.index('byExercise').getAll(exerciseId)` → sort by workoutLogId desc → first |
| Get workout history | `workoutLogs.index('byDate').getAll()` (descending) |
| Get sets for workout log | `setLogs.index('byWorkoutLog').getAll(workoutLogId)` |

---

## Data Volume Estimates

Assuming 4 workouts/week, 8 exercises/workout, 4 sets/exercise:

| Entity | Records/Year | Record Size | Total/Year |
|--------|--------------|-------------|------------|
| WorkoutLog | ~200 | ~200 bytes | ~40 KB |
| SetLog | ~6,400 | ~100 bytes | ~640 KB |
| **Total history** | | | **<1 MB/year** |

IndexedDB has no practical limit for this volume. Indefinite retention is feasible.
