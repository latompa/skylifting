<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getWorkoutWithExercises,
  updateExercise,
  deleteExercise,
  createExercise,
  reorderExercises,
} from '../../db/operations'
import { exerciseList } from '../../data/templates'
import type { WorkoutWithExercises, Exercise } from '../../types'

const props = defineProps<{
  workoutId: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const workout = ref<WorkoutWithExercises | null>(null)
const isLoading = ref(true)
const showAddForm = ref(false)
const newExerciseName = ref('')
const newExerciseSets = ref(3)
const newExerciseReps = ref(10)

async function loadWorkout() {
  isLoading.value = true
  workout.value = await getWorkoutWithExercises(props.workoutId)
  isLoading.value = false
}

async function handleUpdateExercise(exercise: Exercise, field: 'targetSets' | 'targetReps', value: number) {
  await updateExercise({
    id: exercise.id,
    [field]: value,
  })
  await loadWorkout()
}

async function handleDeleteExercise(exerciseId: string) {
  if (!confirm('Remove this exercise?')) return
  await deleteExercise(exerciseId)
  await loadWorkout()
}

async function handleAddExercise() {
  if (!newExerciseName.value || !workout.value) return

  await createExercise({
    workoutId: props.workoutId,
    name: newExerciseName.value,
    targetSets: newExerciseSets.value,
    targetReps: newExerciseReps.value,
    position: workout.value.exercises.length,
  })

  newExerciseName.value = ''
  newExerciseSets.value = 3
  newExerciseReps.value = 10
  showAddForm.value = false
  await loadWorkout()
}

async function moveExercise(index: number, direction: 'up' | 'down') {
  if (!workout.value) return

  const exercises = [...workout.value.exercises]
  const newIndex = direction === 'up' ? index - 1 : index + 1

  if (newIndex < 0 || newIndex >= exercises.length) return

  ;[exercises[index], exercises[newIndex]] = [exercises[newIndex], exercises[index]]
  await reorderExercises(props.workoutId, exercises.map((e) => e.id))
  await loadWorkout()
}

onMounted(loadWorkout)
</script>

<template>
  <div class="workout-editor">
    <div class="header">
      <button class="btn btn-sm btn-secondary" @click="emit('back')">← Back</button>
      <h2 class="page-title">Edit Workout</h2>
    </div>

    <div v-if="isLoading" class="loading">Loading...</div>

    <template v-else-if="workout">
      <div class="card workout-info">
        <h3>{{ workout.name }}</h3>
      </div>

      <h3 class="section-title">Exercises</h3>

      <div
        v-for="(exercise, index) in workout.exercises"
        :key="exercise.id"
        class="card exercise-card"
      >
        <div class="exercise-header">
          <span class="exercise-name">{{ exercise.name }}</span>
          <button class="delete-btn" @click="handleDeleteExercise(exercise.id)">×</button>
        </div>

        <div class="exercise-controls">
          <div class="volume-control">
            <label>Sets</label>
            <div class="stepper">
              <button @click="handleUpdateExercise(exercise, 'targetSets', Math.max(1, exercise.targetSets - 1))">−</button>
              <span>{{ exercise.targetSets }}</span>
              <button @click="handleUpdateExercise(exercise, 'targetSets', exercise.targetSets + 1)">+</button>
            </div>
          </div>

          <div class="volume-control">
            <label>Reps</label>
            <div class="stepper">
              <button @click="handleUpdateExercise(exercise, 'targetReps', Math.max(1, exercise.targetReps - 1))">−</button>
              <span>{{ exercise.targetReps }}</span>
              <button @click="handleUpdateExercise(exercise, 'targetReps', exercise.targetReps + 1)">+</button>
            </div>
          </div>

          <div class="reorder-controls">
            <button :disabled="index === 0" @click="moveExercise(index, 'up')">↑</button>
            <button :disabled="index === workout.exercises.length - 1" @click="moveExercise(index, 'down')">↓</button>
          </div>
        </div>
      </div>

      <div v-if="showAddForm" class="card add-form">
        <h4>Add Exercise</h4>

        <div class="form-group">
          <label class="label">Exercise</label>
          <select v-model="newExerciseName" class="input">
            <option value="">Select an exercise...</option>
            <option v-for="name in exerciseList" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="label">Sets</label>
            <input v-model.number="newExerciseSets" type="number" class="input" min="1" />
          </div>
          <div class="form-group">
            <label class="label">Reps</label>
            <input v-model.number="newExerciseReps" type="number" class="input" min="1" />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="showAddForm = false">Cancel</button>
          <button class="btn btn-primary" :disabled="!newExerciseName" @click="handleAddExercise">
            Add
          </button>
        </div>
      </div>

      <button v-else class="btn btn-secondary btn-block add-btn" @click="showAddForm = true">
        + Add Exercise
      </button>
    </template>
  </div>
</template>

<style scoped>
.workout-editor {
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

.workout-info h3 {
  font-size: 1.125rem;
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
  align-items: center;
  margin-bottom: 0.75rem;
}

.exercise-name {
  font-weight: 600;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--gray-400);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 0.25rem;
}

.delete-btn:hover {
  color: var(--danger);
}

.exercise-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.volume-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.volume-control label {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--gray-100);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.stepper button {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 0.25rem;
  font-size: 1.25rem;
  cursor: pointer;
}

.stepper button:hover {
  background: var(--gray-200);
}

.stepper span {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}

.reorder-controls {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: auto;
}

.reorder-controls button {
  width: 32px;
  height: 24px;
  border: 1px solid var(--gray-300);
  background: white;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.reorder-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.reorder-controls button:not(:disabled):hover {
  background: var(--gray-100);
}

.add-form h4 {
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.add-btn {
  margin-top: 0.5rem;
}
</style>
