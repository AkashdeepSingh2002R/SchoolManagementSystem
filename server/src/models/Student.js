import mongoose from 'mongoose'
const StudentSchema = new mongoose.Schema({
  name: String,
  rollNo: Number,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  guardianName: String,
  guardianPhone: String,
  address: String,
  dob: String
}, { timestamps: true })
export default mongoose.model('Student', StudentSchema)
