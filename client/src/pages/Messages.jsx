import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Messages(){
  const [convs, setConvs] = useState([])
  const [messages, setMessages] = useState([])
  const [active, setActive] = useState(null)
  const [title, setTitle] = useState('')
  const [participants, setParticipants] = useState('Admin, Teacher 1')
  const [text, setText] = useState('')

  const load = async ()=>{
    const { data } = await api.get('/messages/conversations')
    setConvs(data||[])
  }
  useEffect(()=>{ load() }, [])

  const open = async (id)=>{
    setActive(id)
    const { data } = await api.get('/messages/messages', { params:{ conversationId: id } })
    setMessages(data||[])
  }
  const create = async ()=>{
    const { data } = await api.post('/messages/conversations', { title, participants: participants? participants.split(',').map(s=>s.trim()):[] })
    setTitle(''); load(); setActive(data._id); setMessages([])
  }
  const send = async ()=>{
    if(!active) return
    await api.post('/messages/messages', { conversationId: active, sender: 'Admin', text })
    setText('')
    open(active)
  }

  return (
    <div className="grid md:grid-cols-3 gap-3">
      <div className="rounded-2xl border dark:border-gray-900 p-3">
        <div className="text-sm text-gray-500 mb-2">Conversations</div>
        <ul className="text-sm space-y-1 max-h-[60vh] overflow-auto">
          {convs.map(c=>(<li key={c._id}><button onClick={()=>open(c._id)} className={`w-full text-left rounded px-2 py-1 ${active===c._id?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':''}`}>{c.title}</button></li>))}
          {convs.length===0 && <li className="text-gray-500">No conversations.</li>}
        </ul>
        <div className="mt-3 grid gap-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <input value={participants} onChange={e=>setParticipants(e.target.value)} placeholder="Participants" className="border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <button onClick={create} className="px-3 py-2 rounded border dark:border-gray-800">New Conversation</button>
        </div>
      </div>
      <div className="md:col-span-2 rounded-2xl border dark:border-gray-900 p-3 flex flex-col">
        <div className="text-sm text-gray-500 mb-2">Messages</div>
        <div className="flex-1 overflow-auto space-y-2">
          {messages.map(m=>(<div key={m._id} className="rounded border p-2 dark:border-gray-800"><div className="text-xs opacity-60">{m.sender}</div><div>{m.text}</div></div>))}
          {messages.length===0 && <div className="text-gray-500">No messages.</div>}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" className="flex-1 border rounded px-2 py-1 dark:border-gray-800 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900"/>
          <button onClick={send} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900">Send</button>
        </div>
      </div>
    </div>
  )
}
