import { Router } from 'express'
import mongoose from 'mongoose'
import Assignment from '../models/Assignment.js'
import { aiSuggestOrFallback } from '../utils/ai.js'

const r = Router()
r.get('/', async (req,res)=>{
  const { classId } = req.query
  const q = {}
  if(classId && mongoose.Types.ObjectId.isValid(classId)) q.classId = classId
  const rows = await Assignment.find(q).sort({ createdAt:-1 }).lean().catch(()=>[])
  res.json(rows || [])
})
r.post('/', async (req,res)=>{
  const { classId, title, description, dueDate, maxMarks } = req.body || {}
  if(!classId || !mongoose.Types.ObjectId.isValid(classId)) return res.status(400).json({ error:'classId required' })
  const doc = await Assignment.create({ classId, title, description, dueDate, maxMarks })
  res.json(doc)
})
r.post('/ai/suggest', async (req,res)=>{
  const { topic } = req.body || {}
  const out = await aiSuggestOrFallback({ kind:'assignment', prompt: topic })
  res.json(out)
})
export default r
