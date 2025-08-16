import mongoose from 'mongoose'
const TeacherSchema = new mongoose.Schema({
  name: String,
  designation: String,
  email: String,
  phone: String,
  qualifications: String,
  experienceYears: { type:Number, default: 0 },
  subjects: [String]
}, { timestamps: true })
export default mongoose.model('Teacher', TeacherSchema)
