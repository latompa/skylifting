# Research: Skylifting Technical Decisions

**Date**: 2026-01-18
**Feature**: 001-workout-tracking

## Research Questions

1. What is the optimal tech stack for a mobile-first PWA with offline support?
2. How should we handle local data persistence for indefinite history?
3. What testing approach works best for PWA applications?

---

## Decision 1: Frontend Framework

**Decision**: Vue 3 with Composition API

**Rationale**:
- Right-sized complexity for a single-page PWA
- Built-in reactivity eliminates need for external state management
- Vite (built by Vue creator) provides excellent PWA tooling
- Bundle size (~40-60KB) is acceptable for cached PWA
- Single-file components reduce boilerplate

**Alternatives Considered**:

| Option | Rejected Because |
|--------|------------------|
| React + Vite | Larger bundle (~55-85KB), ecosystem encourages over-engineering, needs external state management |
| SvelteKit | Less mature PWA tooling, fewer IndexedDB patterns documented, smaller troubleshooting community |
| Vanilla JS | False simplicity - maintenance burden grows quickly, no component patterns, poor DX |

---

## Decision 2: Build Tooling & PWA Support

**Decision**: Vite + vite-plugin-pwa

**Rationale**:
- Vite provides fast dev server with HMR
- vite-plugin-pwa handles service worker generation via Workbox
- Auto-generates PWA manifest
- Mature plugin with 200k+ weekly downloads
- Same ecosystem as Vue (maintained by Anthony Fu)

**Alternatives Considered**:

| Option | Rejected Because |
|--------|------------------|
| Webpack + Workbox | Slower build times, more configuration required |
| Manual service workers | Error-prone, reinventing solved problems |

---

## Decision 3: Data Persistence

**Decision**: IndexedDB via `idb` wrapper

**Rationale**:
- IndexedDB is the only browser storage suitable for structured data with indefinite retention
- `idb` by Jake Archibald is minimal (~1.5KB), Promise-based, and well-maintained
- No backend needed - all data local to device
- Supports complex queries for workout history

**Alternatives Considered**:

| Option | Rejected Because |
|--------|------------------|
| localStorage | 5MB limit, no indexing, string-only storage |
| Dexie.js | 25KB - overkill for our simple query needs |
| localForage | 8KB, key-value only - insufficient for relational data |

---

## Decision 4: Testing Strategy

**Decision**: Vitest + Vue Test Utils

**Rationale**:
- Vitest is Vite-native (shares config, fast execution)
- Vue Test Utils provides component testing utilities
- Same test syntax as Jest (familiar)
- Supports TypeScript out of the box

**Testing Layers**:
1. **Unit tests**: Composables, data operations, utility functions
2. **Integration tests**: Component interactions, IndexedDB operations
3. **E2E tests**: Optional - can add Playwright later if needed

---

## Decision 5: CSS Approach

**Decision**: Native CSS with CSS custom properties

**Rationale**:
- Mobile-first PWA needs minimal CSS overhead
- Vue scoped styles prevent leakage
- CSS custom properties for theming (light/dark later)
- No build-time CSS processing needed

**Alternatives Considered**:

| Option | Rejected Because |
|--------|------------------|
| Tailwind CSS | Adds build complexity, overkill for 5-10 screens |
| UnoCSS | Nice but unnecessary for small app |
| CSS-in-JS | Runtime overhead, not needed with Vue scoped styles |

---

## Decision 6: TypeScript Usage

**Decision**: Yes, with strict mode

**Rationale**:
- Type safety for data models (Routine, Workout, Exercise, etc.)
- Better IDE support and refactoring
- Catches errors at compile time
- Vue 3 has excellent TypeScript support

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Framework choice | Vue 3 - balanced complexity/capability |
| State management | Vue's built-in reactivity (no Pinia/Vuex needed) |
| Routing | Vue Router (if multi-page) or simple conditional rendering |
| PWA caching strategy | Cache-first for assets, network-first for nothing (no API) |

---

## Dependencies Summary

```json
{
  "dependencies": {
    "vue": "^3.4",
    "idb": "^8.0"
  },
  "devDependencies": {
    "vite": "^5.0",
    "vite-plugin-pwa": "^0.19",
    "typescript": "^5.3",
    "vitest": "^1.2",
    "@vue/test-utils": "^2.4"
  }
}
```

**Total production dependencies**: 2 (Vue + idb)
**Estimated bundle size**: ~45KB gzipped
