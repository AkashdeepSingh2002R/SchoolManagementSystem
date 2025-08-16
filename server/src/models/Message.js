import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  sender: String,
  text: String
}, { timestamps: true })
export default mongoose.model('Message', MessageSchema)
