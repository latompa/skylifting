import { ref } from 'vue'
import {
  getWorkoutHistory,
  getWorkoutLogWithSets,
  getWorkoutWithExercises,
} from '../db/operations'
import type { WorkoutHistoryEntry, WorkoutLogWithSets, WorkoutWithExercises } from '../types'

export function useHistory() {
  const history = ref<WorkoutHistoryEntry[]>([])
  const selectedLog = ref<WorkoutLogWithSets | null>(null)
  const selectedWorkout = ref<WorkoutWithExercises | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadHistory(limit?: number) {
    isLoading.value = true
    error.value = null
    try {
      history.value = await getWorkoutHistory(limit)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load history'
    } finally {
      isLoading.value = false
    }
  }

  async function loadLogDetail(workoutLogId: string) {
    isLoading.value = true
    error.value = null
    try {
      selectedLog.value = await getWorkoutLogWithSets(workoutLogId)
      if (selectedLog.value) {
        selectedWorkout.value = await getWorkoutWithExercises(selectedLog.value.workoutId)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load workout details'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    history,
    selectedLog,
    selectedWorkout,
    isLoading,
    error,

    // Methods
    loadHistory,
    loadLogDetail,
  }
}
