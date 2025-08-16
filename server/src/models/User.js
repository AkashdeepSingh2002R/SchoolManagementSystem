import mongoose from 'mongoose'
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type:String, unique:true },
  role: { type:String, enum:['admin','teacher','student','parent'], default:'admin' },
  passwordHash: String,
  linkedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'role' } // optional link to teacher/student
}, { timestamps:true })
export default mongoose.model('User', UserSchema)
