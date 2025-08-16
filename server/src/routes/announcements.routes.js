import { Router } from 'express';
import Announcement from '../models/Announcement.js';
const r = Router();

r.get('/', async (req,res)=>{
  const rows = await Announcement.find({}).sort({ createdAt: -1 }).lean().catch(()=>[]);
  res.json(rows || []);
});
r.post('/', async (req,res)=>{
  const { title, body, lang='en' } = req.body || {};
  if(!title || !body) return res.status(400).json({ error: 'title and body required' });
  const doc = await Announcement.create({ title, body, lang }).catch(()=>null);
  if(!doc) return res.status(500).json({ error: 'failed' });
  res.json(doc);
});

// AI suggest - safe fallback if no key configured
r.post('/ai/suggest', async (req,res)=>{
  const { prompt='', count=3 } = req.body || {};
  const { aiSuggest } = await import('../utils/ai.js');
  const suggestions = await aiSuggest({ prompt, kind:'announcement', count }).catch(()=>[]);
  res.json(suggestions[0] || { title:'Generated Announcement', body: prompt || 'Body', suggestions });
});


export default r;
