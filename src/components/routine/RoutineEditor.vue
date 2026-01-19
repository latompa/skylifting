<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoutines } from '../../composables/useRoutines'

const props = defineProps<{
  routineId: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'edit-workout', workoutId: string): void
}>()

const { selectedRoutine, isLoading, loadRoutineDetail } = useRoutines()

onMounted(() => loadRoutineDetail(props.routineId))
</script>

<template>
  <div class="routine-editor">
    <div class="header">
      <button class="btn btn-sm btn-secondary" @click="emit('back')">← Back</button>
      <h2 class="page-title">Edit Routine</h2>
    </div>

    <div v-if="isLoading" class="loading">Loading...</div>

    <template v-else-if="selectedRoutine">
      <div class="card routine-info">
        <h3>{{ selectedRoutine.name }}</h3>
        <p class="description">{{ selectedRoutine.description }}</p>
      </div>

      <h3 class="section-title">Workouts</h3>

      <div
        v-for="workout in selectedRoutine.workouts"
        :key="workout.id"
        class="card workout-card"
        @click="emit('edit-workout', workout.id)"
      >
        <div class="workout-info">
          <span class="workout-position">{{ workout.position + 1 }}</span>
          <div class="workout-details">
            <h4 class="workout-name">{{ workout.name }}</h4>
            <span class="exercise-count">{{ workout.exercises.length }} exercises</span>
          </div>
        </div>
        <span class="edit-icon">→</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.routine-editor {
  padding-top: 0.5rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.routine-info h3 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.description {
  color: var(--gray-500);
  font-size: 0.875rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-600);
  margin: 1.5rem 0 1rem;
}

.workout-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.15s;
}

.workout-card:hover {
  transform: translateX(4px);
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

.workout-details {
  display: flex;
  flex-direction: column;
}

.workout-name {
  font-size: 1rem;
  font-weight: 600;
}

.exercise-count {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.edit-icon {
  color: var(--gray-400);
  font-size: 1.25rem;
}
</style>
