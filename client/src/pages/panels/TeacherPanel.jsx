import { useEffect, useReducer, useMemo, useState } from 'react';
import api from '../../api/axios';
import { useSelection } from '../../context/selection';

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

/* --- Helpers --- */
function teacherName(t){
  if(!t) return 'Teacher';
  return t.name || `${t.firstName||''} ${t.lastName||''}`.trim() || 'Teacher';
}
function clsLabel(c){
  if(!c) return 'Class';
  const sec = c.section ? `-${c.section}` : '';
  return (c.name || c.className || 'Class') + sec;
}

/* --- State --- */
const initial = {
  tab: 'overview',        // 'overview' | 'timetable' | 'classes' | 'noticeboard' | 'profile'

  baseLoading: true,
  baseError: '',
  teacher: null,

  timetable: [],
  classes: [],

  // noticeboard
  notesLoading: false,
  notices: [],
  noticesLoaded: false,
  noticeTitle: '',
  noticeBody: '',
};

function reducer(state, action){
  switch(action.type){
    case 'SET_TAB': return { ...state, tab: action.tab };

    case 'BASE_START': return { ...state, baseLoading: true, baseError: '' };
    case 'BASE_OK':    return { ...state, baseLoading: false, ...action.patch };
    case 'BASE_ERR':   return { ...state, baseLoading: false, baseError: action.msg || 'Failed to load teacher' };

    case 'NOTES_START': return { ...state, notesLoading: true };
    case 'NOTES_SET':   return { ...state, notesLoading: false, notices: action.rows || [], noticesLoaded: true };
    case 'NOTES_DONE':  return { ...state, notesLoading: false };
    case 'NOTES_FORM':  return { ...state, [action.key]: action.value };

    default: return state;
  }
}

/* --- Component --- */
export default function TeacherPanel({ teacherId }){
  const [state, dispatch] = useReducer(reducer, initial);
  const selection = (typeof useSelection === 'function') ? useSelection() : null;
  const setSelectedClassId = selection?.setSelectedClassId || (()=>{});

  /* Base: teacher + classes + timetable (best-effort for each) */
  useEffect(function(){
    let alive = true;
    async function load(){
      if(!teacherId) return;
      dispatch({ type:'BASE_START' });
      try{
        const tRes = await api.get('/teachers/' + teacherId).catch((e)=>{ console.warn('Teacher fetch failed', e); return { data:null }; });
        const teacher = tRes?.data || null;
        if(!teacher){ if(alive) dispatch({ type:'BASE_ERR', msg:'Teacher not found' }); return; }

        const clsRes = await api.get('/classes', { params:{ teacherId } }).catch(()=>({ data: [] }));
        const classes = Array.isArray(clsRes?.data) ? clsRes.data : [];

        const ttRes = await api.get('/timetable', { params:{ teacherId } }).catch(()=>({ data: [] }));
        const timetable = Array.isArray(ttRes?.data) ? ttRes.data : [];

        if(alive) dispatch({ type:'BASE_OK', patch: { teacher, classes, timetable } });
      } catch(e){
        console.error('TeacherPanel load error', e);
        if(alive) dispatch({ type:'BASE_ERR', msg: (e?.response?.data?.error || e?.message || 'Failed to load teacher') });
      }
    }
    load();
    return ()=>{ alive = false; };
  }, [teacherId]);

  /* Noticeboard: lazy load when tab opened */
  useEffect(function(){
    let alive = true;
    async function loadNotices(){
      if(state.tab !== 'noticeboard' || !teacherId || state.noticesLoaded) return;
      dispatch({ type:'NOTES_START' });
      try{
        // Support either /teacher-notices or fallback to /notices?teacherId
        let res = await api.get('/teacher-notices', { params:{ teacherId } })
          .catch(()=> api.get('/notices', { params:{ teacherId } }))
          .catch(()=> ({ data: [] }));
        if(alive) dispatch({ type:'NOTES_SET', rows: res?.data || [] });
      } finally {
        if(alive) dispatch({ type:'NOTES_DONE' });
      }
    }
    loadNotices();
    return ()=>{ alive = false; };
  }, [state.tab, teacherId, state.noticesLoaded]);

  /* Derived numbers for Overview */
  const weeklyPeriods = useMemo(()=> (state.timetable || []).length, [state.timetable]);
  const classesCount = useMemo(()=> (state.classes || []).length, [state.classes]);
  const subjectsTaught = useMemo(()=>{
    const set = new Set((state.timetable || []).map(s => (s.subject || s.title || '').trim()).filter(Boolean));
    return Array.from(set);
  }, [state.timetable]);

  if(state.baseLoading) return <div className="rounded-2xl border p-4 dark:border-gray-800">Loading teacher…</div>;
  if(state.baseError)   return <div className="rounded-2xl border p-4 dark:border-gray-800 text-red-600">{state.baseError}</div>;

  const t = state.teacher;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold">{teacherName(t)}</div>
        <div className="text-xs rounded px-2 py-0.5 border dark:border-gray-800">Classes: {classesCount}</div>
        <div className="text-xs rounded px-2 py-0.5 border dark:border-gray-800">Weekly periods: {weeklyPeriods}</div>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <button onClick={()=>dispatch({ type:'SET_TAB', tab:'overview' })}     className={"px-3 py-1 rounded " + (state.tab==='overview'    ?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>Overview</button>
          <button onClick={()=>dispatch({ type:'SET_TAB', tab:'timetable' })}    className={"px-3 py-1 rounded " + (state.tab==='timetable'   ?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>Timetable</button>
          <button onClick={()=>dispatch({ type:'SET_TAB', tab:'classes' })}      className={"px-3 py-1 rounded " + (state.tab==='classes'     ?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>Classes</button>
          <button onClick={()=>dispatch({ type:'SET_TAB', tab:'noticeboard' })}  className={"px-3 py-1 rounded " + (state.tab==='noticeboard' ?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>Noticeboard</button>
          <button onClick={()=>dispatch({ type:'SET_TAB', tab:'profile' })}      className={"px-3 py-1 rounded " + (state.tab==='profile'     ?'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900':'border dark:border-gray-800')}>Profile</button>
        </div>
      </div>

      {/* Overview */}
      {state.tab==='overview' && (
        <div className="grid md:grid-cols-3 gap-3">
          <div className="card p-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">Primary details</div>
            <div className="mt-1">
              <div className="font-medium">{teacherName(t)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t?.email || '—'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t?.phone || t?.mobile || '—'}</div>
            </div>
          </div>
          <div className="card p-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">Teaching load</div>
            <div className="mt-1 text-sm">
              <div>Classes handled: <span className="font-medium">{classesCount}</span></div>
              <div>Weekly periods: <span className="font-medium">{weeklyPeriods}</span></div>
            </div>
          </div>
          <div className="card p-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">Subjects</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {subjectsTaught.length ? subjectsTaught.map((s,i)=>(
                <span key={i} className="chip">{s}</span>
              )) : <span className="text-sm text-gray-500">—</span>}
            </div>
          </div>
        </div>
      )}

      {/* Timetable */}
      {state.tab==='timetable' && (
        <div className="rounded-2xl border dark:border-gray-800 p-3">
          <div className="text-sm font-medium mb-2">Timetable</div>
          <div className="grid md:grid-cols-5 gap-3">
            {['Mon','Tue','Wed','Thu','Fri'].map((day) => {
              const slots = (state.timetable || []).filter((s) => dayMatches(s, day));
              return (
                <div key={day}>
                  <div className="font-semibold mb-1">{day}</div>
                  <div className="space-y-1">
                    {slots.map((s, idx)=>(
                      <div key={idx} className="rounded border px-2 py-1 text-sm dark:border-gray-800">
                        <div className="font-medium">
                          {s.subject || s.title || 'Period'}
                          {s.className || s.class ? ` · ${s.className || s.class}` : ''}
                          {s.section ? `-${s.section}` : ''}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : ''}
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

      {/* Classes */}
      {state.tab==='classes' && (
        <div className="rounded-2xl border dark:border-gray-800 p-3">
          <div className="text-sm font-medium mb-2">Classes</div>
          <ul className="text-sm space-y-2">
            {(state.classes || []).map((c)=>(
              <li key={c._id} className="flex items-center gap-2">
                <span className="chip">{clsLabel(c)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{c?.room || c?.roomNo ? `Room ${c?.room || c?.roomNo}` : ''}</span>
                <button
                  className="ml-auto text-xs border rounded px-2 py-0.5 dark:border-gray-800"
                  onClick={()=> setSelectedClassId(c._id)}
                >
                  Open
                </button>
              </li>
            ))}
            {(state.classes || []).length===0 && <li className="text-gray-500">No classes.</li>}
          </ul>
        </div>
      )}

      {/* Noticeboard */}
      {state.tab==='noticeboard' && (
        <div className="space-y-3">
          <div className="rounded-2xl border p-3 dark:border-gray-800">
            <div className="text-sm font-medium mb-2">New notice</div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Title</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"
                  value={state.noticeTitle}
                  onChange={(e)=>dispatch({ type:'NOTES_FORM', key:'noticeTitle', value:e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300">Body</label>
                <textarea
                  rows={4}
                  className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"
                  value={state.noticeBody}
                  onChange={(e)=>dispatch({ type:'NOTES_FORM', key:'noticeBody', value:e.target.value })}
                />
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={async ()=>{
                  const payload = { teacherId, title: state.noticeTitle, body: state.noticeBody };
                  // Support either /teacher-notices or fallback to /notices
                  await api.post('/teacher-notices', payload).catch(()=> api.post('/notices', payload)).catch(()=>{});
                  const res = await api.get('/teacher-notices', { params:{ teacherId } })
                    .catch(()=> api.get('/notices', { params:{ teacherId } }))
                    .catch(()=> ({ data: [] }));
                  dispatch({ type:'NOTES_SET', rows: res?.data || [] });
                  dispatch({ type:'NOTES_FORM', key:'noticeTitle', value:'' });
                  dispatch({ type:'NOTES_FORM', key:'noticeBody', value:'' });
                }}
                className="px-3 py-2 rounded border text-sm dark:border-gray-800"
              >
                Save notice
              </button>
            </div>
          </div>

          <div className="rounded-2xl border p-3 dark:border-gray-800">
            <div className="text-sm font-medium mb-2">Previous notices</div>
            {state.notesLoading && <div className="text-sm text-gray-500">Loading…</div>}
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
              {(state.notices || []).length===0 && !state.notesLoading && <li className="text-gray-500">No notices.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Profile */}
      {state.tab==='profile' && (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="card p-3">
            <div className="text-sm font-medium mb-2">Contact</div>
            <div className="text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{teacherName(t)}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{t?.email || '—'}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{t?.phone || t?.mobile || '—'}</span></div>
            </div>
          </div>
          <div className="card p-3">
            <div className="text-sm font-medium mb-2">Employment</div>
            <div className="text-sm">
              <div><span className="text-gray-500">Employee ID:</span> <span className="font-medium">{t?.employeeId || t?._id || '—'}</span></div>
              <div><span className="text-gray-500">Designation:</span> <span className="font-medium">{t?.designation || t?.role || '—'}</span></div>
              <div><span className="text-gray-500">Department:</span> <span className="font-medium">{t?.department || '—'}</span></div>
            </div>
          </div>
          <div className="card p-3 md:col-span-2">
            <div className="text-sm font-medium mb-2">About</div>
            <div className="text-sm whitespace-pre-wrap">
              {t?.bio || t?.about || '—'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
