import mongoose from 'mongoose'
const AssignmentSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  title: String,
  description: String,
  dueDate: Date,
  maxMarks: { type: Number, default: 100 }
}, { timestamps: true })
export default mongoose.model('Assignment', AssignmentSchema)
