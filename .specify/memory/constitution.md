<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0
Bump rationale: Initial constitution creation (MAJOR)

Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (3 principles)
  - Development Workflow
  - Quality Standards
  - Governance

Removed sections: N/A (initial creation)

Templates status:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md ✅ compatible (no constitution-specific references)
  - .specify/templates/tasks-template.md ✅ compatible (no constitution-specific references)
  - .specify/templates/checklist-template.md ✅ compatible (no constitution-specific references)
  - .specify/templates/agent-file-template.md ✅ compatible (no constitution-specific references)

Follow-up TODOs: None
-->

# Skylifting Constitution

## Core Principles

### I. Simplicity & YAGNI

Every solution MUST be the simplest that solves the current problem. No speculative
features, premature abstractions, or "just in case" code.

**Rules**:
- Add code only when there is a concrete, immediate need
- Three similar lines of code are preferable to a premature abstraction
- Delete unused code completely; avoid backwards-compatibility shims
- If a simpler approach exists, use it—complexity MUST be justified in writing

**Rationale**: Complexity compounds. Unused abstractions become maintenance burdens.
Simple code is easier to read, test, debug, and change.

### II. Explicit over Implicit

Behavior MUST be visible and predictable. Avoid magic, hidden side effects, and
implicit conventions that require tribal knowledge.

**Rules**:
- Prefer explicit configuration over convention-based defaults
- Function names MUST describe what they do; avoid generic names like `process` or `handle`
- Side effects MUST be documented or made obvious through naming
- Dependencies MUST be declared, not assumed from environment

**Rationale**: Implicit behavior creates onboarding friction and debugging nightmares.
Explicit code is self-documenting and reduces surprises.

### III. Incremental Delivery

Ship working increments frequently. Each change MUST leave the system in a
deployable state.

**Rules**:
- Features MUST be decomposable into independently testable slices
- Each commit SHOULD represent a logical, working increment
- Avoid long-running branches; integrate changes daily when possible
- If a feature cannot be shipped incrementally, break it down further

**Rationale**: Small, frequent releases reduce risk, enable faster feedback, and
maintain team momentum.

## Development Workflow

**Code Changes**:
- All changes MUST pass existing tests before merge
- New functionality SHOULD include tests proportional to its complexity
- Refactoring and feature work MUST NOT be combined in the same commit

**Review Process**:
- Changes affecting multiple components require review
- Review focuses on: correctness, simplicity, and adherence to principles
- Nitpicks are optional; blocking feedback MUST cite principle violations

## Quality Standards

**Code Quality**:
- Code MUST be readable without requiring comments to explain basic logic
- Error handling MUST be explicit; fail fast with clear messages
- External API boundaries MUST validate inputs

**Testing**:
- Critical paths MUST have test coverage
- Tests MUST be deterministic and independent
- Flaky tests MUST be fixed or removed promptly

## Governance

This constitution establishes the non-negotiable principles for Skylifting development.

**Amendment Process**:
1. Propose changes with rationale in writing
2. Changes require documented approval
3. Update version following semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or material expansion
   - PATCH: Clarifications and non-semantic refinements
4. All dependent templates MUST be reviewed for consistency after amendments

**Compliance**:
- All code reviews MUST verify adherence to Core Principles
- Violations MUST be justified in the Complexity Tracking section of the plan
- This constitution supersedes conflicting practices

**Version**: 1.0.0 | **Ratified**: 2026-01-18 | **Last Amended**: 2026-01-18
