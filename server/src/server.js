import 'dotenv/config.js'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'

// compile models
import './models/User.js'
import './models/Class.js'
import './models/Student.js'
import './models/Teacher.js'
import './models/TeacherNotice.js'
import './models/AttendanceRecord.js'
import './models/TimetableSlot.js'
import './models/Assignment.js'
import './models/Announcement.js'
import './models/ClassNotice.js'
import './models/Newsletter.js'
import './models/Event.js'
import './models/Meeting.js'
import './models/Conversation.js'
import './models/Message.js'

// routes
import authRoutes from './routes/auth.routes.js'
import statsRoutes from './routes/stats.routes.js'
import searchRoutes from './routes/search.routes.js'
import classesRoutes from './routes/classes.routes.js'
import studentsRoutes from './routes/students.routes.js'
import teachersRoutes from './routes/teachers.routes.js'
import attendanceStudentRoutes from './routes/attendance.student.routes.js'
import attendanceRoutes from './routes/attendance.routes.js'
import timetableRoutes from './routes/timetable.routes.js'
import assignmentsRoutes from './routes/assignments.routes.js'
import announcementsRoutes from './routes/announcements.routes.js'
import newslettersRoutes from './routes/newsletters.routes.js'
import eventsRoutes from './routes/events.routes.js'
import meetingsRoutes from './routes/meetings.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import translateRoutes from './routes/translate.routes.js'
import gradesRoutes from './routes/grades.routes.js'
import studentNoticesRoutes from './routes/studentNotices.routes.js'
import teacherNoticesRoutes from './routes/teacherNotices.routes.js'
import classNoticesRoutes from './routes/classNotices.routes.js';
import aiRoutes from './routes/ai.routes.js';


const app = express()
const raw = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s=>s.trim())
app.use(cors({ origin(origin, cb){ if(!origin) return cb(null,true); cb(raw.includes(origin)?null:new Error('CORS'), true) } }))
app.use(express.json({ limit:'1mb' }))
app.use(morgan('dev'))

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sms_merged'
await mongoose.connect(MONGO_URI, { dbName: process.env.DB_NAME || 'sms_merged' })
console.log('Mongo connected:', mongoose.connection.name)

app.get('/health', (_req,res)=>res.json({ ok:true }))

// mounts (specific first)
app.use('/api/auth', authRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/search', searchRoutes)

app.use('/api/classes', classesRoutes)
app.use('/api/students', studentsRoutes)
app.use('/api/teachers', teachersRoutes)

app.use('/api/attendance', attendanceStudentRoutes) // /student/:studentId
app.use('/api/attendance', attendanceRoutes)       // /:classId
app.use('/api/timetable', timetableRoutes)

app.use('/api/assignments', assignmentsRoutes)
app.use('/api/announcements', announcementsRoutes)
app.use('/api/newsletters', newslettersRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/meetings', meetingsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/translate', translateRoutes)

app.use('/api/grades', gradesRoutes)
app.use('/api', studentNoticesRoutes) // /student-notices
app.use('/api/teacher-notices', teacherNoticesRoutes)
app.use('/api/class-notices', classNoticesRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, req, res, next)=>{
  console.error('API error:', err)
  res.status(500).json({ error: 'Internal error', detail: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> console.log('API ready on :'+PORT))
