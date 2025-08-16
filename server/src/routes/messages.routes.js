import { Router } from 'express'
import mongoose from 'mongoose'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'

const r = Router()
r.get('/conversations', async (_req,res)=>{
  const rows = await Conversation.find({}).sort({ updatedAt:-1 }).lean().catch(()=>[])
  res.json(rows || [])
})
r.post('/conversations', async (req,res)=>{
  const { title, participants } = req.body || {}
  const doc = await Conversation.create({ title, participants: participants||[] })
  res.json(doc)
})
r.get('/messages', async (req,res)=>{
  const { conversationId } = req.query
  if(!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) return res.json([])
  const rows = await Message.find({ conversationId }).sort({ createdAt:1 }).lean().catch(()=>[])
  res.json(rows || [])
})
r.post('/messages', async (req,res)=>{
  const { conversationId, sender, text } = req.body || {}
  if(!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) return res.status(400).json({ error:'conversationId required' })
  const doc = await Message.create({ conversationId, sender, text })
  await Conversation.updateOne({ _id: conversationId }, { $set:{ updatedAt: new Date() } })
  res.json(doc)
})
export default r
