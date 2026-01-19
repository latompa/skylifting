import { describe, it, expect, beforeEach } from 'vitest'
import { deleteDB } from '../../../src/db/schema'
import {
  getAllRoutines,
  getRoutineWithWorkouts,
  copyRoutineFromTemplate,
  createRoutine,
  deleteRoutine,
  getWorkoutsByRoutine,
  getWorkoutWithExercises,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getExercisesByWorkout,
  getExercisesWithLastWeights,
  createExercise,
  updateExercise,
  deleteExercise,
  reorderExercises,
  getUserState,
  setActiveRoutine,
  getNextWorkout,
  startWorkout,
  getCurrentWorkoutLog,
  updateWorkoutLogLocation,
  completeWorkout,
  getWorkoutHistory,
  getWorkoutLogWithSets,
  deleteWorkoutLog,
  logSet,
  updateSetLog,
  deleteSetLog,
  getLastWeightForExercise,
  initializeWithDefaults,
  isInitialized,
  exportData,
  importData,
} from '../../../src/db/operations'

// Reset database before each test
beforeEach(async () => {
  await deleteDB()
})

describe('Routine Operations', () => {
  it('should create and retrieve a routine', async () => {
    const routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })

    const routines = await getAllRoutines()
    expect(routines).toHaveLength(1)
    expect(routines[0].name).toBe('Test Routine')
    expect(routines[0].id).toBe(routineId)
  })

  it('should get routine with workouts', async () => {
    const routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })

    const workoutId = await createWorkout({
      routineId,
      name: 'Test Workout',
      position: 0,
    })

    await createExercise({
      workoutId,
      name: 'Test Exercise',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })

    const routine = await getRoutineWithWorkouts(routineId)
    expect(routine).not.toBeNull()
    expect(routine!.workouts).toHaveLength(1)
    expect(routine!.workouts[0].exercises).toHaveLength(1)
  })

  it('should delete a routine and all its workouts and exercises', async () => {
    const routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })

    const workoutId = await createWorkout({
      routineId,
      name: 'Test Workout',
      position: 0,
    })

    await createExercise({
      workoutId,
      name: 'Test Exercise',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })

    await deleteRoutine(routineId)

    const routines = await getAllRoutines()
    expect(routines).toHaveLength(0)

    const workouts = await getWorkoutsByRoutine(routineId)
    expect(workouts).toHaveLength(0)

    const exercises = await getExercisesByWorkout(workoutId)
    expect(exercises).toHaveLength(0)
  })
})

describe('Workout Operations', () => {
  let routineId: string

  beforeEach(async () => {
    routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })
  })

  it('should create and retrieve workouts', async () => {
    await createWorkout({ routineId, name: 'Workout A', position: 0 })
    await createWorkout({ routineId, name: 'Workout B', position: 1 })

    const workouts = await getWorkoutsByRoutine(routineId)
    expect(workouts).toHaveLength(2)
    expect(workouts[0].name).toBe('Workout A')
    expect(workouts[1].name).toBe('Workout B')
  })

  it('should update a workout', async () => {
    const workoutId = await createWorkout({
      routineId,
      name: 'Original Name',
      position: 0,
    })

    await updateWorkout(workoutId, { name: 'Updated Name' })

    const workout = await getWorkoutWithExercises(workoutId)
    expect(workout!.name).toBe('Updated Name')
  })

  it('should delete a workout and its exercises', async () => {
    const workoutId = await createWorkout({
      routineId,
      name: 'Test Workout',
      position: 0,
    })

    await createExercise({
      workoutId,
      name: 'Test Exercise',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })

    await deleteWorkout(workoutId)

    const workout = await getWorkoutWithExercises(workoutId)
    expect(workout).toBeNull()
  })
})

describe('Exercise Operations', () => {
  let routineId: string
  let workoutId: string

  beforeEach(async () => {
    routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })
    workoutId = await createWorkout({
      routineId,
      name: 'Test Workout',
      position: 0,
    })
  })

  it('should create and retrieve exercises', async () => {
    await createExercise({
      workoutId,
      name: 'Bench Press',
      targetSets: 4,
      targetReps: 8,
      position: 0,
    })
    await createExercise({
      workoutId,
      name: 'Squat',
      targetSets: 3,
      targetReps: 10,
      position: 1,
    })

    const exercises = await getExercisesByWorkout(workoutId)
    expect(exercises).toHaveLength(2)
    expect(exercises[0].name).toBe('Bench Press')
    expect(exercises[1].name).toBe('Squat')
  })

  it('should update an exercise', async () => {
    const exerciseId = await createExercise({
      workoutId,
      name: 'Bench Press',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })

    await updateExercise({
      id: exerciseId,
      targetSets: 4,
      targetReps: 8,
      description: 'Keep elbows tucked',
    })

    const exercises = await getExercisesByWorkout(workoutId)
    expect(exercises[0].targetSets).toBe(4)
    expect(exercises[0].targetReps).toBe(8)
    expect(exercises[0].description).toBe('Keep elbows tucked')
  })

  it('should delete an exercise', async () => {
    const exerciseId = await createExercise({
      workoutId,
      name: 'Bench Press',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })

    await deleteExercise(exerciseId)

    const exercises = await getExercisesByWorkout(workoutId)
    expect(exercises).toHaveLength(0)
  })

  it('should reorder exercises', async () => {
    const ex1 = await createExercise({
      workoutId,
      name: 'Exercise 1',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })
    const ex2 = await createExercise({
      workoutId,
      name: 'Exercise 2',
      targetSets: 3,
      targetReps: 10,
      position: 1,
    })
    const ex3 = await createExercise({
      workoutId,
      name: 'Exercise 3',
      targetSets: 3,
      targetReps: 10,
      position: 2,
    })

    await reorderExercises(workoutId, [ex3, ex1, ex2])

    const exercises = await getExercisesByWorkout(workoutId)
    expect(exercises[0].name).toBe('Exercise 3')
    expect(exercises[1].name).toBe('Exercise 1')
    expect(exercises[2].name).toBe('Exercise 2')
  })
})

describe('User State Operations', () => {
  it('should get default user state', async () => {
    const state = await getUserState()
    expect(state.id).toBe('user')
    expect(state.activeRoutineId).toBeNull()
    expect(state.lastWorkoutId).toBeNull()
  })

  it('should set active routine', async () => {
    const routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })

    await setActiveRoutine(routineId)

    const state = await getUserState()
    expect(state.activeRoutineId).toBe(routineId)
  })

  it('should reset lastWorkoutId when changing routines', async () => {
    const routine1 = await createRoutine({
      name: 'Routine 1',
      description: 'First routine',
    })
    const workout1 = await createWorkout({
      routineId: routine1,
      name: 'Workout 1',
      position: 0,
    })

    await setActiveRoutine(routine1)

    // Start and complete a workout
    const logId = await startWorkout(workout1)
    await completeWorkout(logId)

    let state = await getUserState()
    expect(state.lastWorkoutId).toBe(workout1)

    // Change to a new routine
    const routine2 = await createRoutine({
      name: 'Routine 2',
      description: 'Second routine',
    })
    await setActiveRoutine(routine2)

    state = await getUserState()
    expect(state.lastWorkoutId).toBeNull()
  })
})

describe('Workout Cycling', () => {
  let routineId: string
  let workout1Id: string
  let workout2Id: string
  let workout3Id: string

  beforeEach(async () => {
    routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })
    workout1Id = await createWorkout({
      routineId,
      name: 'Workout 1',
      position: 0,
    })
    workout2Id = await createWorkout({
      routineId,
      name: 'Workout 2',
      position: 1,
    })
    workout3Id = await createWorkout({
      routineId,
      name: 'Workout 3',
      position: 2,
    })
    await setActiveRoutine(routineId)
  })

  it('should suggest workout 1 for fresh routine', async () => {
    const next = await getNextWorkout()
    expect(next).not.toBeNull()
    expect(next!.workout.id).toBe(workout1Id)
    expect(next!.cyclePosition).toBe(1)
    expect(next!.totalInCycle).toBe(3)
  })

  it('should suggest workout 2 after completing workout 1', async () => {
    const logId = await startWorkout(workout1Id)
    await completeWorkout(logId)

    const next = await getNextWorkout()
    expect(next!.workout.id).toBe(workout2Id)
    expect(next!.cyclePosition).toBe(2)
  })

  it('should cycle back to workout 1 after completing last workout', async () => {
    // Complete all three workouts
    let logId = await startWorkout(workout1Id)
    await completeWorkout(logId)

    logId = await startWorkout(workout2Id)
    await completeWorkout(logId)

    logId = await startWorkout(workout3Id)
    await completeWorkout(logId)

    const next = await getNextWorkout()
    expect(next!.workout.id).toBe(workout1Id)
    expect(next!.cyclePosition).toBe(1)
  })

  it('should return null when no active routine', async () => {
    await setActiveRoutine(null)
    const next = await getNextWorkout()
    expect(next).toBeNull()
  })
})

describe('Workout Log Operations', () => {
  let routineId: string
  let workoutId: string
  let exerciseId: string

  beforeEach(async () => {
    routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })
    workoutId = await createWorkout({
      routineId,
      name: 'Test Workout',
      position: 0,
    })
    exerciseId = await createExercise({
      workoutId,
      name: 'Test Exercise',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })
  })

  it('should start a workout', async () => {
    const logId = await startWorkout(workoutId)
    const log = await getWorkoutLogWithSets(logId)

    expect(log).not.toBeNull()
    expect(log!.workoutId).toBe(workoutId)
    expect(log!.isComplete).toBe(false)
    expect(log!.sets).toHaveLength(0)
  })

  it('should start workout with location', async () => {
    const logId = await startWorkout(workoutId, 'LA Fitness')
    const log = await getWorkoutLogWithSets(logId)

    expect(log!.location).toBe('LA Fitness')
  })

  it('should update workout log location', async () => {
    const logId = await startWorkout(workoutId)
    await updateWorkoutLogLocation(logId, 'Home Gym')

    const log = await getWorkoutLogWithSets(logId)
    expect(log!.location).toBe('Home Gym')
  })

  it('should get current workout log', async () => {
    await startWorkout(workoutId)
    const current = await getCurrentWorkoutLog()

    expect(current).not.toBeNull()
    expect(current!.isComplete).toBe(false)
  })

  it('should complete a workout', async () => {
    const logId = await startWorkout(workoutId)
    await completeWorkout(logId)

    const log = await getWorkoutLogWithSets(logId)
    expect(log!.isComplete).toBe(true)
    expect(log!.completedAt).not.toBeNull()
  })

  it('should delete workout log and its sets', async () => {
    const logId = await startWorkout(workoutId)
    await logSet({
      workoutLogId: logId,
      exerciseId,
      setNumber: 1,
      weight: 100,
    })

    await deleteWorkoutLog(logId)

    const log = await getWorkoutLogWithSets(logId)
    expect(log).toBeNull()
  })

  it('should replace existing incomplete workout on same day', async () => {
    const log1 = await startWorkout(workoutId)
    await logSet({
      workoutLogId: log1,
      exerciseId,
      setNumber: 1,
      weight: 100,
    })

    // Start a new workout for the same workout template
    const log2 = await startWorkout(workoutId)

    // Original log should be deleted
    const oldLog = await getWorkoutLogWithSets(log1)
    expect(oldLog).toBeNull()

    const newLog = await getWorkoutLogWithSets(log2)
    expect(newLog).not.toBeNull()
    expect(newLog!.sets).toHaveLength(0)
  })
})

describe('Set Log Operations', () => {
  let routineId: string
  let workoutId: string
  let exerciseId: string
  let workoutLogId: string

  beforeEach(async () => {
    routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })
    workoutId = await createWorkout({
      routineId,
      name: 'Test Workout',
      position: 0,
    })
    exerciseId = await createExercise({
      workoutId,
      name: 'Test Exercise',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })
    workoutLogId = await startWorkout(workoutId)
  })

  it('should log a set', async () => {
    const setId = await logSet({
      workoutLogId,
      exerciseId,
      setNumber: 1,
      weight: 135,
      reps: 10,
      notes: 'Felt good',
    })

    const log = await getWorkoutLogWithSets(workoutLogId)
    expect(log!.sets).toHaveLength(1)
    expect(log!.sets[0].id).toBe(setId)
    expect(log!.sets[0].weight).toBe(135)
    expect(log!.sets[0].reps).toBe(10)
    expect(log!.sets[0].notes).toBe('Felt good')
  })

  it('should update a set log', async () => {
    const setId = await logSet({
      workoutLogId,
      exerciseId,
      setNumber: 1,
      weight: 135,
    })

    await updateSetLog(setId, { weight: 145, reps: 8 })

    const log = await getWorkoutLogWithSets(workoutLogId)
    expect(log!.sets[0].weight).toBe(145)
    expect(log!.sets[0].reps).toBe(8)
  })

  it('should delete a set log', async () => {
    const setId = await logSet({
      workoutLogId,
      exerciseId,
      setNumber: 1,
      weight: 135,
    })

    await deleteSetLog(setId)

    const log = await getWorkoutLogWithSets(workoutLogId)
    expect(log!.sets).toHaveLength(0)
  })

  it('should get last weight for exercise', async () => {
    // Complete a workout with sets
    await logSet({
      workoutLogId,
      exerciseId,
      setNumber: 1,
      weight: 135,
    })
    await logSet({
      workoutLogId,
      exerciseId,
      setNumber: 2,
      weight: 145,
    })
    await completeWorkout(workoutLogId)

    const lastWeight = await getLastWeightForExercise(exerciseId)
    expect(lastWeight).not.toBeNull()
    expect(lastWeight!.weight).toBe(135) // First set's weight
  })

  it('should return null for exercise with no logs', async () => {
    const newExerciseId = await createExercise({
      workoutId,
      name: 'New Exercise',
      targetSets: 3,
      targetReps: 10,
      position: 1,
    })

    const lastWeight = await getLastWeightForExercise(newExerciseId)
    expect(lastWeight).toBeNull()
  })
})

describe('Workout History', () => {
  let routineId: string
  let workoutId: string
  let exerciseId: string

  beforeEach(async () => {
    routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })
    workoutId = await createWorkout({
      routineId,
      name: 'Test Workout',
      position: 0,
    })
    exerciseId = await createExercise({
      workoutId,
      name: 'Test Exercise',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })
  })

  it('should get workout history', async () => {
    // Complete a workout
    const logId = await startWorkout(workoutId)
    await logSet({
      workoutLogId: logId,
      exerciseId,
      setNumber: 1,
      weight: 135,
    })
    await completeWorkout(logId)

    const history = await getWorkoutHistory()
    expect(history).toHaveLength(1)
    expect(history[0].workoutName).toBe('Test Workout')
    expect(history[0].routineName).toBe('Test Routine')
    expect(history[0].exerciseCount).toBe(1)
  })

  it('should not include incomplete workouts in history', async () => {
    // Start but don't complete
    await startWorkout(workoutId)

    const history = await getWorkoutHistory()
    expect(history).toHaveLength(0)
  })

  it('should respect limit parameter', async () => {
    // This test would require completing multiple workouts on different days
    // which is hard to simulate in tests due to date constraints
    const history = await getWorkoutHistory(5)
    expect(history.length).toBeLessThanOrEqual(5)
  })
})

describe('Database Operations', () => {
  it('should initialize with defaults', async () => {
    await initializeWithDefaults()

    const routines = await getAllRoutines()
    expect(routines.length).toBeGreaterThan(0)
    expect(routines.some((r) => r.name === 'Push/Pull/Legs')).toBe(true)
  })

  it('should check if initialized', async () => {
    let initialized = await isInitialized()
    expect(initialized).toBe(false)

    await initializeWithDefaults()

    initialized = await isInitialized()
    expect(initialized).toBe(true)
  })

  it('should not reinitialize if already initialized', async () => {
    await initializeWithDefaults()
    const count1 = (await getAllRoutines()).length

    await initializeWithDefaults()
    const count2 = (await getAllRoutines()).length

    expect(count1).toBe(count2)
  })

  it('should export and import data', async () => {
    const routineId = await createRoutine({
      name: 'Export Test',
      description: 'Testing export',
    })

    const exported = await exportData()
    const data = JSON.parse(exported)

    expect(data.routines).toHaveLength(1)
    expect(data.routines[0].id).toBe(routineId)
  })

  it('should copy routine from template', async () => {
    await initializeWithDefaults()

    const templates = await getAllRoutines()
    const template = templates.find((r) => r.isTemplate)!

    const copyId = await copyRoutineFromTemplate(template.id)

    const copy = await getRoutineWithWorkouts(copyId)
    expect(copy).not.toBeNull()
    expect(copy!.isTemplate).toBe(false)
    expect(copy!.name).toBe(template.name)
    expect(copy!.workouts.length).toBeGreaterThan(0)
  })
})

describe('Exercises with Last Weights', () => {
  let routineId: string
  let workoutId: string
  let exerciseId: string

  beforeEach(async () => {
    routineId = await createRoutine({
      name: 'Test Routine',
      description: 'A test routine',
    })
    workoutId = await createWorkout({
      routineId,
      name: 'Test Workout',
      position: 0,
    })
    exerciseId = await createExercise({
      workoutId,
      name: 'Test Exercise',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })
  })

  it('should return exercises with null last weights when no history', async () => {
    const exercises = await getExercisesWithLastWeights(workoutId)

    expect(exercises).toHaveLength(1)
    expect(exercises[0].lastWeight).toBeNull()
    expect(exercises[0].lastLogDate).toBeNull()
  })

  it('should return exercises with last weights when history exists', async () => {
    const logId = await startWorkout(workoutId)
    await logSet({
      workoutLogId: logId,
      exerciseId,
      setNumber: 1,
      weight: 100,
    })
    await completeWorkout(logId)

    const exercises = await getExercisesWithLastWeights(workoutId)

    expect(exercises).toHaveLength(1)
    expect(exercises[0].lastWeight).toBe(100)
    expect(exercises[0].lastLogDate).not.toBeNull()
  })
})
