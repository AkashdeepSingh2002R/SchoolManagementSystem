import { Router } from 'express';
import ClassNotice from '../models/ClassNotice.js';
const r = Router();

r.get('/', async (req, res)=> {
  const { classId } = req.query;
  if(!classId) return res.json([]);
  const rows = await ClassNotice.find({ classId }).sort({ createdAt: -1 }).lean().catch(()=>[]);
  res.json(rows || []);
});
r.post('/', async (req, res)=> {
  const { classId, title, body } = req.body || {};
  if(!classId || !title) return res.status(400).json({ error: 'classId and title required' });
  const doc = await ClassNotice.create({ classId, title, body });
  res.json(doc);
});
r.delete('/:id', async (req,res)=> {
  await ClassNotice.findByIdAndDelete(req.params.id).catch(()=>{});
  res.json({ ok:true });
});

export default r;
