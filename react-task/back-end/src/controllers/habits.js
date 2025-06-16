import { db } from '../db/index.js';
import { habits } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Get all habits
export async function getAllHabits(req, res) {
  try {
    const allHabits = await db.select().from(habits);
    res.json(allHabits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get habits' });
  }
}

// Add new habit
export async function addHabit(req, res) {
  const { name } = req.body;
  try {
    const result = await db
      .insert(habits)
      .values({ name, completed: false })
      .returning();

    // Send back the inserted habit directly
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add habit' });
  }
}


// Update habit
export async function updateHabit(req, res) {
  const id = Number(req.params.id);
  const { name, completed } = req.body;

  // Build update object dynamically
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (completed !== undefined) updateFields.completed = completed;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  try {
    const result = await db
      .update(habits)
      .set(updateFields)
      .where(eq(habits.id, id));

    res.json({ message: 'Habit updated', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
}


// Delete habit
export async function deleteHabit(req, res) {
  const id = Number(req.params.id);
  try {
    const result = await db.delete(habits).where(eq(habits.id, id));
    res.json({ message: 'Habit deleted', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
}
