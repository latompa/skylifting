/**
 * Skylifting Data Operations Contract
 *
 * This file defines the interface for all data operations.
 * The actual implementation will use IndexedDB via the `idb` library.
 *
 * @module operations
 */

import type {
  Routine,
  Workout,
  Exercise,
  UserState,
  WorkoutLog,
  SetLog,
  RoutineWithWorkouts,
  WorkoutWithExercises,
  WorkoutLogWithSets,
  ExerciseWithLastWeight,
  CreateRoutineInput,
  CreateWorkoutInput,
  CreateExerciseInput,
  LogSetInput,
  UpdateExerciseInput,
  NextWorkoutSuggestion,
  WorkoutHistoryEntry,
} from './types';

// =============================================================================
// Routine Operations
// =============================================================================

export interface RoutineOperations {
  /**
   * Get all available routines (templates + user-created)
   */
  getAllRoutines(): Promise<Routine[]>;

  /**
   * Get a routine by ID with all its workouts and exercises
   */
  getRoutineWithWorkouts(routineId: string): Promise<RoutineWithWorkouts | null>;

  /**
   * Create a copy of a template routine for user customization
   * @returns The new routine ID
   */
  copyRoutineFromTemplate(templateId: string): Promise<string>;

  /**
   * Create a new custom routine
   * @returns The new routine ID
   */
  createRoutine(input: CreateRoutineInput): Promise<string>;

  /**
   * Delete a routine and all its workouts/exercises
   */
  deleteRoutine(routineId: string): Promise<void>;
}

// =============================================================================
// Workout Operations
// =============================================================================

export interface WorkoutOperations {
  /**
   * Get all workouts for a routine, ordered by position
   */
  getWorkoutsByRoutine(routineId: string): Promise<Workout[]>;

  /**
   * Get a workout with all its exercises
   */
  getWorkoutWithExercises(workoutId: string): Promise<WorkoutWithExercises | null>;

  /**
   * Add a new workout to a routine
   * @returns The new workout ID
   */
  createWorkout(input: CreateWorkoutInput): Promise<string>;

  /**
   * Update workout name or position
   */
  updateWorkout(workoutId: string, updates: Partial<Pick<Workout, 'name' | 'position'>>): Promise<void>;

  /**
   * Delete a workout and all its exercises
   */
  deleteWorkout(workoutId: string): Promise<void>;
}

// =============================================================================
// Exercise Operations
// =============================================================================

export interface ExerciseOperations {
  /**
   * Get all exercises for a workout, ordered by position
   */
  getExercisesByWorkout(workoutId: string): Promise<Exercise[]>;

  /**
   * Get exercises with their last logged weights (for workout execution)
   */
  getExercisesWithLastWeights(workoutId: string): Promise<ExerciseWithLastWeight[]>;

  /**
   * Add a new exercise to a workout
   * @returns The new exercise ID
   */
  createExercise(input: CreateExerciseInput): Promise<string>;

  /**
   * Update exercise sets, reps, or position
   */
  updateExercise(input: UpdateExerciseInput): Promise<void>;

  /**
   * Delete an exercise
   */
  deleteExercise(exerciseId: string): Promise<void>;

  /**
   * Reorder exercises within a workout
   * @param exerciseIds Array of exercise IDs in new order
   */
  reorderExercises(workoutId: string, exerciseIds: string[]): Promise<void>;
}

// =============================================================================
// User State Operations
// =============================================================================

export interface UserStateOperations {
  /**
   * Get the current user state
   */
  getUserState(): Promise<UserState>;

  /**
   * Set the active routine
   * Resets lastWorkoutId when changing routines
   */
  setActiveRoutine(routineId: string | null): Promise<void>;

  /**
   * Get the next suggested workout based on cycling logic
   * @returns The next workout to do, or null if no active routine
   */
  getNextWorkout(): Promise<NextWorkoutSuggestion | null>;
}

// =============================================================================
// Workout Log Operations
// =============================================================================

export interface WorkoutLogOperations {
  /**
   * Start a new workout session
   * If a workout for the same day exists, replaces it
   * @returns The workout log ID
   */
  startWorkout(workoutId: string): Promise<string>;

  /**
   * Get the current in-progress workout log, if any
   */
  getCurrentWorkoutLog(): Promise<WorkoutLogWithSets | null>;

  /**
   * Mark a workout as complete and update cycling state
   */
  completeWorkout(workoutLogId: string): Promise<void>;

  /**
   * Get workout history, most recent first
   * @param limit Maximum number of entries to return
   */
  getWorkoutHistory(limit?: number): Promise<WorkoutHistoryEntry[]>;

  /**
   * Get a specific workout log with all its sets
   */
  getWorkoutLogWithSets(workoutLogId: string): Promise<WorkoutLogWithSets | null>;

  /**
   * Delete a workout log and its sets
   */
  deleteWorkoutLog(workoutLogId: string): Promise<void>;
}

// =============================================================================
// Set Log Operations
// =============================================================================

export interface SetLogOperations {
  /**
   * Log a set during a workout
   * @returns The set log ID
   */
  logSet(input: LogSetInput): Promise<string>;

  /**
   * Update a logged set (e.g., fix a typo)
   */
  updateSetLog(setLogId: string, updates: Partial<Pick<SetLog, 'weight' | 'reps'>>): Promise<void>;

  /**
   * Delete a logged set
   */
  deleteSetLog(setLogId: string): Promise<void>;

  /**
   * Get the most recent weight logged for an exercise
   */
  getLastWeightForExercise(exerciseName: string): Promise<number | null>;
}

// =============================================================================
// Database Operations
// =============================================================================

export interface DatabaseOperations {
  /**
   * Initialize the database with default routine templates
   * Called on first app launch
   */
  initializeWithDefaults(): Promise<void>;

  /**
   * Check if the database has been initialized
   */
  isInitialized(): Promise<boolean>;

  /**
   * Export all data as JSON (for backup)
   */
  exportData(): Promise<string>;

  /**
   * Import data from JSON (for restore)
   * @param clearExisting If true, clears existing data before import
   */
  importData(json: string, clearExisting?: boolean): Promise<void>;
}

// =============================================================================
// Combined Database Interface
// =============================================================================

/**
 * Complete database interface combining all operations
 */
export interface Database
  extends RoutineOperations,
    WorkoutOperations,
    ExerciseOperations,
    UserStateOperations,
    WorkoutLogOperations,
    SetLogOperations,
    DatabaseOperations {}
