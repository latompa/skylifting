<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { initializeWithDefaults, isInitialized } from './db/operations'
import HomeScreen from './components/HomeScreen.vue'
import RoutineList from './components/routine/RoutineList.vue'
import RoutineDetail from './components/routine/RoutineDetail.vue'
import RoutineEditor from './components/routine/RoutineEditor.vue'
import WorkoutEditor from './components/routine/WorkoutEditor.vue'
import WorkoutExecution from './components/workout/WorkoutExecution.vue'
import HistoryList from './components/history/HistoryList.vue'
import HistoryDetail from './components/history/HistoryDetail.vue'

export type View =
  | 'home'
  | 'routines'
  | 'routine-detail'
  | 'routine-editor'
  | 'workout-editor'
  | 'workout'
  | 'history'
  | 'history-detail'

const currentView = ref<View>('home')
const selectedRoutineId = ref<string | null>(null)
const selectedWorkoutId = ref<string | null>(null)
const selectedWorkoutLogId = ref<string | null>(null)
const isLoading = ref(true)

function navigate(view: View, params?: { routineId?: string; workoutId?: string; workoutLogId?: string }) {
  currentView.value = view
  if (params?.routineId !== undefined) selectedRoutineId.value = params.routineId
  if (params?.workoutId !== undefined) selectedWorkoutId.value = params.workoutId
  if (params?.workoutLogId !== undefined) selectedWorkoutLogId.value = params.workoutLogId
}

provide('navigate', navigate)

onMounted(async () => {
  try {
    const initialized = await isInitialized()
    if (!initialized) {
      await initializeWithDefaults()
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title" @click="navigate('home')">Skylifting</h1>
      <nav class="app-nav">
        <button
          :class="{ active: currentView === 'home' }"
          @click="navigate('home')"
        >
          Home
        </button>
        <button
          :class="{ active: currentView === 'routines' || currentView.startsWith('routine') }"
          @click="navigate('routines')"
        >
          Routines
        </button>
        <button
          :class="{ active: currentView === 'history' || currentView === 'history-detail' }"
          @click="navigate('history')"
        >
          History
        </button>
      </nav>
    </header>

    <main class="app-main">
      <div v-if="isLoading" class="loading">Loading...</div>

      <template v-else>
        <HomeScreen
          v-if="currentView === 'home'"
          @start-workout="(id) => navigate('workout', { workoutId: id })"
          @select-routine="navigate('routines')"
        />

        <RoutineList
          v-else-if="currentView === 'routines'"
          @select="(id) => navigate('routine-detail', { routineId: id })"
        />

        <RoutineDetail
          v-else-if="currentView === 'routine-detail' && selectedRoutineId"
          :routine-id="selectedRoutineId"
          @back="navigate('routines')"
          @edit="(id) => navigate('routine-editor', { routineId: id })"
          @activated="navigate('home')"
        />

        <RoutineEditor
          v-else-if="currentView === 'routine-editor' && selectedRoutineId"
          :routine-id="selectedRoutineId"
          @back="navigate('routine-detail', { routineId: selectedRoutineId })"
          @edit-workout="(id) => navigate('workout-editor', { workoutId: id })"
        />

        <WorkoutEditor
          v-else-if="currentView === 'workout-editor' && selectedWorkoutId"
          :workout-id="selectedWorkoutId"
          @back="navigate('routine-editor', { routineId: selectedRoutineId! })"
        />

        <WorkoutExecution
          v-else-if="currentView === 'workout' && selectedWorkoutId"
          :workout-id="selectedWorkoutId"
          @complete="navigate('home')"
          @cancel="navigate('home')"
        />

        <HistoryList
          v-else-if="currentView === 'history'"
          @select="(id) => navigate('history-detail', { workoutLogId: id })"
        />

        <HistoryDetail
          v-else-if="currentView === 'history-detail' && selectedWorkoutLogId"
          :workout-log-id="selectedWorkoutLogId"
          @back="navigate('history')"
        />
      </template>
    </main>
  </div>
</template>

<style>
:root {
  --primary: #4f46e5;
  --primary-dark: #4338ca;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--gray-100);
  color: var(--gray-900);
  line-height: 1.5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: var(--primary);
  color: white;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.app-nav {
  display: flex;
  gap: 0.5rem;
}

.app-nav button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.app-nav button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.app-nav button.active {
  background: white;
  color: var(--primary);
  border-color: white;
}

.app-main {
  flex: 1;
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--gray-500);
}

/* Shared component styles */
.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--gray-200);
  color: var(--gray-700);
}

.btn-secondary:hover {
  background: var(--gray-300);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-block {
  width: 100%;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.25rem;
}
</style>
