import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="flex-1 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl rounded-3xl border border-white/55 bg-slate-900/78 p-6 text-slate-200 shadow-xl shadow-slate-900/30 backdrop-blur-md sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">Legal</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-slate-400">Effective date: April 6, 2026</p>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-300 sm:text-base">
            <section>
              <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing or using this e-book marketplace, you agree to follow these Terms of Service and all applicable
                laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">2. User Accounts</h2>
              <p className="mt-2">
                You are responsible for maintaining the confidentiality of your account credentials and for activities that
                occur under your account. You must provide accurate account information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">3. Purchases and Access</h2>
              <p className="mt-2">
                Readers may purchase eligible books and access them according to platform policies. Access may be suspended
                or revoked for fraud, abuse, or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">4. Publisher Responsibilities</h2>
              <p className="mt-2">
                Publishers are responsible for ensuring they have the rights to upload and distribute content and that their
                submissions comply with legal and platform standards.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">5. Prohibited Conduct</h2>
              <p className="mt-2">
                You may not misuse the platform, attempt unauthorized access, distribute malicious content, infringe
                intellectual property rights, or interfere with normal service operation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">6. Disclaimer and Limitation</h2>
              <p className="mt-2">
                Services are provided on an "as is" and "as available" basis. To the maximum extent permitted by law, we
                disclaim warranties and limit liability for indirect or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">7. Changes to Terms</h2>
              <p className="mt-2">
                We may update these terms from time to time. Continued use of the platform after updates means you accept the
                revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">8. Contact</h2>
              <p className="mt-2">
                For questions about these terms, contact us at{' '}
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
