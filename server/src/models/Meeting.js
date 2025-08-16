import mongoose from 'mongoose'
const MeetingSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  attendees: [String],
  link: String,
  description: String
}, { timestamps: true })
export default mongoose.model('Meeting', MeetingSchema)
