import { Router } from 'express'
import mongoose from 'mongoose'
import TimetableSlot from '../models/TimetableSlot.js'

const r = Router()
r.get('/', async (req,res)=>{
  const { classId, teacherName } = req.query
  const q = {}
  if(classId && mongoose.Types.ObjectId.isValid(classId)) q.classId = classId
  if(teacherName) q.teacherName = teacherName
  const rows = await TimetableSlot.find(q).sort({ dayOfWeek:1, startTime:1 }).lean().catch(()=>[])
  res.json(rows || [])
})
export default r
