export interface RoutineTemplate {
  name: string;
  description: string;
  workouts: WorkoutTemplate[];
}

export interface WorkoutTemplate {
  name: string;
  exercises: ExerciseTemplate[];
}

export interface ExerciseTemplate {
  name: string;
  description?: string;
  targetSets: number;
  targetReps: number;
}

export const defaultRoutines: RoutineTemplate[] = [
  {
    name: 'Push/Pull/Legs',
    description: 'Classic 3-day split targeting push, pull, and leg muscles separately',
    workouts: [
      {
        name: 'Push Day',
        exercises: [
          { name: 'Bench Press', description: 'Keep shoulder blades pinched, lower to chest', targetSets: 4, targetReps: 8 },
          { name: 'Overhead Press', description: 'Brace core, press overhead in straight line', targetSets: 3, targetReps: 10 },
          { name: 'Incline Dumbbell Press', description: 'Set bench to 30-45 degrees', targetSets: 3, targetReps: 10 },
          { name: 'Tricep Pushdown', description: 'Keep elbows pinned to sides', targetSets: 3, targetReps: 12 },
          { name: 'Lateral Raises', description: 'Slight bend in elbows, raise to shoulder height', targetSets: 3, targetReps: 15 },
        ],
      },
      {
        name: 'Pull Day',
        exercises: [
          { name: 'Barbell Row', description: 'Hinge at hips, pull to lower chest', targetSets: 4, targetReps: 8 },
          { name: 'Pull-ups', description: 'Full range of motion, chin over bar', targetSets: 3, targetReps: 8 },
          { name: 'Seated Cable Row', description: 'Squeeze shoulder blades at contraction', targetSets: 3, targetReps: 10 },
          { name: 'Face Pulls', description: 'Pull to face level, externally rotate', targetSets: 3, targetReps: 15 },
          { name: 'Barbell Curl', description: 'Keep elbows stationary', targetSets: 3, targetReps: 12 },
        ],
      },
      {
        name: 'Legs Day',
        exercises: [
          { name: 'Squat', description: 'Break at hips and knees simultaneously, depth to parallel', targetSets: 4, targetReps: 8 },
          { name: 'Romanian Deadlift', description: 'Slight knee bend, hinge at hips, feel hamstring stretch', targetSets: 3, targetReps: 10 },
          { name: 'Leg Press', description: 'Lower until knees at 90 degrees', targetSets: 3, targetReps: 12 },
          { name: 'Leg Curl', description: 'Control the eccentric', targetSets: 3, targetReps: 12 },
          { name: 'Calf Raises', description: 'Full stretch at bottom, pause at top', targetSets: 4, targetReps: 15 },
        ],
      },
    ],
  },
  {
    name: 'Upper/Lower',
    description: '4-day split alternating between upper and lower body workouts',
    workouts: [
      {
        name: 'Upper Body A',
        exercises: [
          { name: 'Bench Press', description: 'Keep shoulder blades pinched, lower to chest', targetSets: 4, targetReps: 6 },
          { name: 'Barbell Row', description: 'Hinge at hips, pull to lower chest', targetSets: 4, targetReps: 6 },
          { name: 'Overhead Press', description: 'Brace core, press overhead in straight line', targetSets: 3, targetReps: 8 },
          { name: 'Pull-ups', description: 'Full range of motion, chin over bar', targetSets: 3, targetReps: 8 },
          { name: 'Tricep Dips', description: 'Lower until upper arms parallel to floor', targetSets: 3, targetReps: 10 },
          { name: 'Barbell Curl', description: 'Keep elbows stationary', targetSets: 3, targetReps: 10 },
        ],
      },
      {
        name: 'Lower Body A',
        exercises: [
          { name: 'Squat', description: 'Break at hips and knees simultaneously, depth to parallel', targetSets: 4, targetReps: 6 },
          { name: 'Romanian Deadlift', description: 'Slight knee bend, hinge at hips, feel hamstring stretch', targetSets: 4, targetReps: 8 },
          { name: 'Leg Press', description: 'Lower until knees at 90 degrees', targetSets: 3, targetReps: 10 },
          { name: 'Leg Curl', description: 'Control the eccentric', targetSets: 3, targetReps: 10 },
          { name: 'Leg Extension', description: 'Full contraction at top', targetSets: 3, targetReps: 12 },
          { name: 'Calf Raises', description: 'Full stretch at bottom, pause at top', targetSets: 4, targetReps: 12 },
        ],
      },
    ],
  },
  {
    name: 'Full Body',
    description: '3-day full body routine hitting all major muscle groups each session',
    workouts: [
      {
        name: 'Full Body A',
        exercises: [
          { name: 'Squat', description: 'Break at hips and knees simultaneously, depth to parallel', targetSets: 3, targetReps: 8 },
          { name: 'Bench Press', description: 'Keep shoulder blades pinched, lower to chest', targetSets: 3, targetReps: 8 },
          { name: 'Barbell Row', description: 'Hinge at hips, pull to lower chest', targetSets: 3, targetReps: 8 },
          { name: 'Overhead Press', description: 'Brace core, press overhead in straight line', targetSets: 3, targetReps: 10 },
          { name: 'Romanian Deadlift', description: 'Slight knee bend, hinge at hips, feel hamstring stretch', targetSets: 3, targetReps: 10 },
          { name: 'Plank', description: 'Keep body in straight line, brace core', targetSets: 3, targetReps: 60 },
          { name: 'Barbell Curl', description: 'Keep elbows stationary', targetSets: 2, targetReps: 12 },
          { name: 'Tricep Pushdown', description: 'Keep elbows pinned to sides', targetSets: 2, targetReps: 12 },
        ],
      },
      {
        name: 'Full Body B',
        exercises: [
          { name: 'Deadlift', description: 'Brace core, drive through floor, keep bar close', targetSets: 3, targetReps: 6 },
          { name: 'Incline Dumbbell Press', description: 'Set bench to 30-45 degrees', targetSets: 3, targetReps: 10 },
          { name: 'Pull-ups', description: 'Full range of motion, chin over bar', targetSets: 3, targetReps: 8 },
          { name: 'Dumbbell Lunges', description: 'Step forward, lower back knee toward floor', targetSets: 3, targetReps: 10 },
          { name: 'Lateral Raises', description: 'Slight bend in elbows, raise to shoulder height', targetSets: 3, targetReps: 15 },
          { name: 'Face Pulls', description: 'Pull to face level, externally rotate', targetSets: 3, targetReps: 15 },
          { name: 'Hammer Curl', description: 'Keep elbows stationary, neutral grip', targetSets: 2, targetReps: 12 },
          { name: 'Skull Crushers', description: 'Lower to forehead, extend fully', targetSets: 2, targetReps: 12 },
        ],
      },
      {
        name: 'Full Body C',
        exercises: [
          { name: 'Front Squat', description: 'Elbows high, stay upright, depth to parallel', targetSets: 3, targetReps: 8 },
          { name: 'Dumbbell Bench Press', description: 'Full range of motion, squeeze at top', targetSets: 3, targetReps: 10 },
          { name: 'Seated Cable Row', description: 'Squeeze shoulder blades at contraction', targetSets: 3, targetReps: 10 },
          { name: 'Arnold Press', description: 'Rotate palms as you press', targetSets: 3, targetReps: 10 },
          { name: 'Hip Thrust', description: 'Drive through heels, squeeze glutes at top', targetSets: 3, targetReps: 12 },
          { name: 'Leg Curl', description: 'Control the eccentric', targetSets: 3, targetReps: 12 },
          { name: 'Calf Raises', description: 'Full stretch at bottom, pause at top', targetSets: 3, targetReps: 15 },
          { name: 'Ab Wheel Rollout', description: 'Keep core braced, extend as far as possible', targetSets: 3, targetReps: 10 },
        ],
      },
    ],
  },
];

export const exerciseList = [
  // Chest
  'Bench Press',
  'Incline Bench Press',
  'Decline Bench Press',
  'Dumbbell Bench Press',
  'Incline Dumbbell Press',
  'Dumbbell Flyes',
  'Cable Crossover',
  'Push-ups',
  'Chest Dips',

  // Back
  'Deadlift',
  'Barbell Row',
  'Dumbbell Row',
  'Pull-ups',
  'Chin-ups',
  'Lat Pulldown',
  'Seated Cable Row',
  'T-Bar Row',
  'Face Pulls',

  // Shoulders
  'Overhead Press',
  'Arnold Press',
  'Lateral Raises',
  'Front Raises',
  'Rear Delt Flyes',
  'Upright Row',
  'Shrugs',

  // Legs
  'Squat',
  'Front Squat',
  'Leg Press',
  'Leg Extension',
  'Leg Curl',
  'Romanian Deadlift',
  'Stiff-Leg Deadlift',
  'Hip Thrust',
  'Dumbbell Lunges',
  'Bulgarian Split Squat',
  'Calf Raises',
  'Seated Calf Raises',

  // Arms
  'Barbell Curl',
  'Dumbbell Curl',
  'Hammer Curl',
  'Preacher Curl',
  'Cable Curl',
  'Tricep Pushdown',
  'Tricep Dips',
  'Skull Crushers',
  'Overhead Tricep Extension',
  'Close-Grip Bench Press',

  // Core
  'Plank',
  'Ab Wheel Rollout',
  'Hanging Leg Raise',
  'Cable Crunch',
  'Russian Twist',
  'Dead Bug',
];
