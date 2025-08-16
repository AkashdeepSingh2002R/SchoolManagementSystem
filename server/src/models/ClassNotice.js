import mongoose from 'mongoose';
const ClassNoticeSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  title: String, body: String,
}, { timestamps: true, collection: 'class_notices' });
export default mongoose.model('ClassNotice', ClassNoticeSchema);
