import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  Routine,
  Workout,
  Exercise,
  UserState,
  WorkoutLog,
  SetLog,
} from '../types';

export interface SkyLiftingDB extends DBSchema {
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
      byExercise: string;
    };
  };
}

const DB_NAME = 'skylifting-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<SkyLiftingDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<SkyLiftingDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<SkyLiftingDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Routines store
      if (!db.objectStoreNames.contains('routines')) {
        db.createObjectStore('routines', { keyPath: 'id' });
      }

      // Workouts store
      if (!db.objectStoreNames.contains('workouts')) {
        const workouts = db.createObjectStore('workouts', { keyPath: 'id' });
        workouts.createIndex('byRoutine', 'routineId');
        workouts.createIndex('byRoutinePosition', ['routineId', 'position']);
      }

      // Exercises store
      if (!db.objectStoreNames.contains('exercises')) {
        const exercises = db.createObjectStore('exercises', { keyPath: 'id' });
        exercises.createIndex('byWorkout', 'workoutId');
        exercises.createIndex('byWorkoutPosition', ['workoutId', 'position']);
      }

      // User state store
      if (!db.objectStoreNames.contains('userState')) {
        db.createObjectStore('userState', { keyPath: 'id' });
      }

      // Workout logs store
      if (!db.objectStoreNames.contains('workoutLogs')) {
        const workoutLogs = db.createObjectStore('workoutLogs', { keyPath: 'id' });
        workoutLogs.createIndex('byDate', 'date');
        workoutLogs.createIndex('byWorkoutDate', ['workoutId', 'date'], { unique: true });
      }

      // Set logs store
      if (!db.objectStoreNames.contains('setLogs')) {
        const setLogs = db.createObjectStore('setLogs', { keyPath: 'id' });
        setLogs.createIndex('byWorkoutLog', 'workoutLogId');
        setLogs.createIndex('byExercise', 'exerciseId');
      }
    },
  });

  return dbInstance;
}

export async function getDB(): Promise<IDBPDatabase<SkyLiftingDB>> {
  if (!dbInstance) {
    return initDB();
  }
  return dbInstance;
}

export async function resetDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export async function deleteDB(): Promise<void> {
  await resetDB();
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve(); // Treat blocked as success for tests
  });
}
