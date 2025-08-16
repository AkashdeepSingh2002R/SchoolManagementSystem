import { useEffect, useReducer, useState, useMemo } from 'react';
import api from '../../api/axios';

/* --- Safe day matcher: supports numeric (0–6) & string ("Mon"/"Monday") --- */
function dayMatches(slot, dayLabel){
  const map = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };
  const key = (dayLabel||'').toLowerCase().slice(0,3);
  const want = map[key];
  const val = slot?.dayOfWeek ?? slot?.day ?? null;
  if (typeof val === 'number') return val === want;
  if (typeof val === 'string'){
    const v = val.trim().toLowerCase();
    if (v.length <= 3) return map[v] === want; // "Mon" → 1
    return v.startsWith(key);                   // "Monday" → "mon"
  }
  return false;
}

/* --- State & reducer --- */
const today = () => new Date().toISOString().slice(0, 10);

const initial = {
  tab: 'students',
  baseLoading: true,
  baseError: '',

  klass: null,
  students: [],
  timetable: [],

  // attendance
  attDate: today(),
  attendance: { entries: [], date: today() },
  attLoading: false,

  // assignments
  assignments: [],
  assignLoaded: false,
  showAdd: false,
  form: { title:'', description:'', topic:'', dueDate: today(), maxMarks: 100 },
  aiBusy: false,

  // notices
  notices: [],
  noticesLoaded: false,
  noticeTitle: '',
  noticeBody: '',
};

function reducer(state, action){
  switch(action.type){
    case 'SET_TAB': return { ...state, tab: action.tab };
    case 'BASE_START': return { ...state, baseLoading: true, baseError: '' };
    case 'BASE_OK': return { ...state, baseLoading: false, klass: action.klass, students: action.students, timetable: action.timetable };
    case 'BASE_ERR': return { ...state, baseLoading: false, baseError: action.msg || 'Failed to load class data' };

    case 'SET_ATT_DATE': return { ...state, attDate: action.value };
    case 'ATT_START': return { ...state, attLoading: true };
    case 'ATT_OK': return { ...state, attLoading: false, attendance: action.data || { entries: [], date: state.attDate } };
    case 'ATT_DONE': return { ...state, attLoading: false };

    case 'ASSIGN_SET': return { ...state, assignments: action.rows || [], assignLoaded: true };
    case 'ASSIGN_TOGGLE_MODAL': return { ...state, showAdd: !!action.open };
    case 'ASSIGN_FORM': return { ...state, form: { ...state.form, ...action.patch } };
    case 'ASSIGN_AIBUSY': return { ...state, aiBusy: !!action.value };

    case 'NOTICES_SET': return { ...state, notices: action.rows || [], noticesLoaded: true };
    case 'NOTICE_FORM': return { ...state, [action.key]: action.value };

    default: return state;
  }
}

/* --- Helpers --- */
function classLabel(k){
  if(!k) return 'Class';
  if(k.label) return k.label;
  const sec = k.section ? ('-' + k.section) : '';
  return (k.name || k.className || 'Class') + sec;
}

/* --- Component --- */
export default function ClassPanel({ classId }){
  const [state, dispatch] = useReducer(reducer, initial);

  /* Base loader */
  useEffect(function(){
    let alive = true;

    async function load(){
      if(!classId) return;
      dispatch({ type:'BASE_START' });
      try{
        const kRes = await api.get('/classes/' + classId).catch((e)=>{ console.warn('Class fetch failed', e); return { data:null }; });
        const klass = kRes?.data || null;
        if(!klass){ if(alive) dispatch({ type:'BASE_ERR', msg: 'Class not found' }); return; }

        const stRes = await api.get('/students/by-class/' + classId).catch((e)=>{ console.warn('Students fetch failed', e); return { data:[] }; });
        const ttRes = await api.get('/timetable', { params:{ classId } }).catch((e)=>{ console.warn('Timetable fetch failed', e); return { data:[] }; });
        const students = (stRes?.data || []).sort((a,b)=> (a.rollNo||0) - (b.rollNo||0));
        const timetable = ttRes?.data || [];

        if(alive) dispatch({ type:'BASE_OK', klass, students, timetable });
      } catch(e){
        console.error('ClassPanel load error', e);
        if(alive) dispatch({ type:'BASE_ERR', msg: (e?.response?.data?.error || e?.message || 'Failed to load class') });
      }
    }

    load();
    return ()=>{ alive = false; };
  }, [classId]);

  /* Attendance loader */
  useEffect(function(){
    let alive = true;
    async function loadAtt(){
      if(state.tab !== 'attendance' || !classId) return;
      dispatch({ type:'ATT_START' });
      try{
        const res = await api.get('/attendance/' + classId, { params: { date: state.attDate } })
          .catch(()=> ({ data: { entries: [], date: state.attDate } }));
        if(alive) dispatch({ type:'ATT_OK', data: res.data });
      }finally{
        if(alive) dispatch({ type:'ATT_DONE' });
      }
    }
    loadAtt();
    return ()=>{ alive = false; };
  }, [state.tab, classId, state.attDate]);

  /* Assignments loader */
  useEffect(function(){
    let alive = true;
    async function loadAssign(){
      if(state.tab !== 'assignments' || !classId || state.assignLoaded) return;
      const res = await api.get('/assignments', { params: { classId } }).catch(()=> ({ data: [] }));
      if(alive) dispatch({ type:'ASSIGN_SET', rows: res.data || [] });
    }
    loadAssign();
    return ()=>{ alive = false; };
  }, [state.tab, classId, state.assignLoaded]);

  /* Notices loader */
  useEffect(function(){
    let alive = true;
    async function loadNotes(){
      if(state.tab !== 'noticeboard' || !classId || state.noticesLoaded) return;
      const res = await api.get('/class-notices', { params: { classId } }).catch(()=> ({ data: [] }));
      if(alive) dispatch({ type:'NOTICES_SET', rows: res.data || [] });
    }
    loadNotes();
    return ()=>{ alive = false; };
  }, [state.tab, classId, state.noticesLoaded]);

  const k = state.klass;

  const header = (
  <div className="flex items-center gap-3 flex-wrap">
    <div className="text-xl font-bold">{classLabel(k)}</div>
    <div className="text-xs rounded px-2 py-0.5 border dark:border-gray-800">Students: {state.students.length}</div>
    <div className="text-xs rounded px-2 py-0.5 border dark:border-gray-800">Weekly periods: {(state.timetable || []).length}</div>

    {/* Desktop tabs */}
    <div className="ml-auto hidden md:flex items-center gap-2 text-sm">
      <button onClick={()=>dispatch({ type:'SET_TAB', tab:'students' })}
        className={"px-3 py-1 rounded " + (state.tab==='students'?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>
        Students
      </button>
      <button onClick={()=>dispatch({ type:'SET_TAB', tab:'attendance' })}
        className={"px-3 py-1 rounded " + (state.tab==='attendance'?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>
        Attendance
      </button>
      <button onClick={()=>dispatch({ type:'SET_TAB', tab:'timetable' })}
        className={"px-3 py-1 rounded " + (state.tab==='timetable'?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>
        Timetable
      </button>
      <button onClick={()=>dispatch({ type:'SET_TAB', tab:'assignments' })}
        className={"px-3 py-1 rounded " + (state.tab==='assignments'?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>
        Assignments
      </button>
      <button onClick={()=>dispatch({ type:'SET_TAB', tab:'noticeboard' })}
        className={"px-3 py-1 rounded " + (state.tab==='noticeboard'?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>
        Noticeboard
      </button>
    </div>

    {/* Mobile dropdown */}
    <div className="w-full md:hidden">
      <label htmlFor="classpanel-tab" className="sr-only">Tab</label>
      <select
        id="classpanel-tab"
        value={state.tab}
        onChange={(e)=>dispatch({ type:'SET_TAB', tab:e.target.value })}
        className="mt-2 w-full border rounded px-3 py-2 bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"
      >
        <option value="students">Students</option>
        <option value="attendance">Attendance</option>
        <option value="timetable">Timetable</option>
        <option value="assignments">Assignments</option>
        <option value="noticeboard">Noticeboard</option>
      </select>
    </div>
  </div>
);


  if(state.baseLoading) return <div className="rounded-2xl border p-4 dark:border-gray-800">Loading class…</div>;
  if(state.baseError) return <div className="rounded-2xl border p-4 dark:border-gray-800 text-red-600">{state.baseError}</div>;

  return (
    <div className="space-y-4">
      {header}

      {/* Students */}
      {state.tab==='students' && (
        <div className="rounded-2xl border dark:border-gray-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-gray-600 dark:text-gray-300">#</th>
                <th className="px-3 py-2 text-gray-600 dark:text-gray-300">Name</th>
                <th className="px-3 py-2 text-gray-600 dark:text-gray-300">Overall Grade</th>
              </tr>
            </thead>
            <tbody>
              {(state.students || []).map((s,i)=>(
                <tr key={s._id || i} className="border-t dark:border-gray-800">
                  <td className="px-3 py-2">{typeof s.rollNo === 'number' ? s.rollNo : '-'}</td>
                  <td className="px-3 py-2">{s.name || s.fullName || s.firstName || '—'}</td>
                  <td className="px-3 py-2">—</td>
                </tr>
              ))}
              {(state.students || []).length===0 && (
                <tr><td colSpan={3} className="p-3 text-gray-500">No students.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Attendance */}
      {state.tab==='attendance' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm">Date</label>
            <input
              type="date"
              value={state.attDate}
              onChange={(e)=>dispatch({ type:'SET_ATT_DATE', value:e.target.value })}
              className="text-sm border rounded px-2 py-1 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"
            />
            <div className="ml-auto text-xs rounded bg-gray-100 dark:bg-gray-800 px-2 py-1">
              {(() => {
                const entries = state.attendance.entries || []; const n = entries.length || 1;
                const c = (k)=> Math.round(100*(entries.filter(e=> (e.status||'').toLowerCase()===k).length)/n);
                return `Present ${c('present')}% · Absent ${c('absent')}% · Late ${c('late')}% · Excused ${c('excused')}%`;
              })()}
            </div>
          </div>

          <div className="rounded-2xl border dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-gray-600 dark:text-gray-300">#</th>
                  <th className="px-3 py-2 text-gray-600 dark:text-gray-300">Name</th>
                  <th className="px-3 py-2 text-gray-600 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.attLoading && <tr><td colSpan={3} className="p-3 text-gray-500">Loading attendance...</td></tr>}
                {!state.attLoading && (state.attendance.entries || []).map((e, i)=>(
                  <tr key={i} className="border-t dark:border-gray-800">
                    <td className="px-3 py-2">{typeof e.rollNo === 'number' ? e.rollNo : '-'}</td>
                    <td className="px-3 py-2">{e.name || e.studentName || '-'}</td>
                    <td className="px-3 py-2 capitalize">{e.status || '-'}</td>
                  </tr>
                ))}
                {!state.attLoading && (!state.attendance.entries || state.attendance.entries.length===0) && (
                  <tr><td colSpan={3} className="p-3 text-gray-500">No records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timetable */}
      {state.tab==='timetable' && (
        <div className="rounded-2xl border dark:border-gray-800 p-3">
          <div className="grid md:grid-cols-5 gap-3">
            {['Mon','Tue','Wed','Thu','Fri'].map((day) => {
              const slots = (state.timetable || []).filter((t) => dayMatches(t, day));
              return (
                <div key={day}>
                  <div className="font-semibold mb-1">{day}</div>
                  <div className="space-y-1">
                    {slots.map((s, idx)=>(
                      <div key={idx} className="rounded border px-2 py-1 text-sm dark:border-gray-800">
                        <div className="font-medium">{s.subject || s.title || 'Period'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {s.teacherName || s.teacher || ''}
                          {s.startTime && s.endTime ? ` · ${s.startTime}–${s.endTime}` : ''}
                        </div>
                      </div>
                    ))}
                    {slots.length === 0 && <div className="text-gray-500">No periods</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assignments */}
      {state.tab==='assignments' && (
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="text-sm font-medium">Assignments</div>
            <div className="ml-auto">
              <button onClick={()=>dispatch({ type:'ASSIGN_TOGGLE_MODAL', open:true })} className="px-3 py-2 rounded border text-sm dark:border-gray-800">Add assignment</button>
            </div>
          </div>

          <ul className="text-sm space-y-2">
            {(state.assignments || []).map((a)=>(
              <li key={a._id} className="rounded border p-2 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{a.title}</div>
                  <div className="ml-auto text-xs opacity-70">Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-'}</div>
                </div>
                <div className="text-xs opacity-80">Max marks: {a.maxMarks || '-'}</div>
                <div className="opacity-80 mt-1 whitespace-pre-wrap">{a.description || ''}</div>
              </li>
            ))}
            {(state.assignments || []).length===0 && <li className="text-gray-500">No assignments.</li>}
          </ul>

          {state.showAdd && (
            <div className="rounded-2xl border dark:border-gray-800 p-3">
              <div className="text-sm font-medium mb-2">Create assignment</div>

              <div className="rounded-lg border dark:border-gray-800 p-2 mb-2">
                <div className="text-xs mb-1">AI Assist</div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded px-2 py-1 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"
                    placeholder="Topic / focus (e.g., Fractions practice, Plant cell diagram)"
                    value={state.form.topic || ''}
                    onChange={(e)=>dispatch({ type:'ASSIGN_FORM', patch:{ topic:e.target.value } })}
                  />
                  <button
                    onClick={async ()=>{
                      const topic = (state.form.topic || '').trim();
                      if(!topic) return;
                      dispatch({ type:'ASSIGN_AIBUSY', value: true });
                      try{
                        const res = await api.post('/assignments/ai/suggest', { topic })
                          .catch(()=> ({ data:{ title: topic + ' Assignment', body: 'Write a short work on the topic.' } }));
                        const d = res.data || {};
                        dispatch({ type:'ASSIGN_FORM', patch:{
                          title: d.title || state.form.title || '',
                          description: d.body || state.form.description || ''
                        }});
                      } finally {
                        dispatch({ type:'ASSIGN_AIBUSY', value:false });
                      }
                    }}
                    className="px-3 py-1 rounded border text-sm dark:border-gray-800"
                  >
                    {state.aiBusy?'AI...':'Generate'}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Title</label>
                  <input className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800" value={state.form.title} onChange={(e)=>dispatch({ type:'ASSIGN_FORM', patch:{ title:e.target.value } })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Due date</label>
                  <input type="date" className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800" value={state.form.dueDate} onChange={(e)=>dispatch({ type:'ASSIGN_FORM', patch:{ dueDate:e.target.value } })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Max marks</label>
                  <input type="number" className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800" value={state.form.maxMarks} onChange={(e)=>dispatch({ type:'ASSIGN_FORM', patch:{ maxMarks: Number(e.target.value||0) } })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Description</label>
                  <textarea rows={5} className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800" value={state.form.description} onChange={(e)=>dispatch({ type:'ASSIGN_FORM', patch:{ description:e.target.value } })} />
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={async ()=>{
                    const payload = {
                      classId,
                      title: state.form.title,
                      description: state.form.description,
                      dueDate: state.form.dueDate,
                      maxMarks: state.form.maxMarks
                    };
                    await api.post('/assignments', payload).catch(()=>{});
                    const res = await api.get('/assignments', { params:{ classId } }).catch(()=> ({ data: [] }));
                    dispatch({ type:'ASSIGN_SET', rows: res.data || [] });
                    dispatch({ type:'ASSIGN_TOGGLE_MODAL', open:false });
                    dispatch({ type:'ASSIGN_FORM', patch:{ title:'', description:'', topic:'', dueDate: today(), maxMarks:100 } });
                  }}
                  className="px-3 py-2 rounded border text-sm dark:border-gray-800"
                >
                  Save
                </button>
                <button onClick={()=>dispatch({ type:'ASSIGN_TOGGLE_MODAL', open:false })} className="px-3 py-2 rounded border text-sm dark:border-gray-800">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Noticeboard */}
      {state.tab==='noticeboard' && (
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="text-sm font-medium">Class notices</div>
            <div className="ml-auto"></div>
          </div>
          <div className="rounded-2xl border p-3 dark:border-gray-800">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Title</label>
                <input className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800" value={state.noticeTitle} onChange={(e)=>dispatch({ type:'NOTICE_FORM', key:'noticeTitle', value:e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300">Body</label>
                <textarea rows={4} className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800" value={state.noticeBody} onChange={(e)=>dispatch({ type:'NOTICE_FORM', key:'noticeBody', value:e.target.value })} />
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={async ()=>{
                  const payload = { classId, title: state.noticeTitle, body: state.noticeBody };
                  await api.post('/class-notices', payload).catch(()=>{});
                  const res = await api.get('/class-notices', { params:{ classId } }).catch(()=> ({ data: [] }));
                  dispatch({ type:'NOTICES_SET', rows: res.data || [] });
                  dispatch({ type:'NOTICE_FORM', key:'noticeTitle', value:'' });
                  dispatch({ type:'NOTICE_FORM', key:'noticeBody', value:'' });
                }}
                className="px-3 py-2 rounded border text-sm dark:border-gray-800"
              >
                New notice
              </button>
            </div>
          </div>

          <ul className="text-sm space-y-2">
            {(state.notices || []).map((n)=>(
              <li key={n._id} className="rounded border p-2 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{n.title || 'Untitled'}</div>
                  <div className="ml-auto text-xs opacity-70">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                </div>
                <div className="opacity-80 mt-1 whitespace-pre-wrap">{n.body || ''}</div>
              </li>
            ))}
            {(state.notices || []).length===0 && <li className="text-gray-500">No notices.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
