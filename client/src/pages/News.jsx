import PublicNavbar from '../components/PublicNavbar.jsx';

export default function News(){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <section className="rounded-2xl border dark:border-gray-900 p-6 bg-white dark:bg-gray-950">
          <h1 className="text-3xl font-extrabold tracking-tight">News</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Bluebell's news overview and resources.</p>
        </section>
        
<section className="grid md:grid-cols-3 gap-4">
  {Array.from({length:6}).map((_,i)=> (
    <article key={i} className="rounded-2xl border dark:border-gray-900 p-4 bg-white dark:bg-gray-950">
      <div className="aspect-video rounded-xl bg-gray-200 dark:bg-gray-800 mb-2"/>
      <h3 className="font-semibold">Campus update #{i+1}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">Brief summary of news article and a link to read more.</p>
      <a className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 inline-block" href="#">Read more →</a>
    </article>
  ))}
</section>

      </main>
      <footer className="border-t dark:border-gray-900 mt-12">
        <div className="max-w-7xl mx-auto p-4 text-sm text-gray-500">© {new Date().getFullYear()} Bluebell Public School</div>
      </footer>
    </div>
  );
}