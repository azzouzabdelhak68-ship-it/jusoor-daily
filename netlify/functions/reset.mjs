// /api/reset — wipe all user data and re-seed defaults.
// Called by the in-app "Reset all data" button (single-user personal dashboard).
import { getDatabase } from '@netlify/database';
import { ok, err, withCors } from './_shared/respond.js';

async function main(event) {
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

  const db = getDatabase();
  try {
    await db.sql`
      TRUNCATE habit_log, tasks, days, books, workout_plans, habits RESTART IDENTITY CASCADE
    `;

    await db.sql`
      INSERT INTO workout_plans (type, name, exercises, duration_min) VALUES
        ('Push', 'Push Day', '[{"name":"Bench Press","sets":4,"reps":8},{"name":"Overhead Press","sets":4,"reps":8},{"name":"Incline Dumbbell Press","sets":3,"reps":10},{"name":"Lateral Raises","sets":4,"reps":12},{"name":"Tricep Dips","sets":3,"reps":12}]', 75),
        ('Pull', 'Pull Day', '[{"name":"Deadlift","sets":4,"reps":6},{"name":"Barbell Row","sets":4,"reps":8},{"name":"Pull-Ups","sets":4,"reps":8},{"name":"Face Pulls","sets":3,"reps":15},{"name":"Bicep Curls","sets":3,"reps":12}]', 75),
        ('Legs', 'Legs Day', '[{"name":"Squats","sets":4,"reps":8},{"name":"Romanian Deadlift","sets":4,"reps":10},{"name":"Leg Press","sets":3,"reps":12},{"name":"Walking Lunges","sets":3,"reps":12},{"name":"Calf Raises","sets":4,"reps":15}]', 75),
        ('Cardio', 'Cardio', '[{"name":"Run / Treadmill","sets":1,"reps":30},{"name":"Jump Rope","sets":3,"reps":3},{"name":"Core Circuit","sets":3,"reps":15}]', 45)
    `;

    await db.sql`
      INSERT INTO habits (name, icon, color, sort) VALUES
        ('Fajr on time', '🌅', '#f59e0b', 1),
        ('Quran pages', '📖', '#22c55e', 2),
        ('Gym / workout', '💪', '#ef4444', 3),
        ('Read book', '📚', '#3b82f6', 4),
        ('Sleep early', '😴', '#8b5cf6', 5),
        ('Water', '💧', '#06b6d4', 6)
    `;

    return ok({ reset: true, message: 'All data wiped. Today + tomorrow will regenerate on next /api/state call.' });
  } catch (e) {
    console.error('reset failed:', e);
    return err(e && e.message ? e.message : 'Reset failed');
  }
}

export const handler = withCors(main);
