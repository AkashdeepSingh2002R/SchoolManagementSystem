// server/src/routes/assignments.routes.js
import { Router } from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import { aiSuggest, aiSuggestOrFallback, renderAssignmentMarkdown } from '../utils/ai.js';

const r = Router();

// list
r.get('/', async (req,res)=>{
  const { classId } = req.query;
  const q = {};
  if(classId && mongoose.Types.ObjectId.isValid(classId)) q.classId = classId;
  const rows = await Assignment.find(q).sort({ createdAt:-1 }).lean().catch(()=>[]);
  res.json(rows || []);
});

// create
r.post('/', async (req,res)=>{
  const { classId, title, description, dueDate, maxMarks } = req.body || {};
  if(!classId || !mongoose.Types.ObjectId.isValid(classId)) return res.status(400).json({ error:'classId required' });
  const doc = await Assignment.create({ classId, title, description, dueDate, maxMarks });
  res.json(doc);
});

// AI suggest (back-compat + richer shape)
r.post('/ai/suggest', async (req,res)=>{
  const { topic='', subject='', gradeLevel='', difficulty='medium', count=1, tone='clear', length='medium' } = req.body || {};

  // Build a richer prompt while remaining compatible with clients that only send { topic }
  const prompt = [
    subject && `Subject: ${subject}`,
    gradeLevel && `Grade: ${gradeLevel}`,
    difficulty && `Difficulty: ${difficulty}`,
    topic
  ].filter(Boolean).join(' | ');

  // Prefer the structured generator; fall back to legacy if anything fails
  let suggestions = await aiSuggest({ kind:'assignment', prompt, count: Math.max(1, Math.min(5, Number(count)||1)), tone, length, research:false })
    .catch(()=>null);

  if (!Array.isArray(suggestions) || !suggestions.length) {
    const legacy = await aiSuggestOrFallback({ kind:'assignment', prompt: topic || prompt }).catch(()=>null);
    return res.json(legacy || { title: topic || 'Assignment', body: 'Details TBD.' });
  }

  const first = suggestions[0] || {};
  const body = renderAssignmentMarkdown(first);
  // Back-compat: return {title, body}; also include full structured payload in "meta"
  return res.json({ title: first.title || (topic || 'Assignment'), body, meta: first });
});

export default r;
