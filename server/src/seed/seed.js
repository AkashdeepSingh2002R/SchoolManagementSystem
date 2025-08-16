import 'dotenv/config.js'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import ClassModel from '../models/Class.js'
import Student from '../models/Student.js'
import Teacher from '../models/Teacher.js'
import TimetableSlot from '../models/TimetableSlot.js'
import Assignment from '../models/Assignment.js'
import Announcement from '../models/Announcement.js'
import AttendanceRecord from '../models/AttendanceRecord.js'
import ClassNotice from '../models/ClassNotice.js'
import Newsletter from '../models/Newsletter.js'
import Event from '../models/Event.js'
import Meeting from '../models/Meeting.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'

const first = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Kartik','Ishaan','Rohan','Aryan']
const last  = ['Sharma','Verma','Patel','Gupta','Khan','Singh','Mehta','Kapoor','Iyer','Nair']
function nameFor(i){ return `${first[i%first.length]} ${last[i%last.length]}` }

async function main(){
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sms_merged'
  await mongoose.connect(MONGO_URI, { dbName: process.env.DB_NAME || 'sms_merged' })
  console.log('Mongo connected for seed:', mongoose.connection.name)

  await Promise.all([
    User.deleteMany({}), ClassModel.deleteMany({}), Student.deleteMany({}), Teacher.deleteMany({}),
    TimetableSlot.deleteMany({}), Assignment.deleteMany({}), Announcement.deleteMany({}),
    AttendanceRecord.deleteMany({}), ClassNotice.deleteMany({}), Newsletter.deleteMany({}),
    Event.deleteMany({}), Meeting.deleteMany({}), Conversation.deleteMany({}), Message.deleteMany({})
  ])

  // admin user
  const adminPass = await bcrypt.hash('admin123', 10)
  await User.create({ name:'Admin', email:'admin@school.local', role:'admin', passwordHash: adminPass })

  // classes
  const classes = []
  for(let g=1; g<=10; g++){
    const c = await ClassModel.create({ name: String(g), section: 'A' })
    classes.push(c)
  }

  // teachers
  const teachers = []
  for(let i=0;i<10;i++){
    teachers.push(await Teacher.create({
      name: `Teacher ${i+1}`,
      designation: 'Subject Teacher',
      email: `teacher${i+1}@school.local`,
      phone: '99999-00000',
      qualifications: 'B.Ed',
      experienceYears: i%7,
      subjects: ['Math','Science','English','History','Geography'].slice(0, 1+(i%3))
    }))
  }

  // students + attendance + timetable + assignment + class notice
  const today = new Date().toISOString().slice(0,10)
  for(const cls of classes){
    const docs = []
    for(let r=1; r<=10; r++){
      docs.push({
        name: nameFor(r-1), rollNo: r, classId: cls._id,
        guardianName: 'Parent '+r, guardianPhone:'88888-11111', address:'123 School Street', dob:'2012-01-0'+((r%9)+1)
      })
    }
    const created = await Student.insertMany(docs)

    // attendance
    await AttendanceRecord.create({
      classId: cls._id, date: today,
      entries: created.map(s=>({ studentId: s._id, rollNo: s.rollNo, name: s.name, status: 'present' }))
    })

    // timetable 5x3
    for(let d=1; d<=5; d++){
      for(let p=0; p<3; p++){
        await TimetableSlot.create({
          classId: cls._id, dayOfWeek: d,
          subject: ['Math','Science','English'][p],
          teacherName: teachers[(d+p)%teachers.length].name,
          startTime: `${9+p}:00`, endTime: `${10+p}:00`
        })
      }
    }

    await Assignment.create({ classId: cls._id, title: 'Chapter 1 Homework', description: 'Solve Q1–Q5', dueDate: new Date(Date.now()+7*864e5), maxMarks: 100 })
    await ClassNotice.create({ classId: cls._id, title: 'Class Trip', body: 'Field trip next month. Bring consent forms.' })
  }

  // general content
  await Announcement.insertMany([
    { title:'Welcome Back!', body:'New term starts Monday. Be on time.', audience:'all' },
    { title:'PTM Friday', body:'Parent-Teacher meeting at 3PM.', audience:'parents' },
    { title:'Sports Day', body:'Practice schedule will be shared.', audience:'students' }
  ])
  await Newsletter.insertMany([
    { title:'September Highlights', body:'Clubs forming, PTM Friday, Sports Day soon.', issueDate: today }
  ])
  await Event.insertMany([
    { title:'Independence Day Assembly', date: today, time:'08:30', description:'Main ground' },
    { title:'Science Fair', date: new Date(Date.now()+5*864e5).toISOString().slice(0,10), time:'10:00', description:'Hall' }
  ])
  await Meeting.insertMany([
    { title:'Staff Briefing', date: today, time:'15:00', attendees:['Teachers'], link:'#', description:'Weekly sync' }
  ])

  const conv = await Conversation.create({ title:'Admin & Teacher1', participants:['Admin','Teacher 1'] })
  await Message.create({ conversationId: conv._id, sender:'Admin', text:'Hello Teacher 1!' })
  await Message.create({ conversationId: conv._id, sender:'Teacher 1', text:'Hello Admin, how can I help?' })

  console.log('Seed complete. Admin login: admin@school.local / admin123')
  await mongoose.disconnect()
}
main().catch(e=>{ console.error(e); process.exit(1) })
