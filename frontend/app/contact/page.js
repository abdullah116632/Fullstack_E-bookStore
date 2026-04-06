import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="flex-1 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl rounded-3xl border border-white/55 bg-slate-900/78 p-6 text-slate-200 shadow-xl shadow-slate-900/30 backdrop-blur-md sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">Company</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Contact</h1>
          <p className="mt-4 text-base text-slate-300">For support, business queries, or general questions, contact us using the details below.</p>

          <div className="mt-6 space-y-4 rounded-2xl border border-white/15 bg-white/5 p-5">
            <div>
              <p className="text-sm font-semibold text-slate-200">Email</p>
              <a href="mailto:abdullah116632@gmail.com" className="text-cyan-200 transition-colors hover:text-cyan-100">
                abdullah116632@gmail.com
              </a>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">Phone</p>
              <a href="tel:01768899941" className="text-cyan-200 transition-colors hover:text-cyan-100">
                01768899941
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
