<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoutines } from '../../composables/useRoutines'

const emit = defineEmits<{
  (e: 'select', routineId: string): void
}>()

const { routines, activeRoutineId, isLoading, loadRoutines } = useRoutines()

onMounted(loadRoutines)
</script>

<template>
  <div class="routine-list">
    <h2 class="page-title">Workout Routines</h2>

    <div v-if="isLoading" class="loading">Loading routines...</div>

    <template v-else>
      <div v-for="routine in routines" :key="routine.id" class="card routine-card" @click="emit('select', routine.id)">
        <div class="routine-header">
          <h3 class="routine-name">{{ routine.name }}</h3>
          <span v-if="routine.id === activeRoutineId" class="active-badge">Active</span>
          <span v-else-if="routine.isTemplate" class="template-badge">Template</span>
        </div>
        <p class="routine-description">{{ routine.description }}</p>
      </div>

      <div v-if="routines.length === 0" class="empty">
        <p>No routines available.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.routine-list {
  padding-top: 1rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.routine-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.routine-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.routine-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.routine-name {
  font-size: 1.125rem;
  font-weight: 600;
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

.template-badge {
  background: var(--gray-200);
  color: var(--gray-600);
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.routine-description {
  color: var(--gray-500);
  font-size: 0.875rem;
}

.empty {
  text-align: center;
  color: var(--gray-500);
  padding: 2rem;
}
</style>
