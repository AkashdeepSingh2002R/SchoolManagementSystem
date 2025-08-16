import { Router } from 'express'
import ClassModel from '../models/Class.js'
import Student from '../models/Student.js'
import Teacher from '../models/Teacher.js'

const r = Router()
r.get('/', async (req,res)=>{
  const q = (req.query.q||'').trim()
  if(!q) return res.json({ students:[], classes:[], teachers:[] })
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i')
  const [classes, students, teachers] = await Promise.all([
    ClassModel.find({ $or:[{name:rx},{section:rx}] }).select('_id name section').limit(8).lean().catch(()=>[]),
    Student.find({ name: rx }).select('_id name rollNo classId').limit(8).lean().catch(()=>[]),
    Teacher.find({ name: rx }).select('_id name designation').limit(8).lean().catch(()=>[]),
  ])
  res.json({ students, classes, teachers })
})
export default r
