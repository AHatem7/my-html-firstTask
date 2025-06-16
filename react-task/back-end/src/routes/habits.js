import express from 'express';
import { db } from '../db/index.js';
import { habits } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// GET all habits
router.get('/', async (req, res) => {
  try {
    const allHabits = await db.select().from(habits);
    res.json(allHabits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// POST new habit
router.post('/', async (req, res) => {
  const { name, userId } = req.body;
  if (!name || !userId) {
    return res.status(400).json({ error: 'Name and userId are required' });
  }

  try {
    const result = await db.insert(habits).values({
      name,
      userId,
      completed: false,
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert habit' });
  }
});

// PUT update habit name or completion
router.put('/:id', async (req, res) => {
  const habitId = parseInt(req.params.id);
  const { name, completed } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (completed !== undefined) updateData.completed = completed ? 1 : 0;

  try {
    await db.update(habits).set(updateData).where(eq(habits.id, habitId));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// DELETE habit
router.delete('/:id', async (req, res) => {
  const habitId = parseInt(req.params.id);
  try {
    await db.delete(habits).where(eq(habits.id, habitId));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

export default router;
