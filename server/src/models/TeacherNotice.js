import mongoose from 'mongoose';

const TeacherNoticeSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    title:     { type: String, required: true },
    body:      { type: String, default: '' },
  },
  { timestamps: true, collection: 'teacher_notices' }
);

export default mongoose.model('TeacherNotice', TeacherNoticeSchema);
