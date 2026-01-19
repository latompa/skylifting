import { ref, computed } from 'vue'
import {
  getWorkoutWithExercises,
  getExercisesWithLastWeights,
  startWorkout as dbStartWorkout,
  logSet as dbLogSet,
  completeWorkout as dbCompleteWorkout,
  getWorkoutLogWithSets,
  deleteSetLog,
  getCurrentWorkoutLog,
} from '../db/operations'
import type {
  WorkoutWithExercises,
  ExerciseWithLastWeight,
  WorkoutLogWithSets,
} from '../types'

export function useWorkout() {
  const workout = ref<WorkoutWithExercises | null>(null)
  const exercises = ref<ExerciseWithLastWeight[]>([])
  const workoutLog = ref<WorkoutLogWithSets | null>(null)
  const currentExerciseIndex = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentExercise = computed(() => {
    if (exercises.value.length === 0) return null
    return exercises.value[currentExerciseIndex.value] || null
  })

  const setsForCurrentExercise = computed(() => {
    if (!workoutLog.value || !currentExercise.value) return []
    return workoutLog.value.sets
      .filter((s) => s.exerciseId === currentExercise.value!.id)
      .sort((a, b) => a.setNumber - b.setNumber)
  })

  const nextSetNumber = computed(() => {
    return setsForCurrentExercise.value.length + 1
  })

  const isCurrentExerciseComplete = computed(() => {
    if (!currentExercise.value) return false
    return setsForCurrentExercise.value.length >= currentExercise.value.targetSets
  })

  const completedExerciseCount = computed(() => {
    if (!workoutLog.value) return 0
    return exercises.value.filter((ex) => {
      const sets = workoutLog.value!.sets.filter((s) => s.exerciseId === ex.id)
      return sets.length >= ex.targetSets
    }).length
  })

  const isWorkoutComplete = computed(() => {
    return completedExerciseCount.value === exercises.value.length && exercises.value.length > 0
  })

  async function startWorkout(workoutId: string, location?: string) {
    isLoading.value = true
    error.value = null

    try {
      // Check for existing in-progress workout
      const existing = await getCurrentWorkoutLog()
      if (existing && existing.workoutId === workoutId) {
        // Resume existing workout
        workout.value = await getWorkoutWithExercises(workoutId)
        exercises.value = await getExercisesWithLastWeights(workoutId)
        workoutLog.value = existing
        currentExerciseIndex.value = 0
        return
      }

      // Start new workout
      workout.value = await getWorkoutWithExercises(workoutId)
      if (!workout.value) {
        throw new Error('Workout not found')
      }

      exercises.value = await getExercisesWithLastWeights(workoutId)
      const logId = await dbStartWorkout(workoutId, location)
      workoutLog.value = await getWorkoutLogWithSets(logId)
      currentExerciseIndex.value = 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to start workout'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function logSet(weight: number, reps?: number, notes?: string) {
    if (!workoutLog.value || !currentExercise.value) {
      throw new Error('No active workout or exercise')
    }

    const setId = await dbLogSet({
      workoutLogId: workoutLog.value.id,
      exerciseId: currentExercise.value.id,
      setNumber: nextSetNumber.value,
      weight,
      reps,
      notes,
    })

    // Refresh workout log to get updated sets
    workoutLog.value = await getWorkoutLogWithSets(workoutLog.value.id)
    return setId
  }

  async function removeSet(setLogId: string) {
    if (!workoutLog.value) return

    await deleteSetLog(setLogId)
    workoutLog.value = await getWorkoutLogWithSets(workoutLog.value.id)
  }

  function nextExercise() {
    if (currentExerciseIndex.value < exercises.value.length - 1) {
      currentExerciseIndex.value++
    }
  }

  function previousExercise() {
    if (currentExerciseIndex.value > 0) {
      currentExerciseIndex.value--
    }
  }

  function goToExercise(index: number) {
    if (index >= 0 && index < exercises.value.length) {
      currentExerciseIndex.value = index
    }
  }

  async function completeWorkout() {
    if (!workoutLog.value) {
      throw new Error('No active workout')
    }

    await dbCompleteWorkout(workoutLog.value.id)
    workoutLog.value = await getWorkoutLogWithSets(workoutLog.value.id)
  }

  function reset() {
    workout.value = null
    exercises.value = []
    workoutLog.value = null
    currentExerciseIndex.value = 0
    error.value = null
  }

  return {
    // State
    workout,
    exercises,
    workoutLog,
    currentExerciseIndex,
    isLoading,
    error,

    // Computed
    currentExercise,
    setsForCurrentExercise,
    nextSetNumber,
    isCurrentExerciseComplete,
    completedExerciseCount,
    isWorkoutComplete,

    // Methods
    startWorkout,
    logSet,
    removeSet,
    nextExercise,
    previousExercise,
    goToExercise,
    completeWorkout,
    reset,
  }
}
