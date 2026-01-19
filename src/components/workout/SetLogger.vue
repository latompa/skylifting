<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ExerciseWithLastWeight, SetLog } from '../../types'

const props = defineProps<{
  exercise: ExerciseWithLastWeight
  loggedSets: SetLog[]
  nextSetNumber: number
  isComplete: boolean
}>()

const emit = defineEmits<{
  (e: 'log', weight: number, reps?: number, notes?: string): void
  (e: 'remove', setLogId: string): void
}>()

const weight = ref<number | null>(null)
const reps = ref<number | null>(null)
const notes = ref('')
const showNotes = ref(false)

// Pre-fill weight with last logged weight
watch(
  () => props.exercise,
  (newExercise) => {
    if (newExercise.lastWeight !== null) {
      weight.value = newExercise.lastWeight
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (weight.value === null || weight.value < 0) return

  emit(
    'log',
    weight.value,
    reps.value !== null ? reps.value : undefined,
    notes.value.trim() || undefined
  )

  // Reset reps and notes for next set, keep weight
  reps.value = null
  notes.value = ''
  showNotes.value = false
}

function handleRemoveSet(setId: string) {
  if (confirm('Remove this set?')) {
    emit('remove', setId)
  }
}
</script>

<template>
  <div class="set-logger card">
    <h3 class="section-title">
      {{ isComplete ? 'All sets complete!' : `Set ${nextSetNumber} of ${exercise.targetSets}` }}
    </h3>

    <!-- Logged sets display -->
    <div v-if="loggedSets.length > 0" class="logged-sets">
      <div v-for="set in loggedSets" :key="set.id" class="logged-set">
        <div class="set-info">
          <span class="set-number">Set {{ set.setNumber }}</span>
          <span class="set-weight">{{ set.weight }} lbs</span>
          <span v-if="set.reps" class="set-reps">× {{ set.reps }}</span>
        </div>
        <div v-if="set.notes" class="set-notes">{{ set.notes }}</div>
        <button class="remove-btn" @click="handleRemoveSet(set.id)" title="Remove set">×</button>
      </div>
    </div>

    <!-- Input form (show unless all sets are complete) -->
    <form v-if="!isComplete" class="input-form" @submit.prevent="handleSubmit">
      <div class="input-row">
        <div class="input-group weight-input">
          <label class="label">Weight (lbs)</label>
          <input
            v-model.number="weight"
            type="number"
            class="input"
            min="0"
            step="2.5"
            inputmode="decimal"
            placeholder="0"
            required
          />
        </div>

        <div class="input-group reps-input">
          <label class="label">Reps <span class="optional">(optional)</span></label>
          <input
            v-model.number="reps"
            type="number"
            class="input"
            min="0"
            inputmode="numeric"
            :placeholder="String(exercise.targetReps)"
          />
        </div>
      </div>

      <div v-if="showNotes" class="notes-input">
        <label class="label">Notes</label>
        <input
          v-model="notes"
          type="text"
          class="input"
          placeholder="How did it feel?"
        />
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="showNotes = !showNotes"
        >
          {{ showNotes ? 'Hide Notes' : '+ Notes' }}
        </button>
        <button
          type="submit"
          class="btn btn-primary log-btn"
          :disabled="weight === null || weight < 0"
        >
          Log Set
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.set-logger {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 1rem;
  text-align: center;
}

.logged-sets {
  margin-bottom: 1rem;
}

.logged-set {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--gray-50);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  position: relative;
}

.set-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.set-number {
  font-weight: 500;
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
  margin-top: 0.25rem;
  font-style: italic;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--gray-400);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.remove-btn:hover {
  color: var(--danger);
}

.input-form {
  margin-top: 1rem;
}

.input-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.input-group {
  flex: 1;
}

.weight-input {
  flex: 1.2;
}

.reps-input {
  flex: 1;
}

.optional {
  color: var(--gray-400);
  font-weight: 400;
}

.notes-input {
  margin-bottom: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.log-btn {
  flex: 1;
  max-width: 200px;
}
</style>
