
import dotenv from 'dotenv';
dotenv.config();
import { webResearch } from './research.js';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

async function safeJson(res){
  try{ return JSON.parse(res); }catch{ return null; }
}
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

// Provider: OpenAI (JSON mode)
async function callOpenAIJson(system, user, temperature=0.6){
  if(!OPENAI_KEY) return null;
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type':'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: clamp(temperature, 0, 1.2),
      response_format: { type: 'json_object' },
      messages: [{ role:'system', content: system }, { role:'user', content: user }]
    })
  }).catch(()=>null);
  if(!resp || !resp.ok) return null;
  const data = await resp.json().catch(()=>null);
  const content = data?.choices?.[0]?.message?.content || '';
  return safeJson(content);
}

// Provider: OpenRouter
async function callOpenRouterJson(system, user, temperature=0.8){
  if(!OPENROUTER_KEY) return null;
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + OPENROUTER_KEY,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://bluebell.local',
      'X-Title': 'School SMS'
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      temperature: clamp(temperature, 0, 1.2),
      messages: [
        { role:'system', content: system },
        { role:'user', content: user + '\n\nReturn ONLY valid JSON.' }
      ]
    })
  }).catch(()=>null);
  if(!resp || !resp.ok) return null;
  const data = await resp.json().catch(()=>null);
  const content = data?.choices?.[0]?.message?.content || '';
  const cleaned = String(content).replace(/^```(?:json)?/i,'').replace(/```$/,'');
  return safeJson(cleaned);
}

// ---------- Research-first prompts ----------
function buildResearchPrompt({ kind='announcement', prompt='', tone='friendly', length='medium', findings=[], school='Bluebell Public School' }){
  const today = new Date().toISOString().slice(0,10);
  const toneLine = `Tone: ${tone}. Length: ${length}. Audience: school community.`;
  const rules = [
    'Use ONLY the provided findings for facts.',
    'If a specific date/time/venue is NOT in findings, say "TBD" instead of inventing.',
    'Be concise, concrete, and school-appropriate.',
    'Never copy text verbatim; synthesize.',
    'Return strictly valid JSON.'
  ].join(' ');
  const findingsText = findings.map((f,i)=>`[${i+1}] ${f.title}\nURL: ${f.url}\nSNIPPET: ${f.snippet}`).join('\n\n');

  const sys = `You are a school communications assistant. Today is ${today}. ${rules}
Output format:
{
  "suggestions":[
    {"title":"...","body":"...","sources":["<url1>","<url2>"]}
  ]
}`;

  const user = `KIND: ${kind}\nPROMPT: ${prompt}\nSCHOOL: ${school}\n${toneLine}\n\nFINDINGS:\n${findingsText}`;
  return { system: sys, user };
}

export async function aiSuggest({ prompt='', kind='announcement', count=3, tone='friendly', length='medium', research=true, school='Bluebell Public School' }){
  let suggestions = [];
  let findings = [];
  if(research){
    findings = await webResearch(prompt, { maxResults: 6 }).catch(()=>[]);
  }
  const { system, user } = buildResearchPrompt({ kind, prompt, tone, length, findings, school });
  // Try OpenAI first for JSON reliability
  const viaOpenAI = await callOpenAIJson(system, user, 0.6).catch(()=>null);
  if(viaOpenAI?.suggestions) suggestions = viaOpenAI.suggestions;
  if(!suggestions?.length){
    const viaOR = await callOpenRouterJson(system, user, 0.85).catch(()=>null);
    if(viaOR?.suggestions) suggestions = viaOR.suggestions;
  }
  if(!suggestions?.length){
    // Last resort minimal output
    suggestions = [ { title: (prompt||'Update').slice(0,80), body: 'Details TBD. See calendar or contact office.', sources: findings.slice(0,2).map(f=>f.url) } ];
  }
  return suggestions.slice(0, Math.max(1, count));
}

// Translation stays the same (no key needed); falls back to providers if present
export async function translate({ title='', body='', target='en' }){
  try{
    const tr = await import('@vitalets/google-translate-api');
    const t1 = await tr.default(title, { to: target }).catch(()=>({ text: title }));
    const t2 = await tr.default(body, { to: target }).catch(()=>({ text: body }));
    return { title: t1?.text || title, body: t2?.text || body };
  }catch{
    // If translate lib not available in runtime for some reason, try LLMs
    const system = 'Translate precisely and return JSON: {"title":"...","body":"..."}';
    const user = `Target: ${target}. Title: ${title}\nBody: ${body}`;
    const viaOpenAI = await callOpenAIJson(system, user, 0.3).catch(()=>null);
    if(viaOpenAI?.title) return viaOpenAI;
    const viaOR = await callOpenRouterJson(system, user, 0.3).catch(()=>null);
    if(viaOR?.title) return viaOR;
    return { title, body };
  }
}

// Back-compat for assignments
export async function aiSuggestOrFallback({ kind, prompt }){
  const list = await aiSuggest({ prompt, kind, count: 1, research: true }).catch(()=>[]);
  return Array.isArray(list) && list[0] ? list[0] : { title: prompt || 'Assignment', body: 'Details TBD.' };
}
