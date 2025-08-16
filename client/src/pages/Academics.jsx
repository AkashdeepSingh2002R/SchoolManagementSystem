import PublicNavbar from '../components/PublicNavbar.jsx';

export default function Academics(){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <section className="rounded-2xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
          <h1 className="text-3xl font-extrabold tracking-tight">Academics</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Bluebell's academics overview and resources.</p>
        </section>
        
<section className="grid md:grid-cols-3 gap-4">
  <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
    <div className="font-semibold">Primary (K–5)</div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Literacy, numeracy, world awareness, maker time.</p>
  </div>
  <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
    <div className="font-semibold">Middle (6–8)</div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Foundations in science, math, languages, arts.</p>
  </div>
  <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
    <div className="font-semibold">Senior (9–12)</div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Advanced coursework, AP/IB options, university prep.</p>
  </div>
</section>
<section className="rounded-2xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
  <div className="font-semibold mb-2">Streams & Clubs</div>
  <ul className="grid md:grid-cols-3 gap-3 text-sm">
    <li className="rounded-xl border p-3 dark:border-gray-900">Robotics & Coding</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Mathematics Circle</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Studio Arts</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Drama & Debate</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Track & Field</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Badminton Club</li>
  </ul>
</section>

      </main>
      <footer className="border-t dark:border-gray-900 mt-12">
        <div className="max-w-7xl mx-auto p-4 text-sm text-gray-500">© {new Date().getFullYear()} Bluebell Public School</div>
      </footer>
    </div>
  );
}