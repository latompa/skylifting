import { describe, it, expect, beforeEach } from 'vitest'
import { deleteDB, initDB } from '../../src/db/schema'
import {
  initializeWithDefaults,
  getAllRoutines,
  copyRoutineFromTemplate,
  setActiveRoutine,
  getNextWorkout,
  startWorkout,
  completeWorkout,
  getUserState,
  createRoutine,
  createWorkout,
  createExercise,
} from '../../src/db/operations'

describe('P3 Integration: Workout Cycling Flow', () => {
  beforeEach(async () => {
    await deleteDB()
    await initDB()
    await initializeWithDefaults()
  })

  it('cycles through workouts correctly: complete workout 1 → suggests workout 2', async () => {
    // Setup: Create 3-workout routine (PPL)
    const templates = await getAllRoutines()
    const pplTemplate = templates.find((r) => r.name.includes('Push'))!
    const routineId = await copyRoutineFromTemplate(pplTemplate.id)
    await setActiveRoutine(routineId)

    // Initial state: first workout suggested
    let suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(1)
    const workout1 = suggestion!.workout

    // Complete workout 1
    const log1 = await startWorkout(workout1.id)
    await completeWorkout(log1)

    // Now workout 2 should be suggested
    suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(2)
    expect(suggestion!.workout.id).not.toBe(workout1.id)

    const workout2 = suggestion!.workout

    // Complete workout 2
    const log2 = await startWorkout(workout2.id)
    await completeWorkout(log2)

    // Now workout 3 should be suggested
    suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(3)
    expect(suggestion!.workout.id).not.toBe(workout1.id)
    expect(suggestion!.workout.id).not.toBe(workout2.id)
  })

  it('cycles back to first workout after completing the last workout', async () => {
    // Setup: Create 3-workout routine (PPL)
    const templates = await getAllRoutines()
    const pplTemplate = templates.find((r) => r.name.includes('Push'))!
    const routineId = await copyRoutineFromTemplate(pplTemplate.id)
    await setActiveRoutine(routineId)

    // Get the 3 workouts
    let suggestion = await getNextWorkout()
    const totalWorkouts = suggestion!.totalInCycle
    expect(totalWorkouts).toBe(3)

    const workoutIds: string[] = []

    // Complete all 3 workouts
    for (let i = 0; i < totalWorkouts; i++) {
      suggestion = await getNextWorkout()
      workoutIds.push(suggestion!.workout.id)
      const logId = await startWorkout(suggestion!.workout.id)
      await completeWorkout(logId)
    }

    // After completing all 3, should cycle back to workout 1
    suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(1)
    expect(suggestion!.workout.id).toBe(workoutIds[0])
  })

  it('handles fresh routine correctly: suggests workout 1', async () => {
    // Setup: Fresh routine with no history
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)
    await setActiveRoutine(routineId)

    // Verify user state is fresh
    const userState = await getUserState()
    expect(userState.lastWorkoutId).toBeNull()
    expect(userState.lastWorkoutDate).toBeNull()

    // Should suggest first workout
    const suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(1)
  })

  it('handles single-workout routine correctly', async () => {
    // Create a custom routine with only 1 workout
    const routineId = await createRoutine({
      name: 'Single Workout Routine',
      description: 'Just one workout',
    })

    const workoutId = await createWorkout({
      routineId,
      name: 'The Only Workout',
      position: 0,
    })

    await createExercise({
      workoutId,
      name: 'Squats',
      targetSets: 3,
      targetReps: 10,
      position: 0,
    })

    await setActiveRoutine(routineId)

    // First suggestion
    let suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(1)
    expect(suggestion!.totalInCycle).toBe(1)

    // Complete the workout
    const logId = await startWorkout(suggestion!.workout.id)
    await completeWorkout(logId)

    // Should cycle back to same workout
    suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(1)
    expect(suggestion!.workout.id).toBe(workoutId)
  })

  it('maintains correct cycle position after multiple sessions', async () => {
    // Setup - use PPL which has 3 workouts
    const templates = await getAllRoutines()
    const pplTemplate = templates.find((r) => r.name.includes('Push'))!
    const routineId = await copyRoutineFromTemplate(pplTemplate.id)
    await setActiveRoutine(routineId)

    // Simulate multiple gym sessions over several days
    // Complete workout 1
    let suggestion = await getNextWorkout()
    expect(suggestion!.totalInCycle).toBe(3) // Verify we have 3 workouts
    await completeWorkout(await startWorkout(suggestion!.workout.id))

    // Day 2: Check cycle position
    suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(2)

    // Complete workout 2
    await completeWorkout(await startWorkout(suggestion!.workout.id))

    // Day 3: Check cycle position
    suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(3)

    // Verify user state tracks progress
    const userState = await getUserState()
    expect(userState.lastWorkoutDate).not.toBeNull()
    expect(userState.lastWorkoutId).not.toBeNull()
  })

  it('resets cycle when switching to new routine', async () => {
    // Setup with first routine
    const templates = await getAllRoutines()
    const routine1Id = await copyRoutineFromTemplate(templates[0].id)
    await setActiveRoutine(routine1Id)

    // Progress through some workouts
    let suggestion = await getNextWorkout()
    await completeWorkout(await startWorkout(suggestion!.workout.id))
    suggestion = await getNextWorkout()
    await completeWorkout(await startWorkout(suggestion!.workout.id))

    // Verify we're at position 3
    suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(3)

    // Switch to new routine
    const routine2Id = await copyRoutineFromTemplate(templates[1].id)
    await setActiveRoutine(routine2Id)

    // Should start fresh at position 1
    suggestion = await getNextWorkout()
    expect(suggestion!.cyclePosition).toBe(1)

    // User state should be reset
    const userState = await getUserState()
    expect(userState.activeRoutineId).toBe(routine2Id)
    expect(userState.lastWorkoutId).toBeNull()
  })
})
