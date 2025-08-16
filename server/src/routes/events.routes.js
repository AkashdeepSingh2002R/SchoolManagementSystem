import { Router } from 'express'
import Event from '../models/Event.js'

const r = Router()
r.get('/', async (req,res)=>{
  const { from, to } = req.query
  const q = {}
  if(from || to){ q.date = {}; if(from) q.date.$gte = from; if(to) q.date.$lte = to }
  const rows = await Event.find(q).sort({ date:1 }).lean().catch(()=>[])
  res.json(rows || [])
})
r.post('/', async (req,res)=>{
  const { title, date, time, description } = req.body || {}
  const doc = await Event.create({ title, date, time, description })
  res.json(doc)
})
export default r
