import { getDB } from './schema';
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
} from '../types';
import { defaultRoutines } from '../data/templates';

function generateId(): string {
  return crypto.randomUUID();
}

function getISODate(): string {
  return new Date().toISOString().split('T')[0];
}

// =============================================================================
// Routine Operations
// =============================================================================

export async function getAllRoutines(): Promise<Routine[]> {
  const db = await getDB();
  return db.getAll('routines');
}

export async function getRoutineWithWorkouts(routineId: string): Promise<RoutineWithWorkouts | null> {
  const db = await getDB();
  const routine = await db.get('routines', routineId);
  if (!routine) return null;

  const workouts = await db.getAllFromIndex('workouts', 'byRoutine', routineId);
  workouts.sort((a, b) => a.position - b.position);

  const workoutsWithExercises: WorkoutWithExercises[] = await Promise.all(
    workouts.map(async (workout) => {
      const exercises = await db.getAllFromIndex('exercises', 'byWorkout', workout.id);
      exercises.sort((a, b) => a.position - b.position);
      return { ...workout, exercises };
    })
  );

  return { ...routine, workouts: workoutsWithExercises };
}

export async function copyRoutineFromTemplate(templateId: string): Promise<string> {
  const db = await getDB();
  const template = await getRoutineWithWorkouts(templateId);
  if (!template) throw new Error('Template not found');

  const newRoutineId = generateId();
  const now = Date.now();

  const newRoutine: Routine = {
    id: newRoutineId,
    name: template.name,
    description: template.description,
    isTemplate: false,
    createdAt: now,
  };

  const tx = db.transaction(['routines', 'workouts', 'exercises'], 'readwrite');

  await tx.objectStore('routines').add(newRoutine);

  for (const workout of template.workouts) {
    const newWorkoutId = generateId();
    const newWorkout: Workout = {
      id: newWorkoutId,
      routineId: newRoutineId,
      name: workout.name,
      position: workout.position,
      createdAt: now,
    };
    await tx.objectStore('workouts').add(newWorkout);

    for (const exercise of workout.exercises) {
      const newExercise: Exercise = {
        id: generateId(),
        workoutId: newWorkoutId,
        name: exercise.name,
        description: exercise.description,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        position: exercise.position,
      };
      await tx.objectStore('exercises').add(newExercise);
    }
  }

  await tx.done;
  return newRoutineId;
}

export async function createRoutine(input: CreateRoutineInput): Promise<string> {
  const db = await getDB();
  const id = generateId();
  const routine: Routine = {
    id,
    name: input.name,
    description: input.description,
    isTemplate: false,
    createdAt: Date.now(),
  };
  await db.add('routines', routine);
  return id;
}

export async function deleteRoutine(routineId: string): Promise<void> {
  const db = await getDB();

  // Get all workouts and exercises first, before starting transaction
  const workouts = await db.getAllFromIndex('workouts', 'byRoutine', routineId);
  const exercisesToDelete: string[] = [];

  for (const workout of workouts) {
    const exercises = await db.getAllFromIndex('exercises', 'byWorkout', workout.id);
    exercisesToDelete.push(...exercises.map((e) => e.id));
  }

  // Now delete everything in a single transaction
  const tx = db.transaction(['routines', 'workouts', 'exercises'], 'readwrite');

  for (const exerciseId of exercisesToDelete) {
    await tx.objectStore('exercises').delete(exerciseId);
  }
  for (const workout of workouts) {
    await tx.objectStore('workouts').delete(workout.id);
  }
  await tx.objectStore('routines').delete(routineId);

  await tx.done;
}

// =============================================================================
// Workout Operations
// =============================================================================

export async function getWorkoutsByRoutine(routineId: string): Promise<Workout[]> {
  const db = await getDB();
  const workouts = await db.getAllFromIndex('workouts', 'byRoutine', routineId);
  return workouts.sort((a, b) => a.position - b.position);
}

export async function getWorkoutWithExercises(workoutId: string): Promise<WorkoutWithExercises | null> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) return null;

  const exercises = await db.getAllFromIndex('exercises', 'byWorkout', workoutId);
  exercises.sort((a, b) => a.position - b.position);

  return { ...workout, exercises };
}

export async function createWorkout(input: CreateWorkoutInput): Promise<string> {
  const db = await getDB();
  const id = generateId();
  const workout: Workout = {
    id,
    routineId: input.routineId,
    name: input.name,
    position: input.position,
    createdAt: Date.now(),
  };
  await db.add('workouts', workout);
  return id;
}

export async function updateWorkout(
  workoutId: string,
  updates: Partial<Pick<Workout, 'name' | 'position'>>
): Promise<void> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) throw new Error('Workout not found');

  const updated = { ...workout, ...updates };
  await db.put('workouts', updated);
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  const db = await getDB();
  const exercises = await db.getAllFromIndex('exercises', 'byWorkout', workoutId);

  const tx = db.transaction(['workouts', 'exercises'], 'readwrite');

  for (const exercise of exercises) {
    await tx.objectStore('exercises').delete(exercise.id);
  }
  await tx.objectStore('workouts').delete(workoutId);

  await tx.done;
}

// =============================================================================
// Exercise Operations
// =============================================================================

export async function getExercisesByWorkout(workoutId: string): Promise<Exercise[]> {
  const db = await getDB();
  const exercises = await db.getAllFromIndex('exercises', 'byWorkout', workoutId);
  return exercises.sort((a, b) => a.position - b.position);
}

export async function getExercisesWithLastWeights(workoutId: string): Promise<ExerciseWithLastWeight[]> {
  const db = await getDB();
  const exercises = await db.getAllFromIndex('exercises', 'byWorkout', workoutId);
  exercises.sort((a, b) => a.position - b.position);

  const result: ExerciseWithLastWeight[] = await Promise.all(
    exercises.map(async (exercise) => {
      const lastWeightData = await getLastWeightForExercise(exercise.id);
      return {
        ...exercise,
        lastWeight: lastWeightData?.weight ?? null,
        lastLogDate: lastWeightData?.date ?? null,
      };
    })
  );

  return result;
}

export async function createExercise(input: CreateExerciseInput): Promise<string> {
  const db = await getDB();
  const id = generateId();
  const exercise: Exercise = {
    id,
    workoutId: input.workoutId,
    name: input.name,
    description: input.description,
    targetSets: input.targetSets,
    targetReps: input.targetReps,
    position: input.position,
  };
  await db.add('exercises', exercise);
  return id;
}

export async function updateExercise(input: UpdateExerciseInput): Promise<void> {
  const db = await getDB();
  const exercise = await db.get('exercises', input.id);
  if (!exercise) throw new Error('Exercise not found');

  const updated: Exercise = {
    ...exercise,
    ...(input.description !== undefined && { description: input.description }),
    ...(input.targetSets !== undefined && { targetSets: input.targetSets }),
    ...(input.targetReps !== undefined && { targetReps: input.targetReps }),
    ...(input.position !== undefined && { position: input.position }),
  };
  await db.put('exercises', updated);
}

export async function deleteExercise(exerciseId: string): Promise<void> {
  const db = await getDB();
  await db.delete('exercises', exerciseId);
}

export async function reorderExercises(workoutId: string, exerciseIds: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('exercises', 'readwrite');

  for (let i = 0; i < exerciseIds.length; i++) {
    const exercise = await tx.store.get(exerciseIds[i]);
    if (exercise && exercise.workoutId === workoutId) {
      exercise.position = i;
      await tx.store.put(exercise);
    }
  }

  await tx.done;
}

// =============================================================================
// User State Operations
// =============================================================================

export async function getUserState(): Promise<UserState> {
  const db = await getDB();
  let state = await db.get('userState', 'user');

  if (!state) {
    state = {
      id: 'user',
      activeRoutineId: null,
      lastWorkoutId: null,
      lastWorkoutDate: null,
    };
    await db.add('userState', state);
  }

  return state;
}

export async function setActiveRoutine(routineId: string | null): Promise<void> {
  const db = await getDB();
  const state = await getUserState();

  const updated: UserState = {
    ...state,
    activeRoutineId: routineId,
    lastWorkoutId: null, // Reset when changing routines
    lastWorkoutDate: null,
  };

  await db.put('userState', updated);
}

export async function getNextWorkout(): Promise<NextWorkoutSuggestion | null> {
  const state = await getUserState();
  if (!state.activeRoutineId) return null;

  const routine = await getRoutineWithWorkouts(state.activeRoutineId);
  if (!routine || routine.workouts.length === 0) return null;

  const workouts = routine.workouts;
  let nextIndex = 0;

  if (state.lastWorkoutId) {
    const lastIndex = workouts.findIndex((w) => w.id === state.lastWorkoutId);
    if (lastIndex !== -1) {
      nextIndex = (lastIndex + 1) % workouts.length;
    }
  }

  return {
    workout: workouts[nextIndex],
    cyclePosition: nextIndex + 1,
    totalInCycle: workouts.length,
  };
}

// =============================================================================
// Workout Log Operations
// =============================================================================

export async function startWorkout(workoutId: string, location?: string): Promise<string> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) throw new Error('Workout not found');

  const date = getISODate();

  // Check if there's an existing log for this workout on this day
  const existingLogs = await db.getAllFromIndex('workoutLogs', 'byWorkoutDate', [workoutId, date]);

  if (existingLogs.length > 0) {
    // Delete existing incomplete log and its sets
    for (const log of existingLogs) {
      await deleteWorkoutLog(log.id);
    }
  }

  const id = generateId();
  const workoutLog: WorkoutLog = {
    id,
    workoutId,
    routineId: workout.routineId,
    date,
    location,
    startedAt: Date.now(),
    completedAt: null,
    isComplete: false,
  };

  await db.add('workoutLogs', workoutLog);
  return id;
}

export async function getCurrentWorkoutLog(): Promise<WorkoutLogWithSets | null> {
  const db = await getDB();
  const today = getISODate();

  const logs = await db.getAllFromIndex('workoutLogs', 'byDate', today);
  const inProgress = logs.find((log) => !log.isComplete);

  if (!inProgress) return null;

  const sets = await db.getAllFromIndex('setLogs', 'byWorkoutLog', inProgress.id);
  return { ...inProgress, sets };
}

export async function updateWorkoutLogLocation(workoutLogId: string, location: string): Promise<void> {
  const db = await getDB();
  const log = await db.get('workoutLogs', workoutLogId);
  if (!log) throw new Error('Workout log not found');

  const updated: WorkoutLog = { ...log, location };
  await db.put('workoutLogs', updated);
}

export async function completeWorkout(workoutLogId: string): Promise<void> {
  const db = await getDB();
  const log = await db.get('workoutLogs', workoutLogId);
  if (!log) throw new Error('Workout log not found');

  // Update the log
  const updatedLog: WorkoutLog = {
    ...log,
    completedAt: Date.now(),
    isComplete: true,
  };
  await db.put('workoutLogs', updatedLog);

  // Update user state to advance the cycle
  const state = await getUserState();
  const updatedState: UserState = {
    ...state,
    lastWorkoutId: log.workoutId,
    lastWorkoutDate: log.date,
  };
  await db.put('userState', updatedState);
}

export async function getWorkoutHistory(limit?: number): Promise<WorkoutHistoryEntry[]> {
  const db = await getDB();
  const logs = await db.getAllFromIndex('workoutLogs', 'byDate');

  // Sort by date descending
  logs.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.startedAt - a.startedAt;
  });

  // Filter completed logs and apply limit
  const completedLogs = logs.filter((log) => log.isComplete);
  const limitedLogs = limit ? completedLogs.slice(0, limit) : completedLogs;

  const entries: WorkoutHistoryEntry[] = await Promise.all(
    limitedLogs.map(async (log) => {
      const workout = await db.get('workouts', log.workoutId);
      const routine = await db.get('routines', log.routineId);
      const sets = await db.getAllFromIndex('setLogs', 'byWorkoutLog', log.id);

      // Count unique exercises
      const uniqueExercises = new Set(sets.map((s) => s.exerciseId));

      return {
        log,
        workoutName: workout?.name ?? 'Unknown Workout',
        routineName: routine?.name ?? 'Unknown Routine',
        exerciseCount: uniqueExercises.size,
      };
    })
  );

  return entries;
}

export async function getWorkoutLogWithSets(workoutLogId: string): Promise<WorkoutLogWithSets | null> {
  const db = await getDB();
  const log = await db.get('workoutLogs', workoutLogId);
  if (!log) return null;

  const sets = await db.getAllFromIndex('setLogs', 'byWorkoutLog', workoutLogId);
  return { ...log, sets };
}

export async function deleteWorkoutLog(workoutLogId: string): Promise<void> {
  const db = await getDB();
  const sets = await db.getAllFromIndex('setLogs', 'byWorkoutLog', workoutLogId);

  const tx = db.transaction(['workoutLogs', 'setLogs'], 'readwrite');

  for (const set of sets) {
    await tx.objectStore('setLogs').delete(set.id);
  }
  await tx.objectStore('workoutLogs').delete(workoutLogId);

  await tx.done;
}

// =============================================================================
// Set Log Operations
// =============================================================================

export async function logSet(input: LogSetInput): Promise<string> {
  const db = await getDB();
  const id = generateId();
  const setLog: SetLog = {
    id,
    workoutLogId: input.workoutLogId,
    exerciseId: input.exerciseId,
    setNumber: input.setNumber,
    weight: input.weight,
    reps: input.reps,
    notes: input.notes,
  };
  await db.add('setLogs', setLog);
  return id;
}

export async function updateSetLog(
  setLogId: string,
  updates: Partial<Pick<SetLog, 'weight' | 'reps' | 'notes'>>
): Promise<void> {
  const db = await getDB();
  const setLog = await db.get('setLogs', setLogId);
  if (!setLog) throw new Error('Set log not found');

  const updated = { ...setLog, ...updates };
  await db.put('setLogs', updated);
}

export async function deleteSetLog(setLogId: string): Promise<void> {
  const db = await getDB();
  await db.delete('setLogs', setLogId);
}

export async function getLastWeightForExercise(
  exerciseId: string
): Promise<{ weight: number; date: string } | null> {
  const db = await getDB();
  const setLogs = await db.getAllFromIndex('setLogs', 'byExercise', exerciseId);

  if (setLogs.length === 0) return null;

  // Get all workout logs to find dates
  const workoutLogIds = [...new Set(setLogs.map((s) => s.workoutLogId))];
  const workoutLogs: WorkoutLog[] = [];

  for (const logId of workoutLogIds) {
    const log = await db.get('workoutLogs', logId);
    if (log && log.isComplete) {
      workoutLogs.push(log);
    }
  }

  if (workoutLogs.length === 0) return null;

  // Sort by date descending
  workoutLogs.sort((a, b) => b.date.localeCompare(a.date));

  // Find the most recent set for this exercise
  const mostRecentLog = workoutLogs[0];
  const setsFromMostRecent = setLogs
    .filter((s) => s.workoutLogId === mostRecentLog.id)
    .sort((a, b) => a.setNumber - b.setNumber);

  if (setsFromMostRecent.length === 0) return null;

  // Return the first set's weight (typically the working weight)
  return {
    weight: setsFromMostRecent[0].weight,
    date: mostRecentLog.date,
  };
}

// =============================================================================
// Database Operations
// =============================================================================

export async function initializeWithDefaults(): Promise<void> {
  const db = await getDB();

  // Check if already initialized
  const routines = await db.getAll('routines');
  if (routines.length > 0) return;

  const now = Date.now();

  for (const template of defaultRoutines) {
    const routineId = generateId();
    const routine: Routine = {
      id: routineId,
      name: template.name,
      description: template.description,
      isTemplate: true,
      createdAt: now,
    };
    await db.add('routines', routine);

    for (let wi = 0; wi < template.workouts.length; wi++) {
      const workoutTemplate = template.workouts[wi];
      const workoutId = generateId();
      const workout: Workout = {
        id: workoutId,
        routineId,
        name: workoutTemplate.name,
        position: wi,
        createdAt: now,
      };
      await db.add('workouts', workout);

      for (let ei = 0; ei < workoutTemplate.exercises.length; ei++) {
        const exerciseTemplate = workoutTemplate.exercises[ei];
        const exercise: Exercise = {
          id: generateId(),
          workoutId,
          name: exerciseTemplate.name,
          description: exerciseTemplate.description,
          targetSets: exerciseTemplate.targetSets,
          targetReps: exerciseTemplate.targetReps,
          position: ei,
        };
        await db.add('exercises', exercise);
      }
    }
  }

  // Initialize user state
  const state: UserState = {
    id: 'user',
    activeRoutineId: null,
    lastWorkoutId: null,
    lastWorkoutDate: null,
  };
  await db.add('userState', state);
}

export async function isInitialized(): Promise<boolean> {
  const db = await getDB();
  const routines = await db.getAll('routines');
  return routines.length > 0;
}

export async function exportData(): Promise<string> {
  const db = await getDB();

  const data = {
    routines: await db.getAll('routines'),
    workouts: await db.getAll('workouts'),
    exercises: await db.getAll('exercises'),
    userState: await db.getAll('userState'),
    workoutLogs: await db.getAll('workoutLogs'),
    setLogs: await db.getAll('setLogs'),
  };

  return JSON.stringify(data, null, 2);
}

export async function importData(json: string, clearExisting = false): Promise<void> {
  const db = await getDB();
  const data = JSON.parse(json);

  if (clearExisting) {
    const stores = ['routines', 'workouts', 'exercises', 'userState', 'workoutLogs', 'setLogs'] as const;
    for (const store of stores) {
      const tx = db.transaction(store, 'readwrite');
      await tx.store.clear();
      await tx.done;
    }
  }

  // Import in order to respect foreign keys
  for (const routine of data.routines || []) {
    await db.put('routines', routine);
  }
  for (const workout of data.workouts || []) {
    await db.put('workouts', workout);
  }
  for (const exercise of data.exercises || []) {
    await db.put('exercises', exercise);
  }
  for (const state of data.userState || []) {
    await db.put('userState', state);
  }
  for (const log of data.workoutLogs || []) {
    await db.put('workoutLogs', log);
  }
  for (const set of data.setLogs || []) {
    await db.put('setLogs', set);
  }
}
