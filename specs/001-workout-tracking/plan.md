# Implementation Plan: Skylifting - Gym Workout Tracker

**Branch**: `001-workout-tracking` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-workout-tracking/spec.md`

## Summary

Skylifting is a mobile-first Progressive Web App for tracking gym workouts. Users select from preset workout routines, log weights during exercise sessions, and the app automatically cycles through workouts. Core features include routine selection, workout execution with inline previous-weight display, history browsing, and routine customization. All data stored locally via IndexedDB with offline-first architecture.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Vue 3 (Composition API), Vite, vite-plugin-pwa
**Storage**: IndexedDB via `idb` wrapper (local only, no backend)
**Testing**: Vitest + Vue Test Utils
**Target Platform**: Mobile-first PWA (Chrome, Safari, Firefox - installable)
**Project Type**: Single frontend application (no backend)
**Performance Goals**: First paint <2s, interaction response <100ms, offline-capable
**Constraints**: Offline-first, <100KB initial bundle, works without network
**Scale/Scope**: Single user per device, indefinite history retention, 5-10 screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Simplicity & YAGNI

| Check | Status | Notes |
|-------|--------|-------|
| Simplest solution for current problem | ✅ Pass | Vue 3 + Vite is minimal viable stack for PWA |
| No speculative features | ✅ Pass | No backend, no auth, no sync - only what spec requires |
| No premature abstractions | ✅ Pass | Direct IndexedDB via idb, no ORM layers |
| Complexity justified in writing | ✅ Pass | See research.md for tech choice rationale |

### II. Explicit over Implicit

| Check | Status | Notes |
|-------|--------|-------|
| Behavior visible and predictable | ✅ Pass | Vue's reactivity is explicit via refs/reactive |
| No magic or hidden side effects | ✅ Pass | Service worker caching declared in config |
| Dependencies declared | ✅ Pass | All deps in package.json, no ambient globals |

### III. Incremental Delivery

| Check | Status | Notes |
|-------|--------|-------|
| Decomposable into testable slices | ✅ Pass | 5 user stories map to independent features |
| Each commit deployable | ✅ Pass | PWA can be deployed at any working state |
| No long-running branches | ✅ Pass | Feature branch will merge incrementally |

**Gate Status**: ✅ PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-workout-tracking/
├── plan.md              # This file
├── research.md          # Phase 0 output - tech decisions
├── data-model.md        # Phase 1 output - entity schemas
├── quickstart.md        # Phase 1 output - dev setup guide
├── contracts/           # Phase 1 output - TypeScript interfaces
│   └── api.ts           # Type definitions for data layer
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/          # Vue single-file components
│   ├── workout/         # Workout execution components
│   ├── routine/         # Routine selection/editing components
│   └── history/         # History viewing components
├── composables/         # Vue composition functions
│   ├── useRoutines.ts   # Routine state management
│   ├── useWorkout.ts    # Active workout state
│   └── useHistory.ts    # Workout log queries
├── db/                  # IndexedDB layer
│   ├── schema.ts        # Database schema definition
│   └── operations.ts    # CRUD operations
├── data/                # Default routine templates
│   └── templates.ts     # PPL, Upper/Lower, Full Body presets
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types (Routine, Workout, etc.)
├── App.vue              # Root component
└── main.ts              # App entry point

public/
├── manifest.json        # PWA manifest (generated)
└── icons/               # App icons for installation

tests/
├── unit/                # Component and composable tests
├── integration/         # Multi-component flow tests
└── e2e/                 # Full user journey tests (optional)
```

**Structure Decision**: Single frontend application with Vue SFC structure. No backend needed - all data lives in IndexedDB. PWA configuration handled by vite-plugin-pwa.

## Complexity Tracking

> No violations to justify - design follows constitution principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | - | - |
