import PublicNavbar from '../components/PublicNavbar.jsx';

export default function Contact(){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <PublicNavbar />
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <section className="rounded-2xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
          <h1 className="text-3xl font-extrabold tracking-tight">Contact</h1>
          <ul className="mt-3 text-sm space-y-2">
            <li><span className="font-medium">Address:</span> 45 Bluebell Way, Toronto, ON</li>
            <li><span className="font-medium">Email:</span> info@bluebell.school</li>
            <li><span className="font-medium">Phone:</span> (416) 555-0179</li>
          </ul>
        </section>
      </main>
    </div>
  );
}