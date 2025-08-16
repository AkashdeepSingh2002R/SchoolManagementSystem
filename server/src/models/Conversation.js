import mongoose from 'mongoose'
const ConversationSchema = new mongoose.Schema({
  title: String,
  participants: [String] // names or ids; simplified
}, { timestamps: true })
export default mongoose.model('Conversation', ConversationSchema)
