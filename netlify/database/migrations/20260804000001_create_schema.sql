-- Jusoor Daily — initial schema
CREATE TABLE days (
  date DATE PRIMARY KEY,
  fajr TEXT,
  dhuhr TEXT,
  asr TEXT,
  maghrib TEXT,
  isha TEXT,
  wake_time TEXT,
  sleep_time TEXT,
  quran_start INTEGER,
  quran_end INTEGER,
  gym_type TEXT,
  gym_done BOOLEAN DEFAULT FALSE,
  cardio_min INTEGER DEFAULT 0,
  book_pages INTEGER DEFAULT 0,
  mood INTEGER,
  weight NUMERIC,
  steps INTEGER,
  calories INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  project TEXT DEFAULT 'Jusoor',
  start_time TEXT,
  end_time TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'todo',
  is_daily BOOLEAN DEFAULT FALSE,
  reminder_before INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX tasks_date_idx ON tasks (date);

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  total_pages INTEGER DEFAULT 0,
  current_page INTEGER DEFAULT 0,
  status TEXT DEFAULT 'To Read',
  daily_target INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_plans (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT DEFAULT '',
  exercises JSONB NOT NULL DEFAULT '[]',
  duration_min INTEGER DEFAULT 60
);

CREATE TABLE habits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '●',
  color TEXT DEFAULT '#ef4444',
  sort INTEGER DEFAULT 0
);

CREATE TABLE habit_log (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  UNIQUE (date, habit_id)
);

-- Seed default workout plans (Push / Pull / Legs / Cardio)
INSERT INTO workout_plans (type, name, exercises, duration_min) VALUES
  ('Push', 'Push Day', '[{"name":"Bench Press","sets":4,"reps":8},{"name":"Overhead Press","sets":4,"reps":8},{"name":"Incline Dumbbell Press","sets":3,"reps":10},{"name":"Lateral Raises","sets":4,"reps":12},{"name":"Tricep Dips","sets":3,"reps":12}]', 75),
  ('Pull', 'Pull Day', '[{"name":"Deadlift","sets":4,"reps":6},{"name":"Barbell Row","sets":4,"reps":8},{"name":"Pull-Ups","sets":4,"reps":8},{"name":"Face Pulls","sets":3,"reps":15},{"name":"Bicep Curls","sets":3,"reps":12}]', 75),
  ('Legs', 'Legs Day', '[{"name":"Squats","sets":4,"reps":8},{"name":"Romanian Deadlift","sets":4,"reps":10},{"name":"Leg Press","sets":3,"reps":12},{"name":"Walking Lunges","sets":3,"reps":12},{"name":"Calf Raises","sets":4,"reps":15}]', 75),
  ('Cardio', 'Cardio', '[{"name":"Run / Treadmill","sets":1,"reps":30},{"name":"Jump Rope","sets":3,"reps":3},{"name":"Core Circuit","sets":3,"reps":15}]', 45);

-- Seed default daily habits
INSERT INTO habits (name, icon, color, sort) VALUES
  ('Fajr on time', '🌅', '#f59e0b', 1),
  ('Quran pages', '📖', '#22c55e', 2),
  ('Gym / workout', '💪', '#ef4444', 3),
  ('Read book', '📚', '#3b82f6', 4),
  ('Sleep early', '😴', '#8b5cf6', 5),
  ('Water', '💧', '#06b6d4', 6);
