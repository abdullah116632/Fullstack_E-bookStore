import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="flex-1 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl rounded-3xl border border-white/55 bg-slate-900/78 p-6 text-slate-200 shadow-xl shadow-slate-900/30 backdrop-blur-md sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">Legal</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-slate-400">Effective date: April 6, 2026</p>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-300 sm:text-base">
            <section>
              <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
              <p className="mt-2">
                We may collect personal information such as your name, email address, account credentials, purchase history,
                and basic usage data needed to operate the e-book marketplace.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">2. How We Use Information</h2>
              <p className="mt-2">
                We use your information to provide account access, process purchases, deliver books, improve platform
                functionality, communicate updates, and protect user accounts from fraud or misuse.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">3. Data Sharing</h2>
              <p className="mt-2">
                We do not sell personal data. We may share limited information with trusted service providers that support
                payment processing, hosting, analytics, and security, only as necessary to run the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">4. Data Security</h2>
              <p className="mt-2">
                We apply reasonable administrative and technical safeguards to protect user data. No online system can
                guarantee absolute security, but we continuously improve protective measures.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">5. Data Retention</h2>
              <p className="mt-2">
                We retain personal data as long as needed to provide services, comply with legal obligations, resolve
                disputes, and enforce agreements.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">6. Your Rights</h2>
              <p className="mt-2">
                Depending on applicable law, you may request access to, correction of, or deletion of your personal data.
                You may also request account closure by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">7. Contact</h2>
              <p className="mt-2">
                For privacy-related questions, contact us at{' '}
                <a href="mailto:abdullah116632@gmail.com" className="text-cyan-200 hover:text-cyan-100">
                  abdullah116632@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
