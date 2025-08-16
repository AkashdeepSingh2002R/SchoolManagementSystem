import PublicNavbar from '../components/PublicNavbar.jsx';

export default function Events(){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <section className="rounded-2xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
          <h1 className="text-3xl font-extrabold tracking-tight">Events</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Bluebell's events overview and resources.</p>
        </section>
        
<section className="rounded-2xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
  <div className="font-semibold">This Month</div>
  <ul className="mt-2 grid md:grid-cols-2 gap-2 text-sm">
    <li className="rounded-xl border p-3 dark:border-gray-900">Apr 15 — Art Exhibition (Auditorium)</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">May 21 — Science Fair (Gym)</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Jun 03 — Sports Day (Field)</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Jun 14 — Talent Show (Hall)</li>
  </ul>
</section>

      </main>
      <footer className="border-t dark:border-gray-900 mt-12">
        <div className="max-w-7xl mx-auto p-4 text-sm text-gray-500">© {new Date().getFullYear()} Bluebell Public School</div>
      </footer>
    </div>
  );
}