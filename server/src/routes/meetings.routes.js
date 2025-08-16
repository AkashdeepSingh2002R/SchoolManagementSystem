import { Router } from 'express'
import Meeting from '../models/Meeting.js'

const r = Router()
r.get('/', async (_req,res)=>{
  const rows = await Meeting.find({}).sort({ date:1, time:1 }).lean().catch(()=>[])
  res.json(rows || [])
})
r.post('/', async (req,res)=>{
  const { title, date, time, attendees, link, description } = req.body || {}
  const doc = await Meeting.create({ title, date, time, attendees: attendees||[], link, description })
  res.json(doc)
})
export default r
