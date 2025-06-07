// LinkNest - Smart Link Shortener API

// Dependencies
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import geoip from 'geoip-lite';
import QRCode from 'qrcode';
import { z } from 'zod';
import cookieParser from 'cookie-parser';
import { eq } from "drizzle-orm";

// DB Setup (Drizzle ORM with SQLite)
import { db, users, links, visits } from './db.js';

// Auth Utils
import { requireAuth, loginHandler, destroySession } from './auth.js';

// App Initialization
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
});
app.use('/shorten', limiter);

// Zod Schema
const shortenSchema = z.object({
  url: z.string().url(),
  customSlug: z.string().min(3).max(20).optional(),
  password: z.string().min(4).max(32).optional(),
  expiresAt: z.string().datetime().optional(),
});

// Home Route - just for testing in browser
app.get('/', (req, res) => {
  res.send(' LinkNest API is running!');
});

// Shorten URL Route
app.post('/shorten', requireAuth, async (req, res) => {
  const parse = shortenSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);

  const { url, customSlug, password, expiresAt } = parse.data;
  const slug = customSlug || nanoid(6);
  const existing = await db.select().from(links).where(eq(links.short_slug, slug));
  if (existing.length > 0) return res.status(409).json({ error: 'Slug already taken' });

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  await db.insert(links).values({
    original_url: url,
    short_slug: slug,
    created_by: req.user.id,
    created_at: new Date().toISOString(),
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    password_hash: passwordHash,
  });

  res.json({ shortUrl: `/r/${slug}` });
});

// Redirect & Tracking
app.get('/r/:slug', async (req, res) => {
  const { slug } = req.params;
  const link = await db.select().from(links).where(eq(links.short_slug, slug)).limit(1);
  if (!link.length) return res.status(404).send('Not Found');

  const l = link[0];
  if (l.expires_at && new Date() > new Date(l.expires_at)) return res.status(410).send('Link Expired');

  await db.update(links).set({ click_count: l.click_count + 1 }).where(eq(links.id, l.id));

  const geo = geoip.lookup(req.ip);
  await db.insert(visits).values({
    link_id: l.id,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    referrer: req.headers['referer'] || '',
    country: geo ? geo.country : '',
    clicked_at: new Date().toISOString(),
  });

  res.redirect(l.original_url);
});

// QR Code Generator
app.get('/qr/:slug', async (req, res) => {
  const { slug } = req.params;
  const shortUrl = `${req.protocol}://${req.get('host')}/r/${slug}`;
  try {
    const qr = await QRCode.toDataURL(shortUrl);
    res.json({ qr });
  } catch (e) {
    res.status(500).json({ error: 'QR Generation Failed' });
  }
});

// Register Route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0)
    return res.status(409).json({ error: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    hashed_password: hashed,
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ message: 'User created successfully' });
});

// Auth Routes
app.post('/login', loginHandler);
app.post('/logout', destroySession);

// Start Server
app.listen(3000, () => {
  console.log('LinkNest API running on http://localhost:3000');
});
