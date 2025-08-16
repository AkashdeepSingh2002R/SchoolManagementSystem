import mongoose from 'mongoose'
const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true }
}, { timestamps: true })
export default mongoose.model('Class', ClassSchema)
