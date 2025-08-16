// PATCHED: server/server.js
import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

// ---- Models (your originals) ----
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

// ---- Routes (your originals) ----
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

// Render/Proxies set secure cookies correctly when trust proxy is on
app.set('trust proxy', 1);

// ---- CORS (fixed) ----
// Prefer ALLOWED_ORIGINS (comma-separated) or fall back to CLIENT_ORIGIN to keep compatibility
const allowedRaw =
  process.env.ALLOWED_ORIGINS?.trim() ||
  process.env.CLIENT_ORIGIN?.trim() ||
  'http://localhost:5173';

const ALLOWLIST = allowedRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// NOTE: your previous code always returned "true" even when rejecting, which broke CORS.
// This version properly accepts/blocks and sets credentials when needed.
const corsOptions = {
  origin(origin, cb) {
    // Allow server-to-server calls (no Origin header)
    if (!origin) return cb(null, true);
    if (ALLOWLIST.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true, // ok even if you use Bearer tokens only
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

// ---- Mongo ----
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sms_merged';
const DB_NAME = process.env.DB_NAME || 'sms_merged';

try {
  await mongoose.connect(MONGO_URI, {
    dbName: DB_NAME,
    serverSelectionTimeoutMS: 10000,
  });
  console.log('Mongo connected:', mongoose.connection.name);
} catch (err) {
  console.error('Mongo connection error:', err?.message || err);
  // Do not exit; keep server alive so health shows useful info
}

// ---- Health (keep old /health, add /api/health for Render checks) ----
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    db: mongoose.connection?.readyState === 1 ? 'up' : 'down',
    env: process.env.NODE_ENV || 'development',
  })
);

// ---- Mounts (unchanged paths) ----
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);

app.use('/api/classes', classesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);

app.use('/api/attendance', attendanceStudentRoutes); // /student/:studentId
app.use('/api/attendance', attendanceRoutes);       // /:classId
app.use('/api/timetable', timetableRoutes);

app.use('/api/assignments', assignmentsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/newsletters', newslettersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/translate', translateRoutes);

app.use('/api/grades', gradesRoutes);
app.use('/api', studentNoticesRoutes); // /student-notices
app.use('/api/teacher-notices', teacherNoticesRoutes);
app.use('/api/class-notices', classNoticesRoutes);
app.use('/api/ai', aiRoutes);

// ---- Error handler ----
app.use((err, req, res, _next) => {
  console.error('API error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err?.message || 'Internal error',
  });
});

// ---- Start ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('API ready on :' + PORT));
