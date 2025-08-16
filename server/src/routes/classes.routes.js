import { Router } from 'express'
import mongoose from 'mongoose'
import ClassModel from '../models/Class.js'

const r = Router()
r.get('/', async (_req,res)=>{
  const rows = await ClassModel.find({}).sort({ name:1, section:1 }).lean().catch(()=>[])
  res.json(rows.map(c => ({ ...c, label: c.section ? `${c.name}-${c.section}` : c.name })))
})
r.get('/:id', async (req,res)=>{
  const { id } = req.params
  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error:'Invalid class id' })
  const c = await ClassModel.findById(id).lean().catch(()=>null)
  if(!c) return res.status(404).json({ error:'Class not found' })
  res.json({ ...c, label: c.section ? `${c.name}-${c.section}` : c.name })
})
export default r
