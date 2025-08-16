import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function MeetingRoom(){
  const [rows, setRows] = useState([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [time, setTime] = useState('15:00')
  const [attendees, setAttendees] = useState('Teachers')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')

  const load = async ()=>{ const { data } = await api.get('/meetings'); setRows(data||[]) }
  useEffect(()=>{ load() }, [])

  const create = async ()=>{
    await api.post('/meetings', { title, date, time, attendees: attendees? attendees.split(',').map(s=>s.trim()):[], link, description })
    setTitle(''); setLink(''); setDescription(''); load()
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Meeting Room</div>
      <div className="rounded-2xl border dark:border-gray-900 p-4">
        <div className="text-sm text-gray-500 mb-2">Schedule</div>
        <div className="grid md:grid-cols-6 gap-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <input value={attendees} onChange={e=>setAttendees(e.target.value)} placeholder="Attendees (comma separated)" className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <input value={link} onChange={e=>setLink(e.target.value)} placeholder="Link" className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <div className="flex gap-2"><button onClick={create} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900">Create</button></div>
        </div>
        <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="mt-2 w-full border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
      </div>
      <div className="rounded-2xl border dark:border-gray-900 p-4">
        <ul className="text-sm space-y-2">
          {rows.map(r=>(<li key={r._id}><span className="font-medium">{r.title}</span> — {r.date} {r.time}</li>))}
          {rows.length===0 && <li className="text-gray-500">No meetings.</li>}
        </ul>
      </div>
    </div>
  )
}
