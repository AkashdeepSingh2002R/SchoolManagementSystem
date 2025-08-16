import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

function monthDays(year, month){ // month: 0-11
  const first = new Date(year, month, 1)
  const last = new Date(year, month+1, 0)
  const days = []
  for(let d=1; d<=last.getDate(); d++){ days.push(new Date(year, month, d)) }
  return { first, last, days }
}

export default function CalendarPage(){
  const today = new Date()
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [events, setEvents] = useState([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [time, setTime] = useState('10:00')
  const [description, setDescription] = useState('')

  useEffect(()=>{
    let ok=true
    api.get('/events', { params:{ from: `${ym.y}-${String(ym.m+1).padStart(2,'0')}-01`, to: `${ym.y}-${String(ym.m+1).padStart(2,'0')}-31` }})
      .then(({data})=>{ if(ok) setEvents(data||[]) })
    return ()=>{ ok=false }
  }, [ym])

  const map = useMemo(()=>{
    const m = new Map()
    for(const e of events){ if(!m.has(e.date)) m.set(e.date, []); m.get(e.date).push(e) }
    return m
  }, [events])

  const { first, days } = monthDays(ym.y, ym.m)

  const create = async ()=>{
    await api.post('/events', { title, date, time, description })
    setTitle(''); setTime('10:00'); setDescription('')
    const { data } = await api.get('/events', { params:{ from: `${ym.y}-${String(ym.m+1).padStart(2,'0')}-01`, to: `${ym.y}-${String(ym.m+1).padStart(2,'0')}-31` }})
    setEvents(data||[])
  }

  return (
    <div className="space-y-4"><div className="rounded-2xl border dark:border-gray-900 p-4">
        <div className="text-sm text-gray-500 mb-2">Add Event</div>
        <div className="grid md:grid-cols-4 gap-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <div><button onClick={create} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900">Create</button></div>
        </div>
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Calendar</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setYm(v=>({ y: v.m? v.y : v.y-1, m: v.m? v.m-1 : 11 }))} className="px-2 py-1 rounded border dark:border-gray-800">Prev</button>
          <div>{first.toLocaleString(undefined,{ month:'long', year:'numeric' })}</div>
          <button onClick={()=>setYm(v=>({ y: v.m===11? v.y+1 : v.y, m: v.m===11? 0 : v.m+1 }))} className="px-2 py-1 rounded border dark:border-gray-800">Next</button>
          <button onClick={()=>window.print()} className="px-2 py-1 rounded border dark:border-gray-800">Print</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 print:grid-cols-7">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(<div key={d} className="text-xs text-gray-500">{d}</div>))}
        {Array(first.getDay()).fill(0).map((_,i)=>(<div key={'pad'+i}></div>))}
        {days.map(d=>{
          const key = d.toISOString().slice(0,10)
          return (
            <div key={key} className="rounded-lg border p-2 dark:border-gray-800 min-h-[100px] print:min-h-[80px]">
              <div className="text-xs font-medium">{d.getDate()}</div>
              <div className="space-y-1 mt-1">
                {(map.get(key)||[]).map((e,i)=>(<div key={i} className="text-xs">{e.title}</div>))}
              </div>
            </div>
          )
        })}
      </div>

      
      </div>
    </div>
  )
}
