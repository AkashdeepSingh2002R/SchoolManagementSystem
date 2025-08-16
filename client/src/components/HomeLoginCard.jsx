import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.jsx';

export default function HomeLoginCard(){
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@school.local');
  const [password, setPassword] = useState('admin123');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e){
    e.preventDefault();
    setErr(''); setBusy(true);
    try{
      const u = await login(email, password);
      const role = (u && u.role) || 'admin';
      const rolePath = {
        admin: '/app',
        teacher: '/app/announcements',
        student: '/app/messages',
        parent: '/app/messages'
      };
      nav(rolePath[role] || '/app', { replace:true });
    }catch(e){
      setErr('Invalid email or password');
    }finally{
      setBusy(false);
    }
  }

  return (
    <div id="login" className="rounded-2xl border dark:border-gray-900 bg-white/70 dark:bg-gray-950 p-5">
      <div className="font-semibold mb-2">Staff / Student Login</div>
      <form onSubmit={submit} className="space-y-3">
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800" />
        </div>
        <button disabled={busy} className="w-full px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="text-xs text-gray-500">Use provided demo credentials or your account.</div>
      </form>
    </div>
  );
}