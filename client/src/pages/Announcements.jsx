import { useEffect, useState } from 'react';
import api from '../api/axios';
import { orSuggestAnnouncement, orTranslate, normalizeNaturalDates } from '../api/openrouter';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'pa', label: 'Punjabi' },
];

const TONES = ['formal','friendly','celebratory','concise'];
const LENGTHS = ['short','medium','long'];

export default function Announcements(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI controls
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('friendly');
  const [length, setLength] = useState('medium');
  const [aiBusy, setAiBusy] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Editor
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [langs, setLangs] = useState(['en']);
  const [posting, setPosting] = useState(false);

  // Schedule/Pin/Status
  const [scheduledAt, setScheduledAt] = useState(() => new Date().toISOString().slice(0,16));
  const [expiresAt, setExpiresAt] = useState('');
  const [pinned, setPinned] = useState(false);
  const [status, setStatus] = useState('published');

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  useEffect(()=>{
    let ok = true;
    setLoading(true);
    api.get('/announcements')
      .then(({data})=>{ if(ok) setRows(data||[]) })
      .catch(()=>{ if(ok) setRows([]) })
      .finally(()=>{ if(ok) setLoading(false) });
    return ()=>{ ok=false };
  },[]);

  function toggleLang(code){
    setLangs(prev => prev.includes(code) ? prev.filter(c=>c!==code) : [...prev, code]);
  }

  
async function aiGenerate(){
  // Use OpenRouter directly from the UI (no server roundtrip)
  const source = (prompt || body || '').trim();
  if(!source){ return; }
  setAiBusy(true);
  try{
    const processed = normalizeNaturalDates(source);
    const out = await orSuggestAnnouncement({ prompt: processed, tone, length });
    const sug = { title: out?.title || 'Announcement', body: out?.body || '' };
    setSuggestions([sug]);
    setTitle(sug.title);
    setBody(sug.body);
  }catch(err){
    console.error('AI suggest failed', err);
    setSuggestions([]);
  }finally{
    setAiBusy(false);
  }
}

  async function postAnnouncement(e){
    e?.preventDefault();
    if(!title.trim() || !body.trim()) return;

    setPosting(true);
    try{
      // 1) Prepare language versions
      const targets = langs.filter(l=>l!=='en');
      
const jobs = targets.map(async (code)=>{
  try{
    const tTitle = await orTranslate({ text: title, target: code });
    const tBody  = await orTranslate({ text: body,  target: code });
    return { code, title: (tTitle||title), body: (tBody||body) };
  }catch{
    return { code, title, body };
  }
});
const translated = await Promise.all(jobs).catch(()=>[]);

      const setAll = [{ code:'en', title, body }, ...translated];

      // 2) Save each language as a separate document
      const payloadBase = { audiences: ['all'], pinned, scheduledAt, expiresAt: expiresAt||null, status };
      const saved = await Promise.all(setAll.map(v =>
        api.post('/announcements', { title: v.title, body: v.body, lang: v.code, ...payloadBase })
             .then(r=>r.data).catch(()=>null)
      ));

      // 3) Reload list
      const { data: after } = await api.get('/announcements');
      setRows(after||[]);
      // clear editor
      setTitle(''); setBody(''); setPrompt(''); setSuggestions([]); setLangs(['en']); setPinned(false);
    }finally{
      setPosting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* AI Assist Top Bar */}
      <div className="rounded-2xl border p-3 dark:border-gray-800">
        <div className="text-sm font-medium mb-2">AI Assist</div>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"
            placeholder="Describe the announcement (e.g., August highlights, Annual Sports Day, PTA meeting...)"
            value={prompt}
            onChange={(e)=>setPrompt(e.target.value)}
          />
          <select value={tone} onChange={e=>setTone(e.target.value)} className="border rounded px-2 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800">
            {TONES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <select value={length} onChange={e=>setLength(e.target.value)} className="border rounded px-2 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800">
            {LENGTHS.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={aiGenerate} disabled={aiBusy} className="px-3 py-2 rounded border text-sm dark:border-gray-800">{aiBusy ? 'AI…' : 'Generate'}</button>
          <button onClick={()=>{ setPrompt(''); setSuggestions([]); }} className="px-3 py-2 rounded border text-sm dark:border-gray-800">Clear</button>
        </div>

        {suggestions.length>0 && (
          <div className="mt-3 grid md:grid-cols-3 gap-2">
            {suggestions.map((s,i)=>(
              <button key={i} title="Click to apply" onClick={()=>{ setTitle(s.title||''); setBody(s.body||''); }}
                className="rounded-xl border p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs opacity-80">{(s.body||'').slice(0,180)}{(s.body||'').length>180?'…':''}</div>
              </button>
            ))}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">Click a card to autofill Title and Body. You can edit before posting.</div>
      </div>

      {/* Editor */}
      <div className="rounded-2xl border dark:border-gray-900 p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"/>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Languages</label>
            <div className="flex gap-3 flex-wrap">
              {LANGS.map(l=>(
                <label key={l.code} className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={langs.includes(l.code)} onChange={()=>toggleLang(l.code)} />
                  {l.label}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500">Body</label>
            <textarea rows={6} value={body} onChange={e=>setBody(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"/>
          </div>
        </div>

        {/* Options */}
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs text-gray-500">Schedule (local)</label>
            <input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"/>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Expires (optional)</label>
            <input type="datetime-local" value={expiresAt} onChange={e=>setExpiresAt(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800"/>
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={pinned} onChange={e=>setPinned(e.target.checked)} />
            <span className="text-sm">Pin this announcement</span>
          </label>
          <div>
            <label className="block text-xs text-gray-500">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="button" onClick={()=>setShowPreview(true)} className="px-3 py-2 rounded-xl border dark:border-gray-800">Preview</button>
            <button onClick={postAnnouncement} disabled={posting} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900">{posting ? 'Posting…' : 'Post'}</button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border dark:border-gray-900 p-4">
        <div className="font-semibold mb-2">Recent</div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <ul className="text-sm space-y-3">
            {rows.map(r=>(
              <li key={r._id} className="rounded-xl border dark:border-gray-900 p-3">
                <div className="flex items-center gap-2">
                  <div className="text-xs rounded px-2 py-0.5 border dark:border-gray-800">{(r.lang||'en').toUpperCase()}</div>
                  <div className="font-medium">{r.title || 'Untitled'}</div>
                  <div className="ml-auto text-xs text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                </div>
                <div className="opacity-80 mt-1 whitespace-pre-wrap">{r.body || ''}</div>
              </li>
            ))}
            {(!rows || rows.length===0) && <li className="text-gray-500">No announcements yet.</li>}
          </ul>
        )}
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4">
          <div className="max-w-2xl w-full rounded-2xl border dark:border-gray-900 bg-white dark:bg-gray-950 p-5">
            <div className="text-lg font-semibold mb-2">Preview</div>
            <div className="font-bold">{title}</div>
            <div className="mt-2 whitespace-pre-wrap">{body}</div>
            <div className="mt-4 text-right">
              <button onClick={()=>setShowPreview(false)} className="px-3 py-2 rounded-xl border dark:border-gray-800">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
