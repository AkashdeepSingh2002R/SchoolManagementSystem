import { Router } from 'express'
import Student from '../models/Student.js'
import ClassModel from '../models/Class.js'
import Teacher from '../models/Teacher.js'
import AttendanceRecord from '../models/AttendanceRecord.js'
import Announcement from '../models/Announcement.js'
import Newsletter from '../models/Newsletter.js'
import Event from '../models/Event.js'

const r = Router()
r.get('/', async (_req,res)=>{
  const [students, classes, teachers] = await Promise.all([
    Student.countDocuments().catch(()=>0),
    ClassModel.countDocuments().catch(()=>0),
    Teacher.countDocuments().catch(()=>0),
  ])
  const today = new Date().toISOString().slice(0,10)
  const todayRecs = await AttendanceRecord.find({ date: today }).lean().catch(()=>[])
  let total=0, present=0
  for(const rec of todayRecs){
    for(const e of (rec.entries||[])){ total++; if(e.status==='present') present++ }
  }
  const attendancePct = total? Math.round((present/total)*100): 0

  const latestAnnouncement = await Announcement.findOne({}).sort({ createdAt:-1 }).lean().catch(()=>null)
  const latestNewsletter = await Newsletter.findOne({}).sort({ createdAt:-1 }).lean().catch(()=>null)
  const upcomingEvent = await Event.findOne({ date: { $gte: today } }).sort({ date:1 }).lean().catch(()=>null)
  res.json({ students, classes, teachers, attendancePct, latestAnnouncement, latestNewsletter, upcomingEvent })
})
export default r
