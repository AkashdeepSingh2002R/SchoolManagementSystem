import PublicNavbar from '../components/PublicNavbar.jsx';
import HomeLoginCard from '../components/HomeLoginCard.jsx';

function Stat({ label, value }){
  return (
    <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

export default function PublicHome(){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* Hero & Right Column */}
        <section className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Inspiring minds, <br /> building futures
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">A K–12 community focused on curiosity, character, and excellence.</p>
                  <div className="mt-4 flex gap-2">
                    <a href="/about" className="px-4 py-2 rounded-xl bg-emerald-600 text-white">Learn More</a>
                    <a href="/contact" className="px-4 py-2 rounded-xl border dark:border-gray-800">Contact Us</a>
                  </div>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {/* Placeholder for hero image */}
                  <div className="w-full h-full grid place-items-center text-gray-500">[ School Photo ]</div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Stat label="Students" value="800+" />
              <Stat label="Teachers" value="50+" />
            </div>

            {/* Announcements strip */}
            <div className="rounded-2xl border dark:border-gray-900 p-3 overflow-hidden bg-white dark:bg-gray-950">
              <div className="text-xs tracking-wide uppercase text-gray-500 mb-2">Announcements</div>
              <div className="text-sm flex flex-wrap gap-3">
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">Admissions open for 2025</span>
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">Science Fair · May 21</span>
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">Sports Day · June 3</span>
                <a href="/news" className="ml-auto text-emerald-700 dark:text-emerald-400">All updates →</a>
              </div>
            </div>

            {/* Upcoming & Programs */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
                <div className="font-semibold">Upcoming Events</div>
                <ul className="mt-2 text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">Apr 15</span>
                    <span>Art Exhibition</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">May 21</span>
                    <span>Science Fair</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">Jun 03</span>
                    <span>Sports Day</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
                <div className="font-semibold">Academic Programs</div>
                <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                  <li>STEM Pathways (Robotics, Coding, Math Circles)</li>
                  <li>Arts & Design (Studio, Music, Drama)</li>
                  <li>Languages (English, Hindi, Punjabi, French)</li>
                  <li>Athletics (Track, Football, Badminton)</li>
                </ul>
              </div>
            </div>

            {/* Testimonials + Gallery */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
                <div className="font-semibold mb-2">Parent Testimonials</div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({length:4}).map((_,i)=>(
                    <div key={i} className="rounded-xl border dark:border-gray-900 p-3 text-sm">
                      “Excellent teachers and a supportive environment.”
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
                <div className="font-semibold mb-2">Photo Gallery</div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({length:6}).map((_,i)=>(
                    <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-800" />
                  ))}
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
              <div className="font-semibold">Email newsletter</div>
              <div className="mt-2 flex gap-2">
                <input placeholder="Enter your email" className="flex-1 border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-800" />
                <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900">Subscribe</button>
              </div>
            </div>
          </div>

          {/* Right 1/3 */}
          <div className="space-y-4">
            <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
              <div className="font-semibold mb-2">Quick Links</div>
              <ul className="text-sm space-y-1">
                <li><a href="/academics" className="hover:underline">Curriculum & Streams</a></li>
                <li><a href="/admissions" className="hover:underline">Admissions Process</a></li>
                <li><a href="/events" className="hover:underline">School Calendar</a></li>
                <li><a href="/news" className="hover:underline">Latest News</a></li>
              </ul>
            </div>

            <HomeLoginCard />
          </div>
        </section>
      </main>

      <footer className="border-t dark:border-gray-900 mt-12">
        <div className="max-w-7xl mx-auto p-4 text-sm text-gray-500">
          © {new Date().getFullYear()} Bluebell Public School. All rights reserved.
        </div>
      </footer>
    </div>
  );
}