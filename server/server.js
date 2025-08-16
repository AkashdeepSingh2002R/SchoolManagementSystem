// server/server.js  (CORS delegate: no 502 on preflight)
import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

// ---- Models ----
import './models/User.js';
import './models/Class.js';
import './models/Student.js';
import './models/Teacher.js';
import './models/TeacherNotice.js';
import './models/AttendanceRecord.js';
import './models/TimetableSlot.js';
import './models/Assignment.js';
import './models/Announcement.js';
import './models/ClassNotice.js';
import './models/Newsletter.js';
import './models/Event.js';
import './models/Meeting.js';
import './models/Conversation.js';
import './models/Message.js';

// ---- Routes ----
import authRoutes from './routes/auth.routes.js';
import statsRoutes from './routes/stats.routes.js';
import searchRoutes from './routes/search.routes.js';
import classesRoutes from './routes/classes.routes.js';
import studentsRoutes from './routes/students.routes.js';
import teachersRoutes from './routes/teachers.routes.js';
import attendanceStudentRoutes from './routes/attendance.student.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import assignmentsRoutes from './routes/assignments.routes.js';
import announcementsRoutes from './routes/announcements.routes.js';
import newslettersRoutes from './routes/newsletters.routes.js';
import eventsRoutes from './routes/events.routes.js';
import meetingsRoutes from './routes/meetings.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import translateRoutes from './routes/translate.routes.js';
import gradesRoutes from './routes/grades.routes.js';
import studentNoticesRoutes from './routes/studentNotices.routes.js';
import teacherNoticesRoutes from './routes/teacherNotices.routes.js';
import classNoticesRoutes from './routes/classNotices.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();
app.set('trust proxy', 1);

// ---- CORS (delegate) ----
const allowlist = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_ORIGIN || 'https://schoolmanagementsystem07.netlify.app')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const baseCors = { 
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

function corsDelegate(req, cb) { 
  const origin = req.header('Origin');
  // Always allow server-to-server/no-origin
  if (!origin) return cb(null, { ...baseCors, origin: false });
  const allowed = allowlist.includes(origin);
  // Do NOT throw on disallowed origins; return origin:false to avoid 5xx
  cb(null, { ...baseCors, origin: allowed });
}

app.use(cors(corsDelegate));
app.options('*', cors(corsDelegate));

// ---- Parsers & logs ----
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

// ---- Mongo ----
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sms_merged';
const DB_NAME = process.env.DB_NAME || 'sms_merged';

try { 
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 10000 });
  console.log('Mongo connected:', mongoose.connection.name);
} catch (err) { 
  console.error('Mongo connection error:', err?.message || err);
}

// ---- Health ----
app.get('/health', (_req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ ok: true, db: state === 1 ? 'up' : 'down', state });
});
app.get('/api/health', (_req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ ok: true, db: state === 1 ? 'up' : 'down', state, env: process.env.NODE_ENV || 'development' });
});

// ---- Mounts ----
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/attendance', attendanceStudentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/newsletters', newslettersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api', studentNoticesRoutes);
app.use('/api/teacher-notices', teacherNoticesRoutes);
app.use('/api/class-notices', classNoticesRoutes);
app.use('/api/ai', aiRoutes);

// ---- Error handler ----
app.use((err, req, res, _next) => {
  console.error('API error:', err?.message || err);
  const status = err.status || 500;
  res.status(status).json({ error: err?.message || 'Internal error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('API ready on :' + PORT));
