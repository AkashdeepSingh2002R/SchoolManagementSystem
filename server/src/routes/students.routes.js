import { Router } from 'express'
import mongoose from 'mongoose'
import Student from '../models/Student.js'

const r = Router()
r.get('/by-class/:classId', async (req,res)=>{
  const { classId } = req.params
  if(!mongoose.Types.ObjectId.isValid(classId)) return res.json([])
  const rows = await Student.find({ classId }).sort({ rollNo:1, name:1 }).lean().catch(()=>[])
  res.json(rows || [])
})
r.get('/:id', async (req,res)=>{
  const { id } = req.params
  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error:'Invalid student id' })
  const s = await Student.findById(id).lean().catch(()=>null)
  if(!s) return res.status(404).json({ error:'Student not found' })
  res.json(s)
})
r.get('/', async (req,res)=>{
  const { classId } = req.query
  const q = {}
  if(classId && mongoose.Types.ObjectId.isValid(classId)) q.classId = classId
  const rows = await Student.find(q).sort({ rollNo:1, name:1 }).lean().catch(()=>[])
  res.json(rows || [])
})
export default r
