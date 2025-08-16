  // Minimal OpenRouter client: generation & translation from the UI (no server roundtrip)
  const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  function withTimeout(ms, signal){
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(new Error('timeout')), ms);
    const combo = signal ? new AbortController() : ctrl;
    if(signal){
      signal.addEventListener('abort', ()=>combo.abort(signal.reason), { once:true });
    }
    return { signal: combo.signal, done:()=>clearTimeout(timer) };
  }

  export async function orChat({ system, messages, temperature=0.4, max_tokens=600, timeoutMs=15000, signal }){
    if(!KEY) throw new Error('Missing VITE_OPENROUTER_API_KEY');
    const { signal: sig, done } = withTimeout(timeoutMs, signal);
    try{
      const resp = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': location.origin,
          'X-Title': 'School Management System'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            ...(system? [{ role:'system', content: system }] : []),
            ...messages
          ],
          temperature,
          max_tokens
        }),
        signal: sig
      });
      if(!resp.ok){
        const txt = await resp.text().catch(()=>'');
        throw new Error('OpenRouter error: '+resp.status+' '+txt.slice(0,200));
      }
      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content || '';
      return content;
    } finally {
      done();
    }
  }

  // Translate text into a target language
  export async function orTranslate({ text, target, timeoutMs=15000, signal }){
    const sys = "You are a professional translator. Preserve meaning, tone, dates, and formatting. Return ONLY the translated text, no preface.";
    const content = await orChat({
      system: sys,
      messages: [{ role:'user', content: `Translate to ${target}:

${text}`}],
      temperature: 0.2,
      max_tokens: 800,
      timeoutMs,
      signal
    });
    return (content||'').trim();
  }

  // Suggest structured announcement (title + body)
  export async function orSuggestAnnouncement({ prompt, tone='formal', length='medium', timeoutMs=20000, signal }){
    const sys = "You write concise, parent-friendly school announcements. Output as JSON with keys: title, body.";
    const content = await orChat({
      system: sys,
      messages: [{ role:'user', content: `Tone: ${tone}
Length: ${length}
Instruction: ${prompt}

Respond in JSON.`}],
      temperature: 0.3,
      max_tokens: 700,
      timeoutMs,
      signal
    });
    try {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if(jsonStart>=0 && jsonEnd>jsonStart){
        const obj = JSON.parse(content.slice(jsonStart, jsonEnd+1));
        return { title: obj.title || 'Announcement', body: obj.body || '' };
      }
    } catch {}
    return { title: 'Announcement', body: content };
  }

  // Utility: replace "this sat", "next mon", etc. with actual dates (America/Toronto)
  export function normalizeNaturalDates(input){
    const text = input||'';
    const map = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };
    function nextDow(dow, from=new Date()){
      const day = from.getDay();
      let diff = (dow - day + 7) % 7;
      if(diff===0) diff = 7; // next instance
      const dt = new Date(from); dt.setDate(from.getDate() + diff);
      return dt;
    }
    function thisDow(dow, from=new Date()){
      const day = from.getDay();
      let diff = (dow - day + 7) % 7;
      const dt = new Date(from); dt.setDate(from.getDate() + diff);
      return dt;
    }
    function fmt(d){
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,'0');
      const day = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    }
    return text.replace(/(this|next)\s+(sun|mon|tue|wed|thu|fri|sat)/gi, (_, which, d3)=>{
      const dow = map[d3.toLowerCase()];
      const dt = which.toLowerCase()==='this' ? thisDow(dow) : nextDow(dow);
      return `${d3} (${fmt(dt)})`;
    });
  }
