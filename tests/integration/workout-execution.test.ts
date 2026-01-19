import { describe, it, expect, beforeEach } from 'vitest'
import { deleteDB, initDB } from '../../src/db/schema'
import {
  initializeWithDefaults,
  getAllRoutines,
  setActiveRoutine,
  getNextWorkout,
  copyRoutineFromTemplate,
  startWorkout,
  logSet,
  completeWorkout,
  getWorkoutLogWithSets,
  getWorkoutHistory,
  getUserState,
  getExercisesWithLastWeights,
} from '../../src/db/operations'

describe('P1 Integration: Workout Execution Flow', () => {
  beforeEach(async () => {
    await deleteDB()
    await initDB()
    await initializeWithDefaults()
  })

  it('completes full workout execution flow: start → log sets → complete', async () => {
    // 1. Get templates and copy one to create user's routine
    const templates = await getAllRoutines()
    expect(templates.length).toBeGreaterThan(0)

    const pplTemplate = templates.find((r) => r.name.includes('Push'))
    expect(pplTemplate).toBeDefined()

    const routineId = await copyRoutineFromTemplate(pplTemplate!.id)

    // 2. Set as active routine
    await setActiveRoutine(routineId)

    // 3. Get next suggested workout
    const suggestion = await getNextWorkout()
    expect(suggestion).not.toBeNull()
    expect(suggestion!.cyclePosition).toBe(1)
    expect(suggestion!.totalInCycle).toBeGreaterThan(0)

    const workout = suggestion!.workout
    expect(workout.exercises.length).toBeGreaterThan(0)

    // 4. Start the workout
    const workoutLogId = await startWorkout(workout.id, 'Home Gym')

    // 5. Log sets for each exercise
    for (const exercise of workout.exercises) {
      // Log target number of sets
      for (let setNum = 1; setNum <= exercise.targetSets; setNum++) {
        await logSet({
          workoutLogId,
          exerciseId: exercise.id,
          setNumber: setNum,
          weight: 100 + setNum * 5, // Progressive weights
          reps: exercise.targetReps,
          notes: setNum === exercise.targetSets ? 'Last set, felt good' : undefined,
        })
      }
    }

    // 6. Verify sets were logged
    const logBeforeComplete = await getWorkoutLogWithSets(workoutLogId)
    expect(logBeforeComplete).not.toBeNull()
    expect(logBeforeComplete!.isComplete).toBe(false)

    const expectedSetCount = workout.exercises.reduce((acc, ex) => acc + ex.targetSets, 0)
    expect(logBeforeComplete!.sets.length).toBe(expectedSetCount)

    // 7. Complete the workout
    await completeWorkout(workoutLogId)

    // 8. Verify workout is marked complete
    const logAfterComplete = await getWorkoutLogWithSets(workoutLogId)
    expect(logAfterComplete!.isComplete).toBe(true)
    expect(logAfterComplete!.completedAt).not.toBeNull()

    // 9. Verify user state is updated
    const userState = await getUserState()
    expect(userState.lastWorkoutId).toBe(workout.id)
    expect(userState.lastWorkoutDate).not.toBeNull()

    // 10. Verify workout appears in history
    const history = await getWorkoutHistory()
    expect(history.length).toBe(1)
    expect(history[0].log.id).toBe(workoutLogId)
    expect(history[0].exerciseCount).toBe(workout.exercises.length)
  })

  it('preserves logged weights for future workouts', async () => {
    // Setup: Create routine and set active
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)
    await setActiveRoutine(routineId)

    // Get the workout
    const suggestion = await getNextWorkout()
    const workout = suggestion!.workout
    const firstExercise = workout.exercises[0]

    // First workout: log some sets
    const logId1 = await startWorkout(workout.id)
    await logSet({
      workoutLogId: logId1,
      exerciseId: firstExercise.id,
      setNumber: 1,
      weight: 135,
    })
    await logSet({
      workoutLogId: logId1,
      exerciseId: firstExercise.id,
      setNumber: 2,
      weight: 145,
    })
    await completeWorkout(logId1)

    // Second workout (different day simulation - complete first one advanced the cycle)
    // But we're testing same workout's last weight display
    const exercisesWithWeights = await getExercisesWithLastWeights(workout.id)
    const exerciseWithLastWeight = exercisesWithWeights.find((e) => e.id === firstExercise.id)

    // Should show the first set's weight (135) as the "last weight"
    expect(exerciseWithLastWeight).toBeDefined()
    expect(exerciseWithLastWeight!.lastWeight).toBe(135)
    expect(exerciseWithLastWeight!.lastLogDate).not.toBeNull()
  })

  it('handles partial workout completion correctly', async () => {
    // Setup
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)
    await setActiveRoutine(routineId)

    const suggestion = await getNextWorkout()
    const workout = suggestion!.workout

    // Start workout but only log some sets (not all exercises)
    const logId = await startWorkout(workout.id)

    // Log only for first exercise
    await logSet({
      workoutLogId: logId,
      exerciseId: workout.exercises[0].id,
      setNumber: 1,
      weight: 100,
    })

    // Complete workout even with partial sets
    await completeWorkout(logId)

    // Verify workout is still marked complete
    const log = await getWorkoutLogWithSets(logId)
    expect(log!.isComplete).toBe(true)
    expect(log!.sets.length).toBe(1)

    // Verify it appears in history
    const history = await getWorkoutHistory()
    expect(history.length).toBe(1)
    expect(history[0].exerciseCount).toBe(1) // Only 1 exercise had sets logged
  })

  it('tracks workout location when provided', async () => {
    // Setup
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)
    await setActiveRoutine(routineId)

    const suggestion = await getNextWorkout()
    const workout = suggestion!.workout

    // Start workout with location
    const logId = await startWorkout(workout.id, 'Gold\'s Gym')
    await completeWorkout(logId)

    // Verify location is saved
    const log = await getWorkoutLogWithSets(logId)
    expect(log!.location).toBe('Gold\'s Gym')

    // Verify location appears in history
    const history = await getWorkoutHistory()
    expect(history[0].log.location).toBe('Gold\'s Gym')
  })
})
