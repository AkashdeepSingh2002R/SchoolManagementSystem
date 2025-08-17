// server/src/server.js
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
import classNoticesRoutes from './routes/classNotices.routes.js'
import aiRoutes from './routes/ai.routes.js'

/* ------------------------- Hardened CORS helpers ------------------------- */
function normalizeOrigin (o) {
  if (!o) return ''
  return o.replace(/\/+$/, '').toLowerCase()
}
function parseAllowlist (rawCsv) {
  return (rawCsv || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(normalizeOrigin)
}
function isWildcardAllowed (origin, allowlist) {
  const o = normalizeOrigin(origin)
  if (!o) return true
  if (allowlist.includes('https://*.netlify.app') && o.endsWith('.netlify.app')) return true
  return false
}
const allowlist = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...parseAllowlist(process.env.CLIENT_ORIGIN)
]
function isAllowed (origin) {
  if (!origin) return true // allow Postman/server-to-server
  const o = normalizeOrigin(origin)
  if (allowlist.includes(o)) return true
  if (isWildcardAllowed(o, allowlist)) return true
  return false
}

/* ------------------------------- App Init ------------------------------- */
const app = express()
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => { res.setHeader('Vary', 'Origin'); next(); })

const corsOptions = {
  origin (origin, cb) { if (isAllowed(origin)) return cb(null, true); cb(new Error('CORS')) },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204
}
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    const o = req.headers.origin || ''
    console.log('CORS check:', { origin: o, allowed: isAllowed(o), allowlist })
  }
  next()
})
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

/* ------------------------------- Database ------------------------------ */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sms_merged'
await mongoose.connect(MONGO_URI, { dbName: process.env.DB_NAME || 'sms_merged' })
console.log('Mongo connected:', mongoose.connection.name)

/* -------------------------------- Health -------------------------------- */
app.get('/health', (_req, res) => res.json({ ok: true }))

/* --------------------------------- Mounts -------------------------------- */
// canonical (under /api)
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
app.use('/api/class-notices', classNoticesRoutes)
app.use('/api/ai', aiRoutes)

/* ---------- Aliases for non-/api paths (so old client URLs keep working) ---------- */
app.use('/auth', authRoutes)
app.use('/stats', statsRoutes)
app.use('/search', searchRoutes)

app.use('/classes', classesRoutes)
app.use('/students', studentsRoutes)
app.use('/teachers', teachersRoutes)

app.use('/attendance', attendanceStudentRoutes)
app.use('/attendance', attendanceRoutes)
app.use('/timetable', timetableRoutes)

app.use('/assignments', assignmentsRoutes)
app.use('/announcements', announcementsRoutes)
app.use('/newsletters', newslettersRoutes)
app.use('/events', eventsRoutes)
app.use('/meetings', meetingsRoutes)
app.use('/messages', messagesRoutes)
app.use('/translate', translateRoutes)

app.use('/grades', gradesRoutes)
app.use('/', studentNoticesRoutes)            // provides /student-notices
app.use('/teacher-notices', teacherNoticesRoutes)
app.use('/class-notices', classNoticesRoutes)
app.use('/ai', aiRoutes)

/* --------------------------------- Errors -------------------------------- */
app.use((err, req, res, next) => {
  if (err?.message === 'CORS') {
    console.error('API error: Not allowed by CORS — origin:', req.headers.origin)
    return res.status(403).json({ error: 'Not allowed by CORS' })
  }
  console.error('API error:', err)
  res.status(500).json({ error: 'Internal error', detail: err.message })
})

/* --------------------------------- Start -------------------------------- */
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('API ready on :' + PORT)
  console.log('CORS allowlist:', allowlist)
})

export default app
