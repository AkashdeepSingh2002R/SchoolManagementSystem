import PublicNavbar from '../components/PublicNavbar.jsx';

export default function About(){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <PublicNavbar />
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <section className="rounded-2xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
          <h1 className="text-3xl font-extrabold tracking-tight">About Bluebell Public School</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            We are a K–12 institution committed to academic rigor, character, and community impact.
            Our programs span STEM, arts, athletics, and leadership.
          </p>
        </section>
        <section className="grid md:grid-cols-3 gap-3">
          <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
            <div className="text-sm text-gray-500">Founded</div>
            <div className="font-semibold mt-1">1998</div>
          </div>
          <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
            <div className="text-sm text-gray-500">Students</div>
            <div className="font-semibold mt-1">~1200</div>
          </div>
          <div className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
            <div className="text-sm text-gray-500">Clubs</div>
            <div className="font-semibold mt-1">40+</div>
          </div>
        </section>
      </main>
    </div>
  );
}