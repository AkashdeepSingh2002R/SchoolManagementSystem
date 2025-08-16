import { Router } from 'express'
import mongoose from 'mongoose'
import Teacher from '../models/Teacher.js'
import TimetableSlot from '../models/TimetableSlot.js'

const r = Router()
r.get('/', async (_req,res)=>{
  const rows = await Teacher.find({}).sort({ name:1 }).lean().catch(()=>[])
  res.json(rows)
})
r.get('/:id', async (req,res)=>{
  const { id } = req.params
  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error:'Invalid teacher id' })
  const t = await Teacher.findById(id).lean().catch(()=>null)
  if(!t) return res.status(404).json({ error:'Teacher not found' })
  res.json(t)
})
r.get('/:id/classes', async (req,res)=>{
  const { id } = req.params
  if(!mongoose.Types.ObjectId.isValid(id)) return res.json([])
  const t = await Teacher.findById(id).lean().catch(()=>null)
  if(!t) return res.json([])
  const rows = await TimetableSlot.find({ teacherName: t.name }).lean().catch(()=>[])
  res.json(rows || [])
})
r.get('/:id/stats', async (_req,res)=>{
  res.json({ classes: 0, students: 0, assignments: 0, avgAttendance: 0 })
})
export default r
