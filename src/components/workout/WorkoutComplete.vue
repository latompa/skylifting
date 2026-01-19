<script setup lang="ts">
defineProps<{
  workoutName: string
  exerciseCount: number
  setCount: number
}>()

const emit = defineEmits<{
  (e: 'finish'): void
}>()
</script>

<template>
  <div class="workout-complete card">
    <div class="success-icon">✓</div>
    <h2 class="title">Workout Complete!</h2>
    <p class="workout-name">{{ workoutName }}</p>

    <div class="stats">
      <div class="stat">
        <span class="stat-value">{{ exerciseCount }}</span>
        <span class="stat-label">Exercises</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ setCount }}</span>
        <span class="stat-label">Sets Logged</span>
      </div>
    </div>

    <button class="btn btn-success btn-block finish-btn" @click="emit('finish')">
      Finish Workout
    </button>
  </div>
</template>

<style scoped>
.workout-complete {
  text-align: center;
  padding: 2rem 1.5rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.workout-name {
  color: var(--gray-500);
  margin-bottom: 2rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.finish-btn {
  font-size: 1.125rem;
  padding: 1rem 2rem;
}
</style>
