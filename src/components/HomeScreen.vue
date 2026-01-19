<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserState, getNextWorkout } from '../db/operations'
import type { NextWorkoutSuggestion } from '../types'

const emit = defineEmits<{
  (e: 'start-workout', workoutId: string): void
  (e: 'select-routine'): void
}>()

const suggestion = ref<NextWorkoutSuggestion | null>(null)
const hasActiveRoutine = ref(false)
const isLoading = ref(true)

async function loadNextWorkout() {
  isLoading.value = true
  try {
    const state = await getUserState()
    hasActiveRoutine.value = state.activeRoutineId !== null
    suggestion.value = await getNextWorkout()
  } finally {
    isLoading.value = false
  }
}

function handleStartWorkout() {
  if (suggestion.value) {
    emit('start-workout', suggestion.value.workout.id)
  }
}

onMounted(loadNextWorkout)
</script>

<template>
  <div class="home">
    <div v-if="isLoading" class="loading">Loading...</div>

    <template v-else-if="!hasActiveRoutine">
      <div class="card no-routine">
        <h2>Welcome to Skylifting!</h2>
        <p>Select a workout routine to get started.</p>
        <button class="btn btn-primary btn-block" @click="emit('select-routine')">
          Browse Routines
        </button>
      </div>
    </template>

    <template v-else-if="suggestion">
      <div class="card next-workout">
        <div class="cycle-indicator">
          Workout {{ suggestion.cyclePosition }} of {{ suggestion.totalInCycle }}
        </div>
        <h2 class="workout-name">{{ suggestion.workout.name }}</h2>
        <div class="exercise-preview">
          <span class="exercise-count">{{ suggestion.workout.exercises.length }} exercises</span>
        </div>
        <ul class="exercise-list">
          <li v-for="exercise in suggestion.workout.exercises.slice(0, 4)" :key="exercise.id">
            {{ exercise.name }}
            <span class="exercise-volume">{{ exercise.targetSets }}×{{ exercise.targetReps }}</span>
          </li>
          <li v-if="suggestion.workout.exercises.length > 4" class="more">
            +{{ suggestion.workout.exercises.length - 4 }} more
          </li>
        </ul>
        <button class="btn btn-primary btn-block start-btn" @click="handleStartWorkout">
          Start Workout
        </button>
      </div>
    </template>

    <template v-else>
      <div class="card error">
        <p>No workouts available in this routine.</p>
        <button class="btn btn-secondary btn-block" @click="emit('select-routine')">
          Change Routine
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.home {
  padding-top: 1rem;
}

.no-routine {
  text-align: center;
}

.no-routine h2 {
  margin-bottom: 0.5rem;
}

.no-routine p {
  color: var(--gray-500);
  margin-bottom: 1.5rem;
}

.next-workout {
  text-align: center;
}

.cycle-indicator {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: 0.5rem;
}

.workout-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.exercise-preview {
  color: var(--gray-500);
  margin-bottom: 1rem;
}

.exercise-list {
  list-style: none;
  text-align: left;
  background: var(--gray-50);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
}

.exercise-list li {
  padding: 0.5rem 0;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--gray-200);
}

.exercise-list li:last-child {
  border-bottom: none;
}

.exercise-list li.more {
  color: var(--gray-400);
  font-style: italic;
  justify-content: center;
}

.exercise-volume {
  color: var(--gray-500);
  font-size: 0.875rem;
}

.start-btn {
  font-size: 1.125rem;
  padding: 1rem 2rem;
}

.error {
  text-align: center;
}

.error p {
  color: var(--gray-500);
  margin-bottom: 1rem;
}
</style>
