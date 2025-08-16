import PublicNavbar from '../components/PublicNavbar.jsx';

export default function Admissions(){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <section className="rounded-2xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
          <h1 className="text-3xl font-extrabold tracking-tight">Admissions</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Bluebell's admissions overview and resources.</p>
        </section>
        
<section className="grid md:grid-cols-2 gap-4">
  <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
    <div className="font-semibold">How to Apply</div>
    <ol className="list-decimal pl-5 text-sm space-y-1 mt-2">
      <li>Submit online application</li>
      <li>Provide transcripts and ID</li>
      <li>Interview with admissions</li>
      <li>Offer & enrollment</li>
    </ol>
  </div>
  <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
    <div className="font-semibold">Tuition & Aid</div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">We offer need-based financial aid. Contact admissions for details.</p>
  </div>
</section>
<section className="rounded-2xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
  <div className="font-semibold mb-2">Key Dates</div>
  <ul className="grid sm:grid-cols-2 gap-2 text-sm">
    <li className="rounded-xl border p-3 dark:border-gray-900">Applications open — Sep 1</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Scholarship deadline — Dec 15</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Decisions released — Feb 20</li>
    <li className="rounded-xl border p-3 dark:border-gray-900">Enrollment due — Mar 15</li>
  </ul>
</section>

      </main>
      <footer className="border-t dark:border-gray-900 mt-12">
        <div className="max-w-7xl mx-auto p-4 text-sm text-gray-500">© {new Date().getFullYear()} Bluebell Public School</div>
      </footer>
    </div>
  );
}