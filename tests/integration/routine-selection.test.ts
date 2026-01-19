import { describe, it, expect, beforeEach } from 'vitest'
import { deleteDB, initDB } from '../../src/db/schema'
import {
  initializeWithDefaults,
  getAllRoutines,
  getRoutineWithWorkouts,
  setActiveRoutine,
  getUserState,
  getNextWorkout,
  copyRoutineFromTemplate,
} from '../../src/db/operations'

describe('P2 Integration: Routine Selection Flow', () => {
  beforeEach(async () => {
    await deleteDB()
    await initDB()
    await initializeWithDefaults()
  })

  it('completes full routine selection flow: browse → inspect → activate', async () => {
    // 1. View all available routines (templates)
    const routines = await getAllRoutines()
    expect(routines.length).toBeGreaterThanOrEqual(3) // PPL, Upper/Lower, Full Body

    // Verify all are templates
    routines.forEach((r) => {
      expect(r.isTemplate).toBe(true)
    })

    // 2. Inspect routine detail
    const pplRoutine = routines.find((r) => r.name.includes('Push'))
    expect(pplRoutine).toBeDefined()

    const routineDetail = await getRoutineWithWorkouts(pplRoutine!.id)
    expect(routineDetail).not.toBeNull()
    expect(routineDetail!.workouts.length).toBe(3) // Push, Pull, Legs

    // Verify workouts have exercises
    routineDetail!.workouts.forEach((workout) => {
      expect(workout.exercises.length).toBeGreaterThan(0)
      workout.exercises.forEach((exercise) => {
        expect(exercise.targetSets).toBeGreaterThan(0)
        expect(exercise.targetReps).toBeGreaterThan(0)
      })
    })

    // 3. Copy template and activate as user's routine
    const userRoutineId = await copyRoutineFromTemplate(pplRoutine!.id)
    await setActiveRoutine(userRoutineId)

    // 4. Verify user state updated
    const userState = await getUserState()
    expect(userState.activeRoutineId).toBe(userRoutineId)
    // lastWorkoutId should be null for fresh routine
    expect(userState.lastWorkoutId).toBeNull()

    // 5. Verify home screen shows correct next workout
    const suggestion = await getNextWorkout()
    expect(suggestion).not.toBeNull()
    expect(suggestion!.cyclePosition).toBe(1) // First workout
    expect(suggestion!.totalInCycle).toBe(3) // 3 workouts in PPL

    // The workout should be from the user's routine, not the template
    expect(suggestion!.workout.routineId).toBe(userRoutineId)
  })

  it('allows switching between routines', async () => {
    const routines = await getAllRoutines()

    // Activate first routine
    const firstRoutine = routines[0]
    const firstRoutineId = await copyRoutineFromTemplate(firstRoutine.id)
    await setActiveRoutine(firstRoutineId)

    let userState = await getUserState()
    expect(userState.activeRoutineId).toBe(firstRoutineId)

    // Switch to second routine
    const secondRoutine = routines[1]
    const secondRoutineId = await copyRoutineFromTemplate(secondRoutine.id)
    await setActiveRoutine(secondRoutineId)

    userState = await getUserState()
    expect(userState.activeRoutineId).toBe(secondRoutineId)

    // lastWorkoutId should be reset when switching routines
    expect(userState.lastWorkoutId).toBeNull()
  })

  it('shows correct workout structure for different routine types', async () => {
    const routines = await getAllRoutines()

    // Find each template type
    const ppl = routines.find((r) => r.name.includes('Push'))
    const upperLower = routines.find((r) => r.name.includes('Upper'))
    const fullBody = routines.find((r) => r.name.includes('Full'))

    expect(ppl).toBeDefined()
    expect(upperLower).toBeDefined()
    expect(fullBody).toBeDefined()

    // PPL should have 3 workouts
    const pplDetail = await getRoutineWithWorkouts(ppl!.id)
    expect(pplDetail!.workouts.length).toBe(3)

    // Upper/Lower should have 2 workouts
    const upperLowerDetail = await getRoutineWithWorkouts(upperLower!.id)
    expect(upperLowerDetail!.workouts.length).toBe(2)

    // Full Body should have 3 workouts
    const fullBodyDetail = await getRoutineWithWorkouts(fullBody!.id)
    expect(fullBodyDetail!.workouts.length).toBe(3)
  })

  it('handles no active routine state correctly', async () => {
    // Fresh state - no active routine
    const userState = await getUserState()
    expect(userState.activeRoutineId).toBeNull()

    // getNextWorkout should return null when no active routine
    const suggestion = await getNextWorkout()
    expect(suggestion).toBeNull()
  })
})
