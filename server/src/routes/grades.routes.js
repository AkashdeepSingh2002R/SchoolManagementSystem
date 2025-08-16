import { Router } from 'express'
import mongoose from 'mongoose'

const r = Router()
r.get('/student/:studentId', async (req,res)=>{
  const { studentId } = req.params
  const { term } = req.query
  if(!mongoose.Types.ObjectId.isValid(studentId)) return res.json([])
  try{
    const coll = (await import('mongoose')).default.connection.db.collection('grades')
    const q = { studentId: new (await import('mongoose')).default.Types.ObjectId(studentId) }
    if(term) q.term = term
    const rows = await coll.find(q).limit(200).toArray()
    res.json(rows || [])
  }catch{ res.json([]) }
})
export default r
