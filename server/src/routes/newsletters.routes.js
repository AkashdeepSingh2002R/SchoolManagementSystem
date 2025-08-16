import { Router } from 'express';
import Newsletter from '../models/Newsletter.js';
const r = Router();

r.get('/', async (req,res)=>{
  const rows = await Newsletter.find({}).sort({ createdAt: -1 }).lean().catch(()=>[]);
  res.json(rows || []);
});
r.post('/', async (req,res)=>{
  const { title, issueDate, body, lang='en' } = req.body || {};
  if(!title || !body) return res.status(400).json({ error: 'title and body required' });
  const doc = await Newsletter.create({ title, issueDate: issueDate || new Date(), body, lang }).catch(()=>null);
  if(!doc) return res.status(500).json({ error: 'failed' });
  res.json(doc);
});

// AI suggest - safe fallback
r.post('/ai/suggest', async (req,res)=>{
  const { prompt='', count=3 } = req.body || {};
  const { aiSuggest } = await import('../utils/ai.js');
  const suggestions = await aiSuggest({ prompt, kind:'newsletter', count }).catch(()=>[]);
  res.json(suggestions[0] || { title:'Generated Newsletter', body: prompt || 'Body', suggestions });
});

export default r;
