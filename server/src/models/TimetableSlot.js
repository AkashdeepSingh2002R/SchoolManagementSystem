import mongoose from 'mongoose'
const TimetableSlotSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  dayOfWeek: Number, // 1..5
  subject: String,
  teacherName: String,
  startTime: String,
  endTime: String
}, { timestamps: true })
export default mongoose.model('TimetableSlot', TimetableSlotSchema)
