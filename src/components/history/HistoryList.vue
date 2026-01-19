<script setup lang="ts">
import { onMounted } from 'vue'
import { useHistory } from '../../composables/useHistory'

const emit = defineEmits<{
  (e: 'select', workoutLogId: string): void
}>()

const { history, isLoading, loadHistory } = useHistory()

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => loadHistory())
</script>

<template>
  <div class="history-list">
    <h2 class="page-title">Workout History</h2>

    <div v-if="isLoading" class="loading">Loading history...</div>

    <template v-else>
      <div
        v-for="entry in history"
        :key="entry.log.id"
        class="card history-card"
        @click="emit('select', entry.log.id)"
      >
        <div class="history-header">
          <span class="history-date">{{ formatDate(entry.log.date) }}</span>
          <span v-if="entry.log.location" class="history-location">{{ entry.log.location }}</span>
        </div>
        <h3 class="workout-name">{{ entry.workoutName }}</h3>
        <div class="history-meta">
          <span class="routine-name">{{ entry.routineName }}</span>
          <span class="separator">•</span>
          <span class="exercise-count">{{ entry.exerciseCount }} exercises</span>
        </div>
      </div>

      <div v-if="history.length === 0" class="empty">
        <p>No workout history yet.</p>
        <p class="hint">Complete your first workout to see it here!</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.history-list {
  padding-top: 1rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.history-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-date {
  font-size: 0.875rem;
  color: var(--gray-500);
  font-weight: 500;
}

.history-location {
  font-size: 0.75rem;
  color: var(--gray-400);
  background: var(--gray-100);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
}

.workout-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-500);
}

.separator {
  color: var(--gray-300);
}

.empty {
  text-align: center;
  padding: 2rem;
  color: var(--gray-500);
}

.hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>
