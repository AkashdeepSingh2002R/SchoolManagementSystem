import jwt from 'jsonwebtoken'
export function authRequired(req,res,next){
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ')? h.slice(7): null
  if(!token) return res.status(401).json({ error:'Unauthorized' })
  try{
    const data = jwt.verify(token, process.env.JWT_SECRET || 'devsecret123')
    req.user = data
    next()
  }catch(e){
    return res.status(401).json({ error:'Unauthorized' })
  }
}
