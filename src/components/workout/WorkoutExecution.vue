<script setup lang="ts">
import { onMounted } from 'vue'
import { useWorkout } from '../../composables/useWorkout'
import SetLogger from './SetLogger.vue'
import ExerciseList from './ExerciseList.vue'
import WorkoutComplete from './WorkoutComplete.vue'

const props = defineProps<{
  workoutId: string
}>()

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'cancel'): void
}>()

const {
  workout,
  exercises,
  workoutLog,
  currentExercise,
  currentExerciseIndex,
  setsForCurrentExercise,
  nextSetNumber,
  isCurrentExerciseComplete,
  completedExerciseCount,
  isWorkoutComplete,
  isLoading,
  error,
  startWorkout,
  logSet,
  removeSet,
  nextExercise,
  previousExercise,
  goToExercise,
  completeWorkout,
} = useWorkout()

async function handleLogSet(weight: number, reps?: number, notes?: string) {
  await logSet(weight, reps, notes)
}

async function handleFinish() {
  await completeWorkout()
  emit('complete')
}

onMounted(() => {
  startWorkout(props.workoutId)
})
</script>

<template>
  <div class="workout-execution">
    <div v-if="isLoading" class="loading">Loading workout...</div>

    <div v-else-if="error" class="error card">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="emit('cancel')">Go Back</button>
    </div>

    <template v-else-if="workout && currentExercise && workoutLog">
      <!-- Progress header -->
      <div class="progress-header">
        <button class="btn btn-sm btn-secondary" @click="emit('cancel')">Cancel</button>
        <div class="progress-text">
          {{ completedExerciseCount }}/{{ exercises.length }} exercises
        </div>
      </div>

      <!-- Show completion screen if all exercises done -->
      <WorkoutComplete
        v-if="isWorkoutComplete"
        :workout-name="workout.name"
        :exercise-count="exercises.length"
        :set-count="workoutLog.sets.length"
        @finish="handleFinish"
      />

      <template v-else>
        <!-- Current exercise display -->
        <div class="card current-exercise">
          <div class="exercise-nav">
            <button
              class="nav-btn"
              :disabled="currentExerciseIndex === 0"
              @click="previousExercise"
            >
              ←
            </button>
            <div class="exercise-position">
              Exercise {{ currentExerciseIndex + 1 }} of {{ exercises.length }}
            </div>
            <button
              class="nav-btn"
              :disabled="currentExerciseIndex === exercises.length - 1"
              @click="nextExercise"
            >
              →
            </button>
          </div>

          <h2 class="exercise-name">{{ currentExercise.name }}</h2>

          <div class="exercise-target">
            {{ currentExercise.targetSets }} sets × {{ currentExercise.targetReps }} reps
          </div>

          <div v-if="currentExercise.lastWeight !== null" class="last-weight">
            Last: {{ currentExercise.lastWeight }} lbs
            <span v-if="currentExercise.lastLogDate" class="last-date">
              ({{ currentExercise.lastLogDate }})
            </span>
          </div>

          <div v-if="currentExercise.description" class="exercise-description">
            {{ currentExercise.description }}
          </div>
        </div>

        <!-- Set logger -->
        <SetLogger
          :exercise="currentExercise"
          :logged-sets="setsForCurrentExercise"
          :next-set-number="nextSetNumber"
          :is-complete="isCurrentExerciseComplete"
          @log="handleLogSet"
          @remove="removeSet"
        />

        <!-- Quick nav button if exercise is complete -->
        <div v-if="isCurrentExerciseComplete" class="next-exercise-prompt">
          <button
            v-if="currentExerciseIndex < exercises.length - 1"
            class="btn btn-primary btn-block"
            @click="nextExercise"
          >
            Next Exercise →
          </button>
        </div>

        <!-- Exercise list -->
        <ExerciseList
          :exercises="exercises"
          :current-index="currentExerciseIndex"
          :workout-log="workoutLog"
          @select="goToExercise"
        />
      </template>
    </template>
  </div>
</template>

<style scoped>
.workout-execution {
  padding-top: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-text {
  color: var(--gray-500);
  font-size: 0.875rem;
}

.current-exercise {
  text-align: center;
}

.exercise-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.nav-btn {
  background: var(--gray-100);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.exercise-position {
  color: var(--gray-500);
  font-size: 0.875rem;
}

.exercise-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.exercise-target {
  color: var(--gray-600);
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.last-weight {
  background: var(--gray-100);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: inline-block;
  font-weight: 500;
  color: var(--primary);
}

.last-date {
  color: var(--gray-400);
  font-weight: 400;
  font-size: 0.875rem;
}

.exercise-description {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-600);
  text-align: left;
}

.next-exercise-prompt {
  margin-bottom: 1rem;
}

.error {
  text-align: center;
}

.error p {
  margin-bottom: 1rem;
  color: var(--danger);
}
</style>
