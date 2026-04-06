import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="flex-1 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl rounded-3xl border border-white/55 bg-slate-900/78 p-6 text-slate-200 shadow-xl shadow-slate-900/30 backdrop-blur-md sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">Company</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">About Us</h1>

          <p className="mt-5 text-base leading-relaxed text-slate-300">
            This is an e-book marketplace where publishers can publish books and readers can buy and read books here.
          </p>

          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Our goal is to provide a reliable and simple digital reading ecosystem for both publishers and readers.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
