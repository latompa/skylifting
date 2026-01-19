<script setup lang="ts">
import type { ExerciseWithLastWeight, WorkoutLogWithSets } from '../../types'

const props = defineProps<{
  exercises: ExerciseWithLastWeight[]
  currentIndex: number
  workoutLog: WorkoutLogWithSets
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
}>()

function getSetsForExercise(exerciseId: string) {
  return props.workoutLog.sets.filter((s) => s.exerciseId === exerciseId)
}

function isExerciseComplete(exercise: ExerciseWithLastWeight) {
  const sets = getSetsForExercise(exercise.id)
  return sets.length >= exercise.targetSets
}
</script>

<template>
  <div class="exercise-list card">
    <h3 class="section-title">All Exercises</h3>
    <ul class="list">
      <li
        v-for="(exercise, index) in exercises"
        :key="exercise.id"
        :class="{
          'list-item': true,
          current: index === currentIndex,
          complete: isExerciseComplete(exercise),
        }"
        @click="emit('select', index)"
      >
        <div class="exercise-info">
          <span class="exercise-name">{{ exercise.name }}</span>
          <span class="exercise-volume">
            {{ exercise.targetSets }}×{{ exercise.targetReps }}
          </span>
        </div>
        <div class="exercise-status">
          <span class="sets-done">
            {{ getSetsForExercise(exercise.id).length }}/{{ exercise.targetSets }}
          </span>
          <span v-if="isExerciseComplete(exercise)" class="check">✓</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.exercise-list {
  margin-top: 1rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.list {
  list-style: none;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin: 0 -1rem;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s;
}

.list-item:hover {
  background: var(--gray-50);
}

.list-item.current {
  background: rgba(79, 70, 229, 0.05);
  border-left-color: var(--primary);
}

.list-item.complete .exercise-name {
  color: var(--gray-400);
}

.exercise-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.exercise-name {
  font-weight: 500;
}

.exercise-volume {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.exercise-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sets-done {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.check {
  color: var(--success);
  font-weight: 600;
}
</style>
