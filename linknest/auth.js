import bcrypt from 'bcrypt';
import { db, users } from './db.js';
import { eq } from 'drizzle-orm';


export async function requireAuth(req, res, next) {
  const sessionId = req.cookies?.session;
  if (!sessionId) return res.status(401).json({ error: 'Not logged in' });

  const user = await db.select().from(users).where(eq(users.id, Number(sessionId))).limit(1);
  if (!user.length) return res.status(401).json({ error: 'Invalid session' });

  req.user = user[0]; 
  next();
}


export async function loginHandler(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user.length) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user[0].hashed_password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Set session cookie
  res.cookie('session', user[0].id, { httpOnly: true });
  res.json({ message: 'Logged in successfully' });
}

// POST /logout — Logout handler
export function destroySession(req, res) {
  res.clearCookie('session');
  res.json({ message: 'Logged out successfully' });
}
