// server/src/utils/ai.js
// ESM module
import dotenv from 'dotenv';
dotenv.config();
import { webResearch } from './research.js';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

// ---------- helpers ----------
async function safeJson(text){
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  // Try to extract the first JSON object
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start){
    try { return JSON.parse(text.slice(start, end+1)); } catch {}
  }
  return null;
}
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

// ---------- Providers (JSON mode preferred) ----------
async function callOpenAIJson(system, user, temperature=0.6){
  if(!OPENAI_KEY) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // stable, JSON-friendly
        temperature: clamp(temperature, 0, 1),
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    });
    const json = await res.json().catch(()=>null);
    const content = json?.choices?.[0]?.message?.content || '';
    return await safeJson(content);
  } catch (e) {
    return null;
  }
}

async function callOpenRouterJson(system, user, temperature=0.7){
  if(!OPENROUTER_KEY) return null;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openrouter/auto', // lets OR route to a JSON-capable model
        temperature: clamp(temperature, 0, 1),
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    });
    const json = await res.json().catch(()=>null);
    const content = json?.choices?.[0]?.message?.content || '';
    return await safeJson(content);
  } catch (e) {
    return null;
  }
}

// ---------- Research-first prompts (announcements/newsletters) ----------
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

  const findingsText = (findings || []).map((f,i)=>`[${i+1}] ${f.title}\nURL: ${f.url}\nSNIPPET: ${f.snippet}`).join('\n\n');

  const sys = `You are a school communications assistant. Today is ${today}. ${rules}
Output format:
{
  "suggestions":[
    { "title":"...", "body":"..." }
  ]
}`;

  const label = kind === 'newsletter' ? 'newsletter article' : 'announcement';
  const user = `School: ${school}
${toneLine}
Create ${label} drafts from this prompt: ${prompt || 'General school update'}.
Ground all facts ONLY in these findings:
${findingsText || '(no findings provided — use TBD for unknowns)'}`;

  return { system: sys, user };
}

// ---------- Assignment-specific prompt ----------
function buildAssignmentPrompt({ prompt='', tone='clear', length='medium', school='Bluebell Public School' }){
  const today = new Date().toISOString().slice(0,10);
  const rules = [
    'Do NOT invent real-world facts or dates.',
    'Be specific and age-appropriate.',
    'Use clear, student-friendly language for steps.',
    'Return strictly valid JSON matching the schema.'
  ].join(' ');

  const sys = `You are an expert K-12 teacher designing high-quality assignments. Today is ${today}. ${rules}
Output JSON schema:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string (teacher-facing summary)",
      "subject": "string",
      "gradeLevel": "string | number",
      "estimatedTime": "string",
      "difficulty": "easy | medium | hard",
      "objectives": ["..."],
      "materials": ["..."],
      "steps": ["1. ...", "2. ..."],
      "successCriteria": ["..."],
      "rubric": [
        { "criterion": "string", "levels": [
          {"name":"Exceeds","descriptor":"..."},
          {"name":"Meets","descriptor":"..."},
          {"name":"Approaches","descriptor":"..."}
        ]}
      ],
      "extensions": ["..."],
      "accommodations": ["..."],
      "academicIntegrityNote": "string"
    }
  ]
}`;

  const user = `School: ${school}
Tone: ${tone}. Length: ${length}.
Assignment request (topic or spec): ${prompt}

If subject, grade, or constraints are not stated, infer reasonable defaults and keep the task broadly applicable.`;

  return { system: sys, user };
}

// ---------- Public API ----------
export async function aiSuggest({ prompt='', kind='announcement', count=3, tone='friendly', length='medium', research=true, school='Bluebell Public School' }){
  let suggestions = [];
  let system, user;

  if (kind === 'assignment') {
    ({ system, user } = buildAssignmentPrompt({ prompt, tone, length, school }));
  } else {
    // Announcements/newsletters: optionally do research
    let findings = [];
    if (research) {
      findings = await webResearch(prompt, { maxResults: 6 }).catch(()=>[]);
    }
    ({ system, user } = buildResearchPrompt({ kind, prompt, tone, length, findings, school }));
  }

  // Prefer OpenAI JSON for reliability
  const viaOpenAI = await callOpenAIJson(system, user, kind==='assignment' ? 0.5 : 0.6).catch(()=>null);
  if(viaOpenAI?.suggestions) suggestions = viaOpenAI.suggestions;

  if(!suggestions?.length){
    const viaOR = await callOpenRouterJson(system, user, kind==='assignment' ? 0.7 : 0.85).catch(()=>null);
    if(viaOR?.suggestions) suggestions = viaOR.suggestions;
  }

  if(!suggestions?.length){
    // Minimal structured fallback (still predictable)
    if (kind === 'assignment') {
      suggestions = [{
        title: prompt || 'Assignment',
        description: 'Complete the task based on the topic.',
        subject: 'General',
        gradeLevel: 'Mixed',
        estimatedTime: '30–45 min',
        difficulty: 'medium',
        objectives: ['Practice core skills related to the topic.'],
        materials: [],
        steps: ['Read the instructions.', 'Complete the tasks.', 'Submit your work.'],
        successCriteria: ['Fulfills the task', 'Clear communication', 'Neat and complete'],
        rubric: [{ criterion:'Quality of work', levels:[
          { name:'Exceeds', descriptor:'Thorough, accurate, and insightful' },
          { name:'Meets', descriptor:'Accurate and complete' },
          { name:'Approaches', descriptor:'Partial or unclear' }
        ]}],
        extensions: [],
        accommodations: [],
        academicIntegrityNote: 'Submit original work.'
      }];
    } else {
      suggestions = [{ title: prompt || 'Update', body: 'Details TBD.' }];
    }
  }

  return suggestions.slice(0, Math.max(1, Math.min(5, count)));
}

// Back-compat convenience for assignment route
export async function aiSuggestOrFallback({ kind, prompt }){
  const list = await aiSuggest({ prompt, kind, count: 1, research: kind!=='assignment' }).catch(()=>[]);
  if (Array.isArray(list) && list[0]) {
    const s = list[0];
    // Provide {title, body} shape to avoid breaking older clients
    const body = (s.body) ? s.body : renderAssignmentMarkdown(s);
    return { title: s.title || (prompt || 'Assignment'), body };
  }
  return { title: prompt || (kind==='assignment' ? 'Assignment' : 'Draft'), body: 'Details TBD.' };
}

// Translate utility (returns {title, body})
export async function translate({ title='', body='', target='en' }){
  const system = 'Translate the provided title and body into the target language. Return JSON: {"title":"...","body":"..."}';
  const user = `Target: ${target}
Title:
${title || ''}

Body:
${body || ''}`;

  const viaOpenAI = await callOpenAIJson(system, user, 0.3).catch(()=>null);
  if(viaOpenAI?.title) return viaOpenAI;
  const viaOR = await callOpenRouterJson(system, user, 0.3).catch(()=>null);
  if(viaOR?.title) return viaOR;
  return { title, body };
}

// ---------- local helper (markdown serializer) ----------
function renderAssignmentMarkdown(s = {}){
  if (!s || typeof s !== 'object') return '';
  const L = (arr) => Array.isArray(arr) && arr.length ? arr : null;
  const sec = (h, lines) => lines ? `\n\n**${h}**\n- ${lines.join('\n- ')}` : '';
  const rubricSec = Array.isArray(s.rubric) && s.rubric.length
    ? '\n\n**Rubric**\n' + s.rubric.map(r =>
        `- ${r.criterion}: ` + (Array.isArray(r.levels) ? r.levels.map(l => `${l.name} — ${l.descriptor}`).join(' | ') : '')
      ).join('\n')
    : '';

  let md = `**${s.title || 'Assignment'}**`;
  if (s.description) md += `\n\n${s.description}`;
  const meta = [
    s.subject ? `Subject: ${s.subject}` : null,
    s.gradeLevel ? `Grade: ${s.gradeLevel}` : null,
    s.difficulty ? `Difficulty: ${s.difficulty}` : null,
    s.estimatedTime ? `Estimated Time: ${s.estimatedTime}` : null,
  ].filter(Boolean);
  if (meta.length) md += `\n\n_${meta.join(' · ')}_`;

  md += sec('Objectives', L(s.objectives));
  md += sec('Materials', L(s.materials));
  md += sec('Steps', L(s.steps));
  md += sec('Success Criteria', L(s.successCriteria));
  md += rubricSec;
  md += sec('Extensions', L(s.extensions));
  md += sec('Accommodations', L(s.accommodations));
  if (s.academicIntegrityNote) md += `\n\n_${s.academicIntegrityNote}_`;
  return md.trim();
}

// also export to let routes reuse markdown renderer if desired
export { renderAssignmentMarkdown };
