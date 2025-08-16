import { Router } from 'express';
import mongoose from 'mongoose';
import TeacherNotice from '../models/TeacherNotice.js';

const r = Router();

r.get('/', async (req, res) => {
  const { teacherId } = req.query;
  if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) return res.json([]);
  const rows = await TeacherNotice.find({ teacherId }).sort({ createdAt: -1 }).lean().catch(() => []);
  res.json(rows || []);
});

r.post('/', async (req, res) => {
  const { teacherId, title, body } = req.body || {};
  if (!teacherId || !title) return res.status(400).json({ error: 'teacherId and title required' });
  const doc = await TeacherNotice.create({ teacherId, title, body });
  res.json(doc);
});

r.delete('/:id', async (req, res) => {
  await TeacherNotice.findByIdAndDelete(req.params.id).catch(() => {});
  res.json({ ok: true });
});

export default r;
