import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { useSelection } from '../context/selection.jsx'

export default function SearchBar(){
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [res, setRes] = useState({ students:[], classes:[], teachers:[] })
  const boxRef = useRef(null)
  const { setSelectedClassId, setSelectedStudentId, setSelectedTeacherId } = useSelection()

  useEffect(()=>{
    function onDocClick(e){ if(boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    return ()=>document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(()=>{
    if(!q){ setRes({students:[],classes:[],teachers:[]}); setOpen(false); return }
    const t = setTimeout(async ()=>{
      try{
        const { data } = await api.get('/search', { params:{ q } })
        setRes({ students:data.students||[], classes:data.classes||[], teachers:data.teachers||[] })
        setOpen(true)
      }catch{
        setRes({ students:[], classes:[], teachers:[] }); setOpen(true)
      }
    }, 250)
    return ()=>clearTimeout(t)
  }, [q])

  const choose = (type, id)=>{
    if(type==='class'){ setSelectedClassId(id); setSelectedStudentId(''); setSelectedTeacherId('') }
    if(type==='student'){ setSelectedStudentId(id); setSelectedClassId(''); setSelectedTeacherId('') }
    if(type==='teacher'){ setSelectedTeacherId(id); setSelectedClassId(''); setSelectedStudentId('') }
    setOpen(false); setQ('')
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <input
        type="search"
        placeholder="Search classes, students, teachers…"
        value={q}
        onChange={e=>setQ(e.target.value)}
        className="w-full rounded-xl pl-3 pr-3 py-2.5 bg-white text-gray-900 placeholder-gray-500 border border-gray-300
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white
                   dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-700 dark:focus:ring-offset-gray-900" />
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800 p-3 text-sm">
          <Section title="classes" items={res.classes} fmt={(c)=>c.section?`${c.name}-${c.section}`:c.name} onPick={(id)=>choose('class', id)} />
          <Section title="students" items={res.students} fmt={(s)=>`${s.name}${s.rollNo?` · #${s.rollNo}`:''}`} onPick={(id)=>choose('student', id)} />
          <Section title="teachers" items={res.teachers} fmt={(t)=>`${t.name}${t.designation?` · ${t.designation}`:''}`} onPick={(id)=>choose('teacher', id)} />
        </div>
      )}
    </div>
  )
}
function Section({ title, items=[], fmt=(x)=>x.name, onPick }){
  if(!items.length) return null
  return (
    <div className="mb-2">
      <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">{title}</div>
      <ul className="space-y-1">
        {items.map((x)=>(
          <li key={x._id}>
            <button type="button"
              onMouseDown={(e)=>{ e.preventDefault(); onPick(x._id) }}
              className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1">
              {fmt(x)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
