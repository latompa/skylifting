<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useHistory } from '../../composables/useHistory'

const props = defineProps<{
  workoutLogId: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { selectedLog, selectedWorkout, isLoading, loadLogDetail } = useHistory()

const exercisesWithSets = computed(() => {
  if (!selectedLog.value || !selectedWorkout.value) return []

  return selectedWorkout.value.exercises.map((exercise) => {
    const sets = selectedLog.value!.sets
      .filter((s) => s.exerciseId === exercise.id)
      .sort((a, b) => a.setNumber - b.setNumber)

    return {
      exercise,
      sets,
    }
  })
})

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => loadLogDetail(props.workoutLogId))
</script>

<template>
  <div class="history-detail">
    <div class="header">
      <button class="btn btn-sm btn-secondary" @click="emit('back')">← Back</button>
    </div>

    <div v-if="isLoading" class="loading">Loading workout...</div>

    <template v-else-if="selectedLog && selectedWorkout">
      <div class="card workout-summary">
        <h2 class="workout-name">{{ selectedWorkout.name }}</h2>
        <div class="workout-date">{{ formatDate(selectedLog.date) }}</div>
        <div v-if="selectedLog.location" class="workout-location">
          📍 {{ selectedLog.location }}
        </div>
      </div>

      <h3 class="section-title">Exercises</h3>

      <div
        v-for="{ exercise, sets } in exercisesWithSets"
        :key="exercise.id"
        class="card exercise-card"
      >
        <div class="exercise-header">
          <h4 class="exercise-name">{{ exercise.name }}</h4>
          <span class="exercise-target">
            Target: {{ exercise.targetSets }}×{{ exercise.targetReps }}
          </span>
        </div>

        <div v-if="sets.length > 0" class="sets-list">
          <div v-for="set in sets" :key="set.id" class="set-item">
            <span class="set-number">Set {{ set.setNumber }}</span>
            <span class="set-weight">{{ set.weight }} lbs</span>
            <span v-if="set.reps" class="set-reps">× {{ set.reps }}</span>
            <span v-if="set.notes" class="set-notes">{{ set.notes }}</span>
          </div>
        </div>

        <div v-else class="no-sets">
          No sets logged
        </div>
      </div>

      <div class="stats card">
        <div class="stat">
          <span class="stat-value">{{ exercisesWithSets.filter(e => e.sets.length > 0).length }}</span>
          <span class="stat-label">Exercises</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ selectedLog.sets.length }}</span>
          <span class="stat-label">Total Sets</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.history-detail {
  padding-top: 0.5rem;
}

.header {
  margin-bottom: 1rem;
}

.workout-summary {
  text-align: center;
}

.workout-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.workout-date {
  color: var(--gray-500);
  margin-bottom: 0.25rem;
}

.workout-location {
  font-size: 0.875rem;
  color: var(--gray-400);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-600);
  margin: 1.5rem 0 1rem;
}

.exercise-card {
  margin-bottom: 0.75rem;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.exercise-name {
  font-size: 1rem;
  font-weight: 600;
}

.exercise-target {
  font-size: 0.75rem;
  color: var(--gray-400);
}

.sets-list {
  background: var(--gray-50);
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.set-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.set-item:last-child {
  border-bottom: none;
}

.set-number {
  font-size: 0.875rem;
  color: var(--gray-500);
  min-width: 50px;
}

.set-weight {
  font-weight: 600;
  color: var(--primary);
}

.set-reps {
  color: var(--gray-600);
}

.set-notes {
  width: 100%;
  font-size: 0.875rem;
  color: var(--gray-500);
  font-style: italic;
}

.no-sets {
  text-align: center;
  color: var(--gray-400);
  font-style: italic;
  padding: 1rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-500);
}
</style>
