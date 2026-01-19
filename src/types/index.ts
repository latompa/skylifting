/**
 * Skylifting Type Definitions
 *
 * This file defines the TypeScript interfaces for all data entities.
 * These types are the contract between the UI layer and the data layer.
 */

// =============================================================================
// Core Entities
// =============================================================================

/**
 * A workout routine - a collection of workouts to cycle through
 */
export interface Routine {
  /** Unique identifier (UUID) */
  id: string;
  /** Display name (e.g., "Push/Pull/Legs") */
  name: string;
  /** Brief description of the routine */
  description: string;
  /** True for default templates, false for user copies */
  isTemplate: boolean;
  /** Unix timestamp of creation */
  createdAt: number;
}

/**
 * A single workout session template within a routine
 */
export interface Workout {
  /** Unique identifier (UUID) */
  id: string;
  /** Parent routine ID */
  routineId: string;
  /** Display name (e.g., "Push Day", "Workout A") */
  name: string;
  /** Order within routine (0-indexed, determines cycling) */
  position: number;
  /** Unix timestamp of creation */
  createdAt: number;
}

/**
 * An exercise within a workout with prescribed volume
 */
export interface Exercise {
  /** Unique identifier (UUID) */
  id: string;
  /** Parent workout ID */
  workoutId: string;
  /** Exercise name (e.g., "Bench Press") */
  name: string;
  /** Instructions or notes about the exercise (e.g., "Keep elbows tucked, pause at bottom") */
  description?: string;
  /** Number of sets to perform */
  targetSets: number;
  /** Target reps per set */
  targetReps: number;
  /** Order within workout (0-indexed) */
  position: number;
}

// =============================================================================
// User State
// =============================================================================

/**
 * Singleton storing user's current active state
 */
export interface UserState {
  /** Always "user" (singleton key) */
  id: 'user';
  /** Currently active routine ID, or null if none selected */
  activeRoutineId: string | null;
  /** Most recently completed workout ID, or null if none */
  lastWorkoutId: string | null;
  /** Date of last completed workout (ISO date: YYYY-MM-DD), or null */
  lastWorkoutDate: string | null;
}

// =============================================================================
// Workout Logs
// =============================================================================

/**
 * A record of a workout session (completed or in-progress)
 */
export interface WorkoutLog {
  /** Unique identifier (UUID) */
  id: string;
  /** Which workout template was used */
  workoutId: string;
  /** Which routine (denormalized for history queries) */
  routineId: string;
  /** Calendar date of workout (YYYY-MM-DD) */
  date: string;
  /** Where the workout took place (e.g., "LA Fitness", "Home Gym") */
  location?: string;
  /** Unix timestamp when workout was started */
  startedAt: number;
  /** Unix timestamp when finished, or null if in-progress */
  completedAt: number | null;
  /** Whether all exercises have been logged */
  isComplete: boolean;
}

/**
 * A record of one set performed during a workout
 */
export interface SetLog {
  /** Unique identifier (UUID) */
  id: string;
  /** Parent workout log ID */
  workoutLogId: string;
  /** Which exercise this set belongs to */
  exerciseId: string;
  /** Which set number (1-indexed) */
  setNumber: number;
  /** Weight lifted (0 = bodyweight) */
  weight: number;
  /** Actual reps performed (optional) */
  reps?: number;
  /** Freeform notes about how the set felt (e.g., "Felt easy", "Form broke down") */
  notes?: string;
}

// =============================================================================
// Composite Types (for UI convenience)
// =============================================================================

/**
 * Routine with its workouts loaded
 */
export interface RoutineWithWorkouts extends Routine {
  workouts: WorkoutWithExercises[];
}

/**
 * Workout with its exercises loaded
 */
export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[];
}

/**
 * Workout log with its set logs loaded
 */
export interface WorkoutLogWithSets extends WorkoutLog {
  sets: SetLog[];
}

/**
 * Exercise with its most recent logged weight (for display during workout)
 */
export interface ExerciseWithLastWeight extends Exercise {
  /** Most recent weight logged for this exercise, or null if never logged */
  lastWeight: number | null;
  /** Date of last log (YYYY-MM-DD), or null */
  lastLogDate: string | null;
}

// =============================================================================
// Input Types (for creating/updating)
// =============================================================================

/**
 * Input for creating a new routine
 */
export interface CreateRoutineInput {
  name: string;
  description: string;
}

/**
 * Input for creating a new workout
 */
export interface CreateWorkoutInput {
  routineId: string;
  name: string;
  position: number;
}

/**
 * Input for creating a new exercise
 */
export interface CreateExerciseInput {
  workoutId: string;
  name: string;
  description?: string;
  targetSets: number;
  targetReps: number;
  position: number;
}

/**
 * Input for logging a set
 */
export interface LogSetInput {
  workoutLogId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps?: number;
  notes?: string;
}

/**
 * Input for updating exercise volume
 */
export interface UpdateExerciseInput {
  id: string;
  description?: string;
  targetSets?: number;
  targetReps?: number;
  position?: number;
}

// =============================================================================
// Query Result Types
// =============================================================================

/**
 * Result of getting the next suggested workout
 */
export interface NextWorkoutSuggestion {
  /** The workout to do next */
  workout: WorkoutWithExercises;
  /** Position in the cycle (1-indexed for display) */
  cyclePosition: number;
  /** Total workouts in the routine */
  totalInCycle: number;
}

/**
 * History entry for workout log list
 */
export interface WorkoutHistoryEntry {
  /** The workout log */
  log: WorkoutLog;
  /** Name of the workout (denormalized for display) */
  workoutName: string;
  /** Name of the routine (denormalized for display) */
  routineName: string;
  /** Number of exercises logged */
  exerciseCount: number;
}
