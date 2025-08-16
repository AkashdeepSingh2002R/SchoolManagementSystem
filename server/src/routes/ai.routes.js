import { Router } from 'express';
import { aiSuggest, translate } from '../utils/ai.js';

const r = Router();

r.post('/suggest', async (req,res)=>{
  const { prompt='', kind='announcement', count=3, tone='friendly', length='medium', research=true } = req.body || {};
  const suggestions = await aiSuggest({ prompt, kind, count, tone, length, research }).catch(()=>[]);
  res.json({ suggestions });
});

r.post('/translate', async (req,res)=>{
  const { title='', body='', target='en' } = req.body || {};
  const out = await translate({ title, body, target }).catch(()=>({ title, body }));
  res.json(out);
});

export default r;