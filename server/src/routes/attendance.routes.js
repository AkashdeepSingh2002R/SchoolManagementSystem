import { Router } from 'express'
import mongoose from 'mongoose'
import AttendanceRecord from '../models/AttendanceRecord.js'

const r = Router()
r.get('/:classId', async (req,res)=>{
  const { classId } = req.params
  const date = (req.query.date || '').slice(0,10)
  if(!mongoose.Types.ObjectId.isValid(classId)) return res.json({ classId, date, entries: [] })
  const q = { classId }
  if(date) q.date = date
  const rec = await AttendanceRecord.findOne(q).lean().catch(()=>null)
  res.json(rec || { classId, date, entries: [] })
})
export default r
