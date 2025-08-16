import { Router } from 'express'

const r = Router()

// Very simple placeholder translator (for demo).
// Replace with a real provider (DeepL/Google) in production.
const tinyPa = { 'welcome':'ਸੁਆਗਤ ਹੈ', 'school':'ਸਕੂਲ', 'meeting':'ਮੀਟਿੰਗ', 'today':'ਅੱਜ' }
const tinyHi = { 'welcome':'स्वागत है', 'school':'स्कूल', 'meeting':'मीटिंग', 'today':'आज' }
const tinyFr = { 'welcome':'bienvenue', 'school':'école', 'meeting':'réunion', 'today':'aujourd’hui' }

function naiveTranslate(text, to){
  const dict = to==='pa'? tinyPa : to==='hi'? tinyHi : to==='fr'? tinyFr : null
  if(!dict) return text
  return text.replace(/\b(welcome|school|meeting|today)\b/gi, m=>dict[m.toLowerCase()]||m)
}

r.post('/', async (req,res)=>{
  const { text, to } = req.body || {}
  if(!text || !to) return res.status(400).json({ error:'text and to required' })
  // In production, call a real API here.
  const out = naiveTranslate(text, to)
  res.json({ text: out, note: 'Stub translator. Plug a real provider for full coverage.' })
})

export default r
