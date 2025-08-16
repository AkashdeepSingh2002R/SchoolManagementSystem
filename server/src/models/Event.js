import mongoose from 'mongoose'
const EventSchema = new mongoose.Schema({
  title: String,
  date: String,  // YYYY-MM-DD
  time: String,  // HH:MM
  description: String
}, { timestamps: true })
export default mongoose.model('Event', EventSchema)
