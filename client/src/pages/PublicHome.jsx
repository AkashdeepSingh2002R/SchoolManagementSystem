import { useState } from "react";
import PublicNavbar from "../components/PublicNavbar.jsx";
import HomeLoginCard from "../components/HomeLoginCard.jsx";

/* resilient image loader */
function SafeImg({ stem, alt, className, ...rest }) {
  const base = import.meta.env.BASE_URL || "/";
  const candidates = ["webp","jpg","jpeg","png"].flatMap(ext => [
    `${base}${stem}.${ext}`,
    `${base}${stem.replace(/-/g,"_")}.${ext}`,
    `${base}${stem.replace(/_/g,"-")}.${ext}`,
  ]);
  const [i,setI] = useState(0);
  return (
    <img
      src={candidates[i] || ""}
      onError={() => setI(n => (n < candidates.length-1 ? n+1 : n))}
      alt={alt}
      className={className}
      {...rest}
    />
  );
}

export default function PublicHome(){
  const gallery = ["photo-gallery1","photo-gallery2","photo-gallery3"];

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <PublicNavbar/>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-10">
        {/* HERO — consistent brand in light/dark */}
        <section className="rounded-3xl overflow-hidden border border-stone-200 dark:border-slate-700 shadow-sm">
          <div className="grid md:grid-cols-2">
            {/* Left: copy + CTA */}
            <div className="p-8 md:p-12 bg-stone-50 text-slate-900 dark:bg-slate-900 dark:text-white">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Shaping tomorrow’s leaders
              </h1>
              <p className="mt-3 text-slate-700 dark:text-slate-300">
                A vibrant K–12 school blending tradition, innovation, and community.
              </p>
              <div className="mt-6">
                <a
                  href="/admissions"
                  className="px-5 py-2.5 rounded-xl bg-[#7a1f2a] hover:bg-[#691a24] text-white font-semibold shadow focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  Apply Now
                </a>
              </div>

              {/* Stats — amber chips invert properly in dark */}
              <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm">
                <div className="rounded-xl px-4 py-3 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-800 dark:text-amber-100 dark:border-amber-700">
                  <div className="text-2xl font-extrabold">800+</div>
                  <div className="text-sm">Students</div>
                </div>
                <div className="rounded-xl px-4 py-3 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-800 dark:text-amber-100 dark:border-amber-700">
                  <div className="text-2xl font-extrabold">50+</div>
                  <div className="text-sm">Faculty</div>
                </div>
              </div>
            </div>

            {/* Right: login + image on card background */}
            <div className="p-6 md:p-8 bg-white dark:bg-slate-800 border-l border-stone-200 dark:border-slate-700">
              <div id="login" className="max-w-md ml-auto">
                <div className="rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                  <HomeLoginCard/>
                </div>
              </div>
              <div className="mt-6 rounded-2xl overflow-hidden border border-stone-200 dark:border-slate-700">
<SafeImg stem="school-photo" alt="Campus" className="w-full h-48 md:h-56 object-cover" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-stone-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-800 shadow-sm">
            <div className="flex items-center">
              <h2 className="font-semibold text-lg">Announcements</h2>
              <a href="/news" className="ml-auto text-sm text-[#7a1f2a] hover:underline">View All →</a>
            </div>
            <ul className="mt-3 space-y-2">
              <li><a href="/news#admissions" className="block rounded-lg px-3 py-2 hover:bg-stone-50 dark:hover:bg-slate-700/70">Admissions open for 2025</a></li>
              <li><a href="/news#science-fair" className="block rounded-lg px-3 py-2 hover:bg-stone-50 dark:hover:bg-slate-700/70">Science Fair — May 21</a></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-800 shadow-sm">
            <div className="flex items-center">
              <h2 className="font-semibold text-lg">Programs</h2>
              <a href="/programs" className="ml-auto text-sm text-[#7a1f2a] hover:underline">Learn more →</a>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["STEM","Arts & Music","Languages","Athletics","Clubs"].map(t=>(
                <a key={t} href={`/programs#${encodeURIComponent(t.toLowerCase())}`}
                   className="px-3 py-1.5 rounded-full border border-stone-300 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-700/70 text-sm">
                  {t}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="rounded-2xl border border-stone-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-800 shadow-sm">
          <div className="flex items-center">
            <h2 className="font-semibold text-lg">Gallery</h2>
            <a href="/gallery" className="ml-auto text-sm text-[#7a1f2a] hover:underline">View Gallery →</a>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {gallery.map((stem, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl bg-stone-200 dark:bg-slate-700">
                <SafeImg stem={stem} alt={`Gallery ${i+1}`} className="h-full w-full object-cover hover:scale-[1.02] transition-transform" loading="lazy"/>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-stone-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto p-4 text-sm text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} Bluebell Public School. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
