import mongoose from 'mongoose'
const AttendanceRecordSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date: String,
  entries: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    rollNo: Number,
    name: String,
    status: { type: String, enum: ['present','absent','late','excused'], default: 'present' }
  }]
}, { timestamps: true })
export default mongoose.model('AttendanceRecord', AttendanceRecordSchema)
