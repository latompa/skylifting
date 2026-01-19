# Feature Specification: Skylifting - Gym Workout Tracker

**Feature Branch**: `001-workout-tracking`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "Skylifting gym workout tracking app with routines, workouts, exercises, and automatic workout cycling"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Execute a Workout Session (Priority: P1)

As a gym-goer, I want to start a workout from my active routine and log the weights I lift for each exercise, so I can track my performance during my gym session.

**Why this priority**: This is the core value proposition - without the ability to execute and log a workout, the app provides no utility. Users need this to replace their paper notebooks or mental tracking.

**Independent Test**: Can be fully tested by starting a workout, viewing exercises in order, logging weights for each set, and completing the session. Delivers immediate value of workout logging.

**Acceptance Scenarios**:

1. **Given** a user has an active routine with workouts, **When** they start the next scheduled workout, **Then** they see the first exercise with its prescribed sets and reps
2. **Given** a user has previously logged weight for an exercise, **When** they view that exercise during a workout, **Then** the most recent weight logged is displayed as reference
3. **Given** a user is viewing an exercise during a workout, **When** they log the weight for a set, **Then** the weight is recorded and they can proceed to the next set
4. **Given** a user has completed all sets of an exercise, **When** they move to the next exercise, **Then** the next exercise in the workout is displayed with its sets/reps
5. **Given** a user has completed all exercises, **When** they finish the workout, **Then** the session is saved and the next workout in the routine is queued

---

### User Story 2 - Select and Activate a Routine (Priority: P2)

As a new user, I want to browse available workout routines and select one to follow, so I have a structured plan for my gym sessions.

**Why this priority**: Users need a routine before they can execute workouts. This enables the P1 story but can be tested independently with pre-loaded templates.

**Independent Test**: Can be fully tested by browsing routine templates, viewing their workout/exercise structure, and selecting one as active. Delivers value of structured workout planning.

**Acceptance Scenarios**:

1. **Given** a user opens the routine selection screen, **When** they view available routines, **Then** they see a list of default routine templates with names and descriptions
2. **Given** a user is viewing a routine, **When** they inspect its details, **Then** they see all workouts in the routine and exercises within each workout
3. **Given** a user has selected a routine, **When** they activate it, **Then** that routine becomes their active routine and the first workout is ready to start

---

### User Story 3 - Automatic Workout Cycling (Priority: P3)

As a regular gym-goer, I want the app to automatically queue the next workout in my routine after completing one, so I don't have to manually track where I am in my program.

**Why this priority**: This convenience feature differentiates Skylifting from basic logging apps. It requires P1 (workout execution) to be meaningful.

**Independent Test**: Can be tested by completing multiple workouts over several sessions and verifying the correct workout is suggested each time, including cycling back to workout 1.

**Acceptance Scenarios**:

1. **Given** a user completed workout 1 of a 3-workout routine yesterday, **When** they open the app today, **Then** workout 2 is suggested as the next workout
2. **Given** a user completed workout 3 (the last workout) of their routine, **When** they open the app for their next session, **Then** workout 1 is suggested (cycle restarts)
3. **Given** a user has not started any workout in their active routine, **When** they view the home screen, **Then** workout 1 is suggested as the starting point

---

### User Story 4 - Customize Routine and Exercises (Priority: P4)

As an experienced lifter, I want to edit the exercises, sets, and reps in my routine, so I can tailor the program to my specific needs and preferences.

**Why this priority**: Customization extends the app's utility beyond templates but is not essential for core tracking functionality.

**Independent Test**: Can be tested by modifying exercises in a routine, changing set/rep schemes, and verifying changes persist in subsequent workout sessions.

**Acceptance Scenarios**:

1. **Given** a user is viewing their active routine, **When** they edit an exercise's sets or reps, **Then** the changes are saved and reflected in future workout sessions
2. **Given** a user is editing a workout, **When** they add a new exercise, **Then** the exercise appears in the workout's exercise list
3. **Given** a user is editing a workout, **When** they remove an exercise, **Then** the exercise no longer appears in that workout
4. **Given** a user is editing a workout, **When** they reorder exercises, **Then** the new order is preserved for future sessions

---

### User Story 5 - View Workout History (Priority: P5)

As a user tracking my progress, I want to browse my past workouts and see what weights I lifted, so I can track my strength gains over time.

**Why this priority**: History viewing enhances the value of logged data but is not required for the core logging loop. The inline "previous weight" display (P1) provides the most critical history access.

**Independent Test**: Can be tested by completing several workouts, then browsing the history to view past sessions and their details.

**Acceptance Scenarios**:

1. **Given** a user has completed workouts in the past, **When** they open the history view, **Then** they see a list of past workout sessions with dates
2. **Given** a user is viewing their workout history, **When** they select a past workout, **Then** they see all exercises and weights logged in that session

---

### Edge Cases

- What happens when a user abandons a workout mid-session? (Partial progress is saved; workout can be resumed or restarted)
- What happens when a user skips a workout and starts a different one? (The selected workout is logged; cycling continues from where they chose)
- What happens when a user deletes their only active routine? (User is prompted to select or create a new routine)
- What happens when a user logs 0 weight for a set? (Allowed - represents bodyweight or skipped set)
- What happens when a routine has only 1 workout? (Cycling always returns to workout 1)

## Requirements *(mandatory)*

### Functional Requirements

**Routine Management**
- **FR-001**: System MUST provide at least 3 default routine templates for users to choose from
- **FR-002**: System MUST allow users to have exactly one active routine at a time
- **FR-003**: Users MUST be able to view all workouts within a routine before activating it
- **FR-004**: Users MUST be able to switch their active routine at any time

**Workout Execution**
- **FR-005**: System MUST display the suggested next workout based on cycling logic when user opens the app
- **FR-006**: System MUST show all exercises for the current workout in their defined order
- **FR-007**: System MUST display the prescribed sets and reps for each exercise
- **FR-008**: System MUST display the most recent weight logged for each exercise when starting a workout (if available)
- **FR-009**: Users MUST be able to log the weight lifted for each set of each exercise
- **FR-010**: System MUST allow users to complete a workout and save all logged data
- **FR-011**: System MUST track which workout was most recently completed for cycling purposes

**History Viewing**
- **FR-012**: Users MUST be able to browse their complete workout history
- **FR-013**: Users MUST be able to view details of any past workout session (date, exercises, weights logged)

**Workout Cycling**
- **FR-014**: System MUST automatically suggest the next sequential workout after one is completed
- **FR-015**: System MUST cycle back to workout 1 after the last workout in a routine is completed
- **FR-016**: Users MUST be able to manually start any workout regardless of cycling suggestion

**Customization**
- **FR-017**: Users MUST be able to edit the sets and reps for any exercise in their active routine
- **FR-018**: Users MUST be able to add exercises to a workout in their active routine
- **FR-019**: Users MUST be able to remove exercises from a workout in their active routine
- **FR-020**: Users MUST be able to reorder exercises within a workout

**Data Persistence**
- **FR-021**: System MUST persist all workout logs including date, exercises performed, and weights lifted
- **FR-022**: System MUST persist user's active routine selection across sessions
- **FR-023**: System MUST persist customizations made to routines
- **FR-024**: System MUST retain workout history indefinitely (no automatic deletion)

### Key Entities

- **Routine**: A named collection of workouts meant to be followed cyclically (e.g., "Push/Pull/Legs"). Has a name, description, and ordered list of workouts. A user can have one active routine.

- **Workout**: A single gym session template within a routine (e.g., "Push Day", "Workout A"). Has a name, position in the routine's cycle, and ordered list of exercises.

- **Exercise**: A specific movement with prescribed volume (e.g., "Bench Press: 5 sets x 5 reps"). Has a name, target sets, and target reps.

- **Workout Log**: A record of a completed workout session. Contains the date, which workout was performed, and individual set logs.

- **Set Log**: A record of one set performed. Contains the exercise, set number, and weight lifted.

## Clarifications

### Session 2026-01-18

- Q: What is the target platform? → A: Mobile-first PWA (installable, works offline)
- Q: Is user authentication required? → A: No authentication - local storage only (anonymous)
- Q: How long should workout history be retained? → A: Indefinite (keep all history)
- Q: Can users view past workout history? → A: Yes - last weight per exercise shown inline during workout + full history browser

## Assumptions

- Platform is a mobile-first Progressive Web App (PWA) that can be installed on devices and works offline
- No user authentication required; all data stored locally on device (anonymous usage)
- Users have a single device and do not require cross-device sync (can be added later)
- Weight units default to the user's locale preference (lbs for US, kg elsewhere)
- Default routine templates will include common programs like PPL, Upper/Lower, and Full Body
- A workout session is tied to a calendar day; starting a new workout on the same day replaces any incomplete session
- Exercise names come from a predefined list in templates; custom exercise naming is out of scope for initial release

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start a workout and log their first exercise within 30 seconds of opening the app
- **SC-002**: Users can log weight for a complete workout (8 exercises, 4 sets each) in under 10 minutes of active app time
- **SC-003**: 90% of users can successfully select a routine and start their first workout without external help
- **SC-004**: Workout cycling correctly suggests the next workout 100% of the time based on completion history
- **SC-005**: All workout data persists correctly across app restarts with zero data loss
- **SC-006**: Users report the app is faster to use than paper tracking (validated via user feedback)
