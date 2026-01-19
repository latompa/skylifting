<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoutines } from '../../composables/useRoutines'

const props = defineProps<{
  routineId: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'edit', routineId: string): void
  (e: 'activated'): void
}>()

const { selectedRoutine, activeRoutineId, isLoading, loadRoutineDetail, setActiveRoutine, activateTemplate } =
  useRoutines()

const expandedWorkouts = ref<Set<string>>(new Set())

function toggleWorkout(workoutId: string) {
  if (expandedWorkouts.value.has(workoutId)) {
    expandedWorkouts.value.delete(workoutId)
  } else {
    expandedWorkouts.value.add(workoutId)
  }
}

async function handleActivate() {
  if (!selectedRoutine.value) return

  try {
    if (selectedRoutine.value.isTemplate) {
      await activateTemplate(selectedRoutine.value.id)
    } else {
      await setActiveRoutine(selectedRoutine.value.id)
    }
    emit('activated')
  } catch {
    // Error is handled in composable
  }
}

onMounted(() => loadRoutineDetail(props.routineId))
</script>

<template>
  <div class="routine-detail">
    <div class="header">
      <button class="btn btn-sm btn-secondary" @click="emit('back')">← Back</button>
    </div>

    <div v-if="isLoading" class="loading">Loading routine...</div>

    <template v-else-if="selectedRoutine">
      <div class="card">
        <div class="routine-header">
          <h2 class="routine-name">{{ selectedRoutine.name }}</h2>
          <span v-if="selectedRoutine.id === activeRoutineId" class="active-badge">Active</span>
        </div>
        <p class="routine-description">{{ selectedRoutine.description }}</p>

        <div class="actions">
          <button
            v-if="selectedRoutine.id !== activeRoutineId"
            class="btn btn-primary"
            @click="handleActivate"
          >
            {{ selectedRoutine.isTemplate ? 'Use This Routine' : 'Set as Active' }}
          </button>
          <button
            v-if="!selectedRoutine.isTemplate"
            class="btn btn-secondary"
            @click="emit('edit', selectedRoutine.id)"
          >
            Edit
          </button>
        </div>
      </div>

      <h3 class="section-title">Workouts ({{ selectedRoutine.workouts.length }})</h3>

      <div
        v-for="workout in selectedRoutine.workouts"
        :key="workout.id"
        class="card workout-card"
      >
        <div class="workout-header" @click="toggleWorkout(workout.id)">
          <div class="workout-info">
            <span class="workout-position">{{ workout.position + 1 }}</span>
            <h4 class="workout-name">{{ workout.name }}</h4>
          </div>
          <span class="expand-icon">{{ expandedWorkouts.has(workout.id) ? '−' : '+' }}</span>
        </div>

        <div v-if="expandedWorkouts.has(workout.id)" class="workout-exercises">
          <div
            v-for="exercise in workout.exercises"
            :key="exercise.id"
            class="exercise-item"
          >
            <span class="exercise-name">{{ exercise.name }}</span>
            <span class="exercise-volume">
              {{ exercise.targetSets }}×{{ exercise.targetReps }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.routine-detail {
  padding-top: 0.5rem;
}

.header {
  margin-bottom: 1rem;
}

.routine-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.routine-name {
  font-size: 1.5rem;
  font-weight: 700;
  flex: 1;
}

.active-badge {
  background: var(--success);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.routine-description {
  color: var(--gray-500);
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-600);
  margin: 1.5rem 0 1rem;
}

.workout-card {
  padding: 0;
  overflow: hidden;
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
}

.workout-header:hover {
  background: var(--gray-50);
}

.workout-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.workout-position {
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.workout-name {
  font-size: 1rem;
  font-weight: 600;
}

.expand-icon {
  color: var(--gray-400);
  font-size: 1.25rem;
}

.workout-exercises {
  border-top: 1px solid var(--gray-200);
  padding: 0.5rem 1rem;
  background: var(--gray-50);
}

.exercise-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gray-200);
}

.exercise-item:last-child {
  border-bottom: none;
}

.exercise-name {
  color: var(--gray-700);
}

.exercise-volume {
  color: var(--gray-500);
  font-size: 0.875rem;
}
</style>
