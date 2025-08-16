
import dotenv from 'dotenv';
dotenv.config();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
const SERPER_API_KEY = process.env.SERPER_API_KEY || '';

/**
 * Perform web research using Tavily (preferred) or Serper.dev (Google).
 * Returns array of { title, url, snippet } trimmed for prompt context.
 */
export async function webResearch(query, { maxResults=6 }={}){
  if(!query || !query.trim()) return [];
  // Prefer Tavily: richer content
  if(TAVILY_API_KEY){
    try{
      const resp = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          search_depth: 'advanced',
          include_answer: false,
          max_results: maxResults,
          days: 365 // allow up to 1 year
        })
      });
      if(resp.ok){
        const data = await resp.json();
        const out = (data?.results||[]).map(r=>({
          title: (r.title||'').slice(0,140),
          url: r.url || '',
          snippet: (r.content||r.snippet||'').slice(0,600)
        })).filter(x=>x.url);
        return out;
      }
    }catch(_){}
  }
  // Fallback: Serper.dev
  if(SERPER_API_KEY){
    try{
      const resp = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'X-API-KEY': SERPER_API_KEY },
        body: JSON.stringify({ q: query, gl: 'in', hl: 'en' })
      });
      if(resp.ok){
        const data = await resp.json();
        const out = (data?.organic||[]).slice(0,maxResults).map(r=>({
          title: (r.title||'').slice(0,140),
          url: r.link || '',
          snippet: (r.snippet||'').slice(0,600)
        })).filter(x=>x.url);
        return out;
      }
    }catch(_){}
  }
  return [];
}
