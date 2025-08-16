import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const r = Router()
r.post('/login', async (req,res)=>{
  const { email, password } = req.body || {}
  const u = await User.findOne({ email }).lean()
  if(!u) return res.status(401).json({ error:'Invalid credentials' })
  const ok = await bcrypt.compare(password, u.passwordHash || '')
  if(!ok) return res.status(401).json({ error:'Invalid credentials' })
  const token = jwt.sign({ sub:u._id, role:u.role, name:u.name, email:u.email }, process.env.JWT_SECRET || 'devsecret123', { expiresIn:'7d' })
  res.json({ token, user: { _id:u._id, name:u.name, email:u.email, role:u.role } })
})
export default r
