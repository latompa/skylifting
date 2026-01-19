import { ref, computed } from 'vue'
import {
  getAllRoutines,
  getRoutineWithWorkouts,
  getUserState,
  setActiveRoutine as dbSetActiveRoutine,
  copyRoutineFromTemplate,
} from '../db/operations'
import type { Routine, RoutineWithWorkouts, UserState } from '../types'

export function useRoutines() {
  const routines = ref<Routine[]>([])
  const selectedRoutine = ref<RoutineWithWorkouts | null>(null)
  const userState = ref<UserState | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeRoutineId = computed(() => userState.value?.activeRoutineId ?? null)

  const templates = computed(() => routines.value.filter((r) => r.isTemplate))
  const userRoutines = computed(() => routines.value.filter((r) => !r.isTemplate))

  async function loadRoutines() {
    isLoading.value = true
    error.value = null
    try {
      routines.value = await getAllRoutines()
      userState.value = await getUserState()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load routines'
    } finally {
      isLoading.value = false
    }
  }

  async function loadRoutineDetail(routineId: string) {
    isLoading.value = true
    error.value = null
    try {
      selectedRoutine.value = await getRoutineWithWorkouts(routineId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load routine'
    } finally {
      isLoading.value = false
    }
  }

  async function setActiveRoutine(routineId: string | null) {
    try {
      await dbSetActiveRoutine(routineId)
      userState.value = await getUserState()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to set active routine'
      throw e
    }
  }

  async function activateTemplate(templateId: string) {
    try {
      // Copy the template to create a user routine
      const newRoutineId = await copyRoutineFromTemplate(templateId)
      // Set it as active
      await setActiveRoutine(newRoutineId)
      // Reload routines to include the new one
      await loadRoutines()
      return newRoutineId
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to activate template'
      throw e
    }
  }

  return {
    // State
    routines,
    selectedRoutine,
    userState,
    isLoading,
    error,

    // Computed
    activeRoutineId,
    templates,
    userRoutines,

    // Methods
    loadRoutines,
    loadRoutineDetail,
    setActiveRoutine,
    activateTemplate,
  }
}
