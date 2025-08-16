import { strict as assert } from 'assert';

const MONTHS = {
  jan:0, january:0,
  feb:1, february:1,
  mar:2, march:2,
  apr:3, april:3,
  may:4,
  jun:5, june:5,
  jul:6, july:6,
  aug:7, august:7,
  sep:8, sept:8, september:8,
  oct:9, october:9,
  nov:10, november:10,
  dec:11, december:11,
};

function parseTimePart(s){
  // "10", "10am", "10 am", "10:30", "13:00"
  const m = String(s).trim().match(/^([0-2]?\d)(?::(\d{2}))?\s*(am|pm)?$/i);
  if(!m) return null;
  let h = parseInt(m[1],10); const min = m[2] ? parseInt(m[2],10) : 0; const ampm = (m[3]||'').toLowerCase();
  if(ampm==='pm' && h<12) h+=12;
  if(ampm==='am' && h===12) h=0;
  if(h>23) return null;
  return { h, min };
}

export function parseNaturalDateRange(text, now=new Date()){
  const s = String(text||'').toLowerCase();
  // this saturday / next saturday
  const ds = s.match(/(this|coming|next)\s+(mon|tue|tues|weds|wed|thu|thur|thurs|fri|sat|sun|sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i);
  let startDate=null;
  if(ds){
    const map = {sun:0, mon:1, tue:2, tues:2, wed:3, weds:3, thu:4, thur:4, thurs:4, fri:5, sat:6, sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6};
    const tg = map[ds[2].toLowerCase()] ?? 6;
    const d = new Date(now);
    const delta = (tg - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate()+delta);
    startDate = d;
  }
  // explicit 20 aug / 20 august / aug 20
  const dmy = s.match(/(?:(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s*(\d{1,2}))(?:,?\s*(\d{4}))?/i);
  if(dmy){
    let day, mon, year;
    if(dmy[1] && dmy[2]){ day = parseInt(dmy[1],10); mon = MONTHS[dmy[2].toLowerCase()]; }
    else if(dmy[3]){ day = parseInt(dmy[3],10); mon = MONTHS[(dmy[0].match(/[a-z]+/i)||[''])[0].toLowerCase()]; }
    year = dmy[4] ? parseInt(dmy[4],10) : now.getFullYear();
    const d = new Date(year, mon, day);
    startDate = d;
  }
  if(!startDate) return null;

  // time range: "10 am to 1 pm", "10-13", "10:30–13:00"
  const tr = s.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|–|—)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  let start=null, end=null;
  if(tr){
    start = parseTimePart(tr[1]);
    end = parseTimePart(tr[2]);
  }
  const startISO = new Date(startDate);
  const endISO = new Date(startDate);
  if(start){ startISO.setHours(start.h, start.min, 0, 0); }
  if(end){ endISO.setHours(end.h, end.min, 0, 0); }

  return { date: startDate, start: startISO, end: endISO };
}

export function fmtDate(d){
  if(!(d instanceof Date)) return '';
  const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
export function fmtTime(d){
  if(!(d instanceof Date)) return '';
  let h=d.getHours(), min=String(d.getMinutes()).padStart(2,'0'); const ampm = h>=12?'PM':'AM'; h = h%12||12; return `${h}:${min} ${ampm}`;
}
