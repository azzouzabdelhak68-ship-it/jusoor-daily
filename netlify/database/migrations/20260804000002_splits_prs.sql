-- Jusoor Daily — migration 2: adaptive workout splits + PR tracking

CREATE TABLE splits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Split',
  days JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prs (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_name TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX prs_exercise_idx ON prs (exercise_name);

-- Seed a default active split: Push / Pull / Rest / Legs / Cardio / Rest
INSERT INTO splits (name, days, is_active) VALUES (
  'Classic PPL + Cardio',
  '[{"label":"Push","rest":false,"exercises":[{"name":"Bench Press","muscle":"Chest","equipment":"Barbell","sets":4,"reps":8,"icon":"🏋️"},{"name":"Overhead Press","muscle":"Shoulders","equipment":"Barbell","sets":4,"reps":8,"icon":"🏋️"},{"name":"Incline Dumbbell Press","muscle":"Chest","equipment":"Dumbbell","sets":3,"reps":10,"icon":"🏋️"},{"name":"Lateral Raises","muscle":"Shoulders","equipment":"Dumbbell","sets":4,"reps":12,"icon":"🏋️"},{"name":"Tricep Dips","muscle":"Triceps","equipment":"Bodyweight","sets":3,"reps":12,"icon":"🏋️"}]},{"label":"Pull","rest":false,"exercises":[{"name":"Deadlift","muscle":"Back","equipment":"Barbell","sets":4,"reps":6,"icon":"🧗"},{"name":"Barbell Row","muscle":"Back","equipment":"Barbell","sets":4,"reps":8,"icon":"🧗"},{"name":"Pull-Ups","muscle":"Back","equipment":"Bodyweight","sets":4,"reps":8,"icon":"🧗"},{"name":"Face Pulls","muscle":"Shoulders","equipment":"Cable","sets":3,"reps":15,"icon":"🛡️"},{"name":"Bicep Curls","muscle":"Biceps","equipment":"Barbell","sets":3,"reps":12,"icon":"💪"}]},{"label":"Rest","rest":true,"exercises":[]},{"label":"Legs","rest":false,"exercises":[{"name":"Squats","muscle":"Quads","equipment":"Barbell","sets":4,"reps":8,"icon":"🦵"},{"name":"Romanian Deadlift","muscle":"Hamstrings","equipment":"Barbell","sets":4,"reps":10,"icon":"🦵"},{"name":"Leg Press","muscle":"Quads","equipment":"Machine","sets":3,"reps":12,"icon":"🦵"},{"name":"Walking Lunges","muscle":"Glutes","equipment":"Dumbbell","sets":3,"reps":12,"icon":"🍑"},{"name":"Calf Raises","muscle":"Calves","equipment":"Machine","sets":4,"reps":15,"icon":"🦶"}]},{"label":"Cardio","rest":false,"exercises":[{"name":"Run / Treadmill","muscle":"Cardio","equipment":"Machine","sets":1,"reps":30,"icon":"🏃"},{"name":"Jump Rope","muscle":"Cardio","equipment":"Bodyweight","sets":3,"reps":3,"icon":"🏃"},{"name":"Core Circuit","muscle":"Core","equipment":"Bodyweight","sets":3,"reps":15,"icon":"🧱"}]},{"label":"Rest","rest":true,"exercises":[]}]',
  TRUE
);
