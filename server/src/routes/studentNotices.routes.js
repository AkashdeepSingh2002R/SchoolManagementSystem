import { Router } from 'express'
import mongoose from 'mongoose'

const r = Router()
r.get('/student-notices', async (req,res)=>{
  const { studentId } = req.query
  if(!studentId || !mongoose.Types.ObjectId.isValid(studentId)) return res.json([])
  try{
    const coll = (await import('mongoose')).default.connection.db.collection('student_notices')
    const rows = await coll.find({ studentId: new (await import('mongoose')).default.Types.ObjectId(studentId) }).sort({ createdAt:-1 }).limit(100).toArray()
    res.json(rows || [])
  }catch{ res.json([]) }
})
export default r
