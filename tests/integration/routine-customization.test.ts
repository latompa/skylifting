import { describe, it, expect, beforeEach } from 'vitest'
import { deleteDB, initDB } from '../../src/db/schema'
import {
  initializeWithDefaults,
  getAllRoutines,
  copyRoutineFromTemplate,
  getRoutineWithWorkouts,
  getWorkoutWithExercises,
  updateExercise,
  createExercise,
  deleteExercise,
  reorderExercises,
  getExercisesByWorkout,
} from '../../src/db/operations'

describe('P4 Integration: Routine Customization Flow', () => {
  beforeEach(async () => {
    await deleteDB()
    await initDB()
    await initializeWithDefaults()
  })

  it('edits sets and reps and verifies persistence', async () => {
    // Setup: Copy a template
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)

    // Get a workout and its exercises
    const routine = await getRoutineWithWorkouts(routineId)
    const workout = routine!.workouts[0]
    const exercise = workout.exercises[0]

    // Original values
    const originalSets = exercise.targetSets
    const originalReps = exercise.targetReps

    // Edit sets and reps
    await updateExercise({
      id: exercise.id,
      targetSets: originalSets + 1,
      targetReps: originalReps + 2,
    })

    // Verify persistence
    const updatedWorkout = await getWorkoutWithExercises(workout.id)
    const updatedExercise = updatedWorkout!.exercises.find((e) => e.id === exercise.id)

    expect(updatedExercise!.targetSets).toBe(originalSets + 1)
    expect(updatedExercise!.targetReps).toBe(originalReps + 2)
  })

  it('edits exercise description and verifies persistence', async () => {
    // Setup
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)
    const routine = await getRoutineWithWorkouts(routineId)
    const workout = routine!.workouts[0]
    const exercise = workout.exercises[0]

    // Edit description
    const newDescription = 'Focus on slow eccentric phase, 3 second negative'
    await updateExercise({
      id: exercise.id,
      description: newDescription,
    })

    // Verify persistence
    const updatedWorkout = await getWorkoutWithExercises(workout.id)
    const updatedExercise = updatedWorkout!.exercises.find((e) => e.id === exercise.id)

    expect(updatedExercise!.description).toBe(newDescription)
  })

  it('adds new exercise and verifies it appears in workout', async () => {
    // Setup
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)
    const routine = await getRoutineWithWorkouts(routineId)
    const workout = routine!.workouts[0]

    const originalExerciseCount = workout.exercises.length

    // Add new exercise at the end
    const newExerciseId = await createExercise({
      workoutId: workout.id,
      name: 'Face Pulls',
      description: 'For rear delt and rotator cuff health',
      targetSets: 3,
      targetReps: 15,
      position: originalExerciseCount,
    })

    // Verify exercise appears
    const updatedWorkout = await getWorkoutWithExercises(workout.id)
    expect(updatedWorkout!.exercises.length).toBe(originalExerciseCount + 1)

    const newExercise = updatedWorkout!.exercises.find((e) => e.id === newExerciseId)
    expect(newExercise).toBeDefined()
    expect(newExercise!.name).toBe('Face Pulls')
    expect(newExercise!.targetSets).toBe(3)
    expect(newExercise!.targetReps).toBe(15)
  })

  it('removes exercise and verifies it is deleted', async () => {
    // Setup
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)
    const routine = await getRoutineWithWorkouts(routineId)
    const workout = routine!.workouts[0]

    const originalExerciseCount = workout.exercises.length
    const exerciseToDelete = workout.exercises[0]

    // Delete exercise
    await deleteExercise(exerciseToDelete.id)

    // Verify removal
    const updatedWorkout = await getWorkoutWithExercises(workout.id)
    expect(updatedWorkout!.exercises.length).toBe(originalExerciseCount - 1)

    const deletedExercise = updatedWorkout!.exercises.find((e) => e.id === exerciseToDelete.id)
    expect(deletedExercise).toBeUndefined()
  })

  it('reorders exercises and verifies new order persists', async () => {
    // Setup
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)
    const routine = await getRoutineWithWorkouts(routineId)
    const workout = routine!.workouts[0]

    // Get original order
    const exercises = workout.exercises
    expect(exercises.length).toBeGreaterThanOrEqual(3)

    const originalFirst = exercises[0]
    const originalSecond = exercises[1]
    const originalThird = exercises[2]

    // Reorder: move first exercise to last position
    const newOrder = [
      originalSecond.id,
      originalThird.id,
      ...exercises.slice(3).map((e) => e.id),
      originalFirst.id,
    ]

    await reorderExercises(workout.id, newOrder)

    // Verify new order
    const reorderedExercises = await getExercisesByWorkout(workout.id)

    expect(reorderedExercises[0].id).toBe(originalSecond.id)
    expect(reorderedExercises[0].position).toBe(0)

    expect(reorderedExercises[1].id).toBe(originalThird.id)
    expect(reorderedExercises[1].position).toBe(1)

    // Original first should now be last
    expect(reorderedExercises[reorderedExercises.length - 1].id).toBe(originalFirst.id)
  })

  it('performs multiple edits in sequence', async () => {
    // Setup
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)
    const routine = await getRoutineWithWorkouts(routineId)
    const workout = routine!.workouts[0]

    // 1. Edit first exercise
    await updateExercise({
      id: workout.exercises[0].id,
      targetSets: 5,
      targetReps: 5,
      description: 'Heavy compound lift',
    })

    // 2. Add new exercise
    const newExerciseId = await createExercise({
      workoutId: workout.id,
      name: 'Dips',
      targetSets: 3,
      targetReps: 12,
      position: workout.exercises.length,
    })

    // 3. Remove middle exercise
    const middleIndex = Math.floor(workout.exercises.length / 2)
    await deleteExercise(workout.exercises[middleIndex].id)

    // Verify all changes persisted
    const finalWorkout = await getWorkoutWithExercises(workout.id)

    // First exercise should be modified
    expect(finalWorkout!.exercises[0].targetSets).toBe(5)
    expect(finalWorkout!.exercises[0].targetReps).toBe(5)
    expect(finalWorkout!.exercises[0].description).toBe('Heavy compound lift')

    // New exercise should exist
    const newExercise = finalWorkout!.exercises.find((e) => e.id === newExerciseId)
    expect(newExercise).toBeDefined()
    expect(newExercise!.name).toBe('Dips')

    // Middle exercise should be gone
    const deletedExercise = finalWorkout!.exercises.find(
      (e) => e.id === workout.exercises[middleIndex].id
    )
    expect(deletedExercise).toBeUndefined()
  })

  it('preserves exercise customizations after copying template', async () => {
    // Copy template
    const templates = await getAllRoutines()
    const routineId = await copyRoutineFromTemplate(templates[0].id)

    // Get the copied routine's exercises
    const routine = await getRoutineWithWorkouts(routineId)
    const workout = routine!.workouts[0]

    // Modify exercise in copied routine
    await updateExercise({
      id: workout.exercises[0].id,
      targetSets: 10,
      targetReps: 10,
    })

    // Verify original template is unchanged
    const templateRoutine = await getRoutineWithWorkouts(templates[0].id)
    expect(templateRoutine!.workouts[0].exercises[0].targetSets).not.toBe(10)
  })
})
