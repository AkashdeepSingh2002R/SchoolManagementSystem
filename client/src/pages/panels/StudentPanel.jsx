import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

function fmt(d){ try{ return new Date(d).toLocaleDateString() }catch{ return d||'—' } }
function initials(name=''){ return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('') || '?' }
function pct(num, den){ const d = den||1; return Math.round((num*100)/d) }

export default function StudentPanel({ studentId }){
  const [tab, setTab] = useState('overview') // overview | academics | classwork | notices | fees | profile
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // core entities
  const [student, setStudent] = useState(null)
  const [klass, setKlass] = useState(null)

  // overview widgets
  const [recentStudentNotices, setRecentStudentNotices] = useState([])
  const [latestGrades, setLatestGrades] = useState([]) // small sample for overview
  const [att30, setAtt30] = useState([]) // last 30 days entries

  // academics
  const [term, setTerm] = useState(()=>`${new Date().getFullYear()}-T1`)
  const [grades, setGrades] = useState([])

  // classwork
  const [rangeFrom, setRangeFrom] = useState(()=>new Date(Date.now()-1000*60*60*24*14).toISOString().slice(0,10))
  const [rangeTo, setRangeTo] = useState(()=>new Date().toISOString().slice(0,10))
  const [rangeAttendance, setRangeAttendance] = useState([])
  const [homework, setHomework] = useState([])
  const [submitLink, setSubmitLink] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiMsg, setAiMsg] = useState('')

  // notices tab (full list + create)
  const [allStudentNotices, setAllStudentNotices] = useState([])
  const [newNotice, setNewNotice] = useState({ title:'', body:'' })

  // fees
  const [fees, setFees] = useState(null)
  const [feesLoading, setFeesLoading] = useState(false)

  // profile edit buffer
  const [profileEdit, setProfileEdit] = useState(null)
  const classId = student?.classId || student?.class || klass?._id || ''

  // ---------- initial load ----------
  useEffect(()=>{
    let ok = true
    async function load(){
      if(!studentId) return
      setLoading(true); setError('')
      try{
        // student
        const { data: s } = await api.get(`/students/${studentId}`).catch(()=>({ data:null }))
        if(!ok) return
        setStudent(s)
        setProfileEdit(s ? {
          name: s.name||'',
          rollNo: s.rollNo||'',
          phone: s.phone||'',
          guardian: s.guardian||'',
          address: s.address||'',
          dob: (s.dob? String(s.dob).slice(0,10):''),
          emergency: s.emergency||'',
        } : null)

        // class (for badge & timetable reuse)
        let klassData = null
        if(s?.classId){
          const { data: k } = await api.get(`/classes/${s.classId}`).catch(()=>({ data:null }))
          klassData = k
        }
        setKlass(klassData)

        // overview notices (recent 3)
        const { data: n3 } = await api.get('/student-notices', { params:{ studentId } })
          .catch(()=>({ data:[] }))
        setRecentStudentNotices((n3||[]).slice(0,3))
        setAllStudentNotices(n3||[])

        // last 30 days attendance
        const to = new Date()
        const from = new Date(Date.now()-1000*60*60*24*30)
        const qs = `?from=${from.toISOString().slice(0,10)}&to=${to.toISOString().slice(0,10)}`
        const { data: a30 } = await api.get(`/attendance/student/${studentId}${qs}`).catch(()=>({ data:[] }))
        setAtt30(a30||[])

        // small grades sample for overview
        const { data: g } = await api.get(`/grades/student/${studentId}`, { params:{ term } }).catch(()=>({ data:[] }))
        setLatestGrades((g||[]).slice(0,5))
      }catch(e){
        setError('Failed to load student'); console.warn(e)
      }finally{
        if(ok) setLoading(false)
      }
    }
    load()
    return ()=>{ ok=false }
  }, [studentId]) // eslint-disable-line

  // academics: full grades when term changes
  useEffect(()=>{
    let ok = true
    async function loadGrades(){
      if(!studentId) return
      const { data } = await api.get(`/grades/student/${studentId}`, { params:{ term } }).catch(()=>({ data:[] }))
      if(ok) setGrades(data||[])
    }
    loadGrades()
    return ()=>{ ok=false }
  }, [studentId, term])

  // classwork: reload attendance & homework when range/classId changes
  useEffect(()=>{
    let ok = true
    async function loadClasswork(){
      if(!studentId) return
      const qs = `?from=${rangeFrom}&to=${rangeTo}`
      const { data: att } = await api.get(`/attendance/student/${studentId}${qs}`).catch(()=>({ data:[] }))
      if(ok) setRangeAttendance(att||[])
      if(classId){
        const { data: hw } = await api.get('/assignments', { params:{ classId } }).catch(()=>({ data:[] }))
        if(ok) setHomework(hw||[])
      }else{
        setHomework([])
      }
    }
    loadClasswork()
    return ()=>{ ok=false }
  }, [studentId, classId, rangeFrom, rangeTo])

  // fees (on-demand when tab opens)
  useEffect(()=>{
    if(tab!=='fees' || !studentId) return
    let ok=true
    setFeesLoading(true)
    api.get(`/fees/${studentId}`).then(({data})=>{ if(ok) setFees(data||null) })
      .catch(()=>{ if(ok) setFees(null) })
      .finally(()=>{ if(ok) setFeesLoading(false) })
    return ()=>{ ok=false }
  }, [tab, studentId])

  // --------- computed ----------
  const overallAtt = useMemo(()=>{
    const rows = Array.isArray(att30)? att30: []
    const total = rows.length||1
    const present = rows.filter(r => (r.status||'').toLowerCase()==='present').length
    return { present, total, pct: pct(present,total) }
  }, [att30])

  if(!studentId) return null
  if(loading) return <div className="rounded-2xl border p-4 dark:border-gray-800">Loading student…</div>
  if(error) return <div className="rounded-2xl border p-4 dark:border-gray-800 text-red-600">{error}</div>

  const badge = klass?.label || (klass?.section ? `${klass?.name}-${klass?.section}` : (klass?.name || student?.classLabel || '—'))

  // --------- handlers ----------
  async function submitHomework(){
    try{
      // try modern route
      await api.post('/homework/submit', { studentId, link: submitLink }).catch(async ()=>{
        // fallback older route
        await api.post('/submissions', { studentId, url: submitLink }) // may 404 safely
      })
      setSubmitLink('')
      setAiMsg('Submission saved (or queued) ✅')
      setTimeout(()=>setAiMsg(''), 2500)
    }catch{
      setAiMsg('Could not submit right now.')
    }
  }

  async function aiEvaluate(){
    try{
      setAiBusy(true); setAiMsg('')
      // preferred
      const { data } = await api.post('/ai-v12/evaluate', { studentId, snippet: 'Evaluate last homework.' })
        .catch(()=> api.post('/ai/evaluate', { studentId, text: 'Evaluate last homework.' }))
        .catch(()=>({ data:{ feedback:'AI service unavailable — try later.', rubric:[] } }))
      setAiMsg(data?.feedback || 'Evaluation ready.')
    }finally{
      setAiBusy(false)
      setTimeout(()=>setAiMsg(''), 5000)
    }
  }

  async function createStudentNotice(){
    try{
      if(!newNotice.title) return
      await api.post('/student-notices', { studentId, title: newNotice.title, body: newNotice.body }).catch(()=>{})
      setNewNotice({ title:'', body:'' })
      const { data } = await api.get('/student-notices', { params:{ studentId } }).catch(()=>({ data:[] }))
      setAllStudentNotices(data||[])
    }catch{}
  }

  async function seedFees(){
    try{
      const { data } = await api.post(`/dev/fees/seed?studentId=${studentId}`).catch(()=>({ data:null }))
      setFees(data)
    }catch{}
  }

  async function saveProfile(){
    try{
      await api.put(`/students/${studentId}`, profileEdit).catch(()=>{})
      const { data:s } = await api.get(`/students/${studentId}`).catch(()=>({ data:null }))
      setStudent(s)
    }catch{}
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full grid place-items-center bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold">
          {initials(student?.name)}
        </div>
        <div>
          <div className="text-lg font-semibold">{student?.name || '—'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Roll {student?.rollNo ?? '—'} • <span className="inline-block rounded-full border px-2 py-0.5 text-xs dark:border-gray-700">{badge}</span></div>
        </div>
        <div className="ml-auto rounded-xl border dark:border-gray-800 p-1 flex gap-1">
          {['overview','academics','classwork','notices','fees','profile'].map(k=>(
            <button key={k} onClick={()=>setTab(k)}
              className={`px-3 py-1.5 text-sm rounded-lg border dark:border-gray-800 ${tab===k?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':''}`}>
              {k[0].toUpperCase()+k.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      {tab==='overview' && (
        <div className="grid md:grid-cols-3 gap-3">
          <Card title="Profile">
            <div className="text-sm space-y-1">
              <div><span className="text-gray-500">Class:</span> {badge}</div>
              <div><span className="text-gray-500">Age:</span> {student?.age ?? '—'}</div>
              <div><span className="text-gray-500">Guardian:</span> {student?.guardian || '—'}</div>
              <div><span className="text-gray-500">Phone:</span> {student?.phone || '—'}</div>
            </div>
          </Card>
          <Card title="Attendance (30 days)">
            <div className="text-3xl font-semibold">{overallAtt.pct}%</div>
            <div className="text-xs text-gray-500">{overallAtt.present}/{overallAtt.total} days present</div>
            <div className="mt-3 h-12 w-full rounded bg-gray-100 dark:bg-gray-800 overflow-hidden flex">
              {Array.from({length:Math.max(1,att30.length)}).map((_,i)=>(
                <div key={i} className={`flex-1 ${((att30[i]?.status||'').toLowerCase()==='present')?'bg-emerald-500':''}`}></div>
              ))}
            </div>
          </Card>
          <Card title="Latest Grades">
            <ul className="text-sm space-y-1">
              {latestGrades.map((g,i)=>(
                <li key={i}><span className="font-medium">{g.subject || '—'}</span> — {g.score ?? '—'}/{g.max ?? '—'}</li>
              ))}
              {latestGrades.length===0 && <li className="text-gray-500">No grades yet.</li>}
            </ul>
          </Card>
          <Tile className="md:col-span-3" title="Recent Notices">
            <ul className="text-sm space-y-1">
              {recentStudentNotices.map(n=>(<li key={n._id}><span className="font-medium">{n.title}</span> — <span className="opacity-80">{n.body}</span></li>))}
              {recentStudentNotices.length===0 && <li className="text-gray-500">No notices.</li>}
            </ul>
          </Tile>
        </div>
      )}

      {/* ACADEMICS */}
      {tab==='academics' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Term</label>
            <select value={term} onChange={e=>setTerm(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800">
              {[0,1,2].map(i=>{
                const y = new Date().getFullYear()
                return [`${y}-T1`,`${y}-T2`,`${y}-T3`][i]
              }).map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <div className="text-xs opacity-60 ml-auto">GPA coming soon</div>
          </div>
          <div className="rounded-2xl border dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800"><tr><Th>Subject</Th><Th>Assessment</Th><Th>Score</Th><Th>Max</Th><Th>Date</Th></tr></thead>
              <tbody>
                {grades.map((g,i)=>(
                  <tr key={i} className="border-t dark:border-gray-800">
                    <Td>{g.subject||'—'}</Td>
                    <Td>{g.assessment||'—'}</Td>
                    <Td>{g.score??'—'}</Td>
                    <Td>{g.max??'—'}</Td>
                    <Td>{fmt(g.date)}</Td>
                  </tr>
                ))}
                {grades.length===0 && <tr><Td colSpan={5} className="p-3 text-gray-500">No grades in this term.</Td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLASSWORK */}
      {tab==='classwork' && (
        <div className="grid md:grid-cols-3 gap-3">
          <Tile className="md:col-span-2" title="Attendance (range)">
            <div className="flex items-center gap-2 mb-2">
              <input type="date" value={rangeFrom} onChange={e=>setRangeFrom(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"/>
              <span className="text-gray-400">→</span>
              <input type="date" value={rangeTo} onChange={e=>setRangeTo(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"/>
            </div>
            <div className="rounded border dark:border-gray-800 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><Th>Date</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {rangeAttendance.map((r,i)=>(
                    <tr key={i} className="border-t dark:border-gray-800">
                      <Td>{fmt(r.date)}</Td><Td className="capitalize">{r.status||'—'}</Td>
                    </tr>
                  ))}
                  {rangeAttendance.length===0 && <tr><Td colSpan={2} className="p-3 text-gray-500">No attendance in this range.</Td></tr>}
                </tbody>
              </table>
            </div>
          </Tile>
          <Tile title="Homework">
            <ul className="text-sm space-y-2">
              {homework.map(h=>(
                <li key={h._id} className="rounded border p-2 dark:border-gray-800">
                  <div className="font-medium">{h.title||'Untitled'}</div>
                  <div className="text-xs text-gray-500">Due {h.dueDate?fmt(h.dueDate):'—'} · Max {h.maxMarks??'—'}</div>
                </li>
              ))}
              {homework.length===0 && <li className="text-gray-500">No homework yet.</li>}
            </ul>
            <div className="mt-3 space-y-2">
              <input value={submitLink} onChange={e=>setSubmitLink(e.target.value)} placeholder="Submission link (text/pdf)" className="w-full border rounded px-2 py-1 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"/>
              <div className="flex gap-2">
                <button onClick={submitHomework} className="px-3 py-1.5 rounded border text-sm dark:border-gray-800">Submit homework</button>
                <button onClick={aiEvaluate} disabled={aiBusy} className="px-3 py-1.5 rounded border text-sm dark:border-gray-800">{aiBusy?'AI…':'AI Check (beta)'}</button>
              </div>
              {aiMsg && <div className="text-xs opacity-70">{aiMsg}</div>}
            </div>
          </Tile>
          <Tile className="md:col-span-3" title="Timetable (class)">
            {!classId && <div className="text-gray-500">No class assigned.</div>}
            {classId && <TimetableGrid classId={classId} />}
          </Tile>
        </div>
      )}

      {/* NOTICES */}
      {tab==='notices' && (
        <div className="grid md:grid-cols-3 gap-3">
          <Tile className="md:col-span-2" title="Notices to student">
            <ul className="text-sm space-y-2">
              {allStudentNotices.map(n=>(
                <li key={n._id} className="rounded border p-2 dark:border-gray-800">
                  <div className="font-medium">{n.title}</div>
                  <div className="opacity-80">{n.body}</div>
                  <div className="text-xs text-gray-500 mt-1">{fmt(n.createdAt)}</div>
                </li>
              ))}
              {allStudentNotices.length===0 && <li className="text-gray-500">No notices.</li>}
            </ul>
          </Tile>
          <Tile title="Create notice (admin)">
            <div className="space-y-2">
              <Field label="Title" value={newNotice.title} onChange={v=>setNewNotice({...newNotice, title:v})}/>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Body</label>
                <textarea className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                  rows={4} value={newNotice.body} onChange={e=>setNewNotice({...newNotice, body:e.target.value})}/>
              </div>
              <button onClick={createStudentNotice} className="px-3 py-1.5 rounded border text-sm dark:border-gray-800">Send</button>
            </div>
          </Tile>
        </div>
      )}

      {/* FEES */}
      {tab==='fees' && (
        <div className="rounded-2xl border dark:border-gray-800 p-3">
          {feesLoading && <div className="text-gray-500">Loading fees…</div>}
          {!feesLoading && !fees && (
            <div className="flex items-center gap-3">
              <div className="text-gray-500">No fees data yet.</div>
              <button onClick={seedFees} className="px-3 py-1.5 rounded border text-sm dark:border-gray-800">Create sample fees</button>
            </div>
          )}
          {!feesLoading && fees && (
            <div className="grid md:grid-cols-3 gap-3">
              <Card title="Paid"><div className="text-2xl font-semibold">${fees.paid??0}</div></Card>
              <Card title="Due"><div className="text-2xl font-semibold">${fees.due??0}</div></Card>
              <Card title="Upcoming"><div className="text-2xl font-semibold">${fees.upcoming??0}</div></Card>
            </div>
          )}
        </div>
      )}

      {/* PROFILE */}
      {tab==='profile' && profileEdit && (
        <div className="rounded-2xl border dark:border-gray-800 p-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Name" value={profileEdit.name} onChange={v=>setProfileEdit({...profileEdit, name:v})} />
            <Field label="Roll No" value={profileEdit.rollNo} onChange={v=>setProfileEdit({...profileEdit, rollNo:v})} />
            <Field label="Phone" value={profileEdit.phone} onChange={v=>setProfileEdit({...profileEdit, phone:v})} />
            <Field label="Guardian" value={profileEdit.guardian} onChange={v=>setProfileEdit({...profileEdit, guardian:v})} />
            <Field label="Address" value={profileEdit.address} onChange={v=>setProfileEdit({...profileEdit, address:v})} className="md:col-span-2"/>
            <Field label="DOB" type="date" value={profileEdit.dob} onChange={v=>setProfileEdit({...profileEdit, dob:v})} />
            <Field label="Emergency Contact" value={profileEdit.emergency} onChange={v=>setProfileEdit({...profileEdit, emergency:v})} />
          </div>
          <div className="mt-3">
            <button onClick={saveProfile} className="px-3 py-1.5 rounded border text-sm dark:border-gray-800">Save</button>
          </div>
        </div>
      )}
    </div>
  )
}

function TimetableGrid({ classId }){
  const [rows, setRows] = useState([])
  useEffect(()=>{
    let ok = true
    api.get('/timetable', { params:{ classId } }).then(({data})=>{ if(ok) setRows(data||[]) }).catch(()=>setRows([]))
    return ()=>{ ok=false }
  }, [classId])
  return (
    <div className="grid md:grid-cols-5 gap-2">
      {[1,2,3,4,5].map(d=>(
        <div key={d} className="rounded-lg border p-2 dark:border-gray-800">
          <div className="text-sm font-medium mb-1">{['Mon','Tue','Wed','Thu','Fri'][d-1]}</div>
          <div className="space-y-1 text-sm">
            {rows.filter(s=>s.dayOfWeek===d).map((s,i)=>(
              <div key={i} className="rounded border px-2 py-1 dark:border-gray-700">
                <div className="font-medium">{s.subject} — {s.teacher || s.teacherName || ''}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.startTime}–{s.endTime}</div>
              </div>
            ))}
            {rows.filter(s=>s.dayOfWeek===d).length===0 && <div className="text-gray-500">No periods</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function Card({ title, children }){ return <div className="rounded-2xl border dark:border-gray-900 p-4"><div className="text-sm text-gray-500 mb-1">{title}</div>{children}</div> }
function Tile({ title, children, className='' }){ return <div className={`rounded-2xl border dark:border-gray-900 p-4 ${className}`}><div className="text-sm text-gray-500 mb-2">{title}</div>{children}</div> }
function Th({ children, className='' }){ return <th className={`p-3 text-xs font-semibold text-gray-600 dark:text-gray-300 ${className}`}>{children}</th> }
function Td({ children, className='' }){ return <td className={`p-3 text-sm text-gray-800 dark:text-gray-200 ${className}`}>{children}</td> }
function Field({ label, value, onChange=()=>{}, type='text', className='' }){
  return (
    <div className={className}>
      <label className="block text-sm text-gray-600 dark:text-gray-300">{label}</label>
      <input type={type} className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
             value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  )
}
