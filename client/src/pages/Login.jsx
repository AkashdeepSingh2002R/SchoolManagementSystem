import { useState } from 'react'
import { useAuth } from '../context/auth.jsx'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('admin@school.local')
  const [password, setPassword] = useState('admin123')
  const [err, setErr] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    setErr('')
    try{
      await login(email, password)
      nav('/app')
    }catch(e){ setErr('Invalid credentials') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border dark:border-gray-900 p-6">
          <h1 className="text-2xl font-bold mb-2">Welcome to Greenfield School</h1>
          <p className="text-gray-600 dark:text-gray-300">Learn. Grow. Excel. Quality education with dedicated staff and vibrant co-curriculars.</p>
          <ul className="mt-4 list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
            <li>Modern classrooms & labs</li>
            <li>Clubs & sports</li>
            <li>Parents portal</li>
          </ul>
        </div>
        <form onSubmit={submit} className="rounded-2xl border dark:border-gray-900 p-6">
          <div className="mb-3 font-semibold">Login</div>
          <div className="flex gap-2 mb-3">
            {['admin','teacher','student','parent'].map(r=>(
              <button type="button" key={r} onClick={()=>setRole(r)} disabled={r!=='admin'}
                className={`px-3 py-1.5 rounded border text-sm ${role===r?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':''} ${r!=='admin'?'opacity-50 cursor-not-allowed':''}`}>
                {r}
              </button>
            ))}
          </div>
          <label className="text-sm">Email</label>
          <input className="w-full border rounded px-3 py-2 mb-2 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"
                 value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="text-sm">Password</label>
          <input type="password" className="w-full border rounded px-3 py-2 mb-3 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"
                 value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
          <button className="w-full px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900">Sign in</button>
        </form>
      </div>
    </div>
  )
}
