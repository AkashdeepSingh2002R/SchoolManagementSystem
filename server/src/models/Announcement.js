import mongoose from 'mongoose';
const AnnouncementSchema = new mongoose.Schema({
  title: String,
  body: String,
  lang: { type: String, default: 'en' }
}, { timestamps: true, collection: 'announcements' });
export default mongoose.model('Announcement', AnnouncementSchema);
