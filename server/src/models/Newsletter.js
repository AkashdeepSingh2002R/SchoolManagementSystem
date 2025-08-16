import mongoose from 'mongoose';
const NewsletterSchema = new mongoose.Schema({
  title: String,
  issueDate: Date,
  body: String,
  lang: { type: String, default: 'en' }
}, { timestamps: true, collection: 'newsletters' });
export default mongoose.model('Newsletter', NewsletterSchema);
