'use client';

import Link from 'next/link';
import { FaBook, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { IoArrowForward } from 'react-icons/io5';
import { useTranslation } from '@/hooks/useTranslation';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="mt-14 px-3 pb-3 sm:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/60 bg-slate-900/90 text-slate-200 shadow-2xl shadow-slate-900/35 backdrop-blur-xl">
        <div className="relative px-5 py-12 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 opacity-90">
            <div className="absolute -left-16 top-0 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute right-0 top-8 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-200/45 to-transparent" />
          </div>

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-linear-to-br from-teal-500 to-cyan-500 p-3 shadow-lg shadow-cyan-500/25">
                  <FaBook className="text-lg text-white" />
                </div>
                <div>
                  <span className="bg-linear-to-r from-white to-cyan-100 bg-clip-text text-xl font-bold text-transparent">{t('footer.brandName')}</span>
                  <p className="text-xs text-slate-400">{t('footer.brandSubtitle')}</p>
                </div>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-slate-300/95">{t('footer.description')}</p>

              <div className="rounded-2xl border border-cyan-300/25 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Reader Note</p>
                <p className="mt-1 text-sm text-slate-300/95">Browse featured books, preview quickly, and keep all purchases organized in your library.</p>
                <Link href="/books" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-200 transition-colors hover:text-white">
                  Explore Books <IoArrowForward className="text-xs" />
                </Link>
              </div>

              <div className="flex gap-3 pt-1">
                <a href="https://www.facebook.com/profile.php?id=61577502346618" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/15 bg-white/8 p-2.5 text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300/40 hover:bg-blue-400/12 hover:text-blue-200">
                  <FaFacebook size={18} />
                </a>
                <a href="#" className="rounded-lg border border-white/15 bg-white/8 p-2.5 text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-sky-400/12 hover:text-sky-200">
                  <FaTwitter size={18} />
                </a>
                <a href="#" className="rounded-lg border border-white/15 bg-white/8 p-2.5 text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-300/40 hover:bg-pink-400/12 hover:text-pink-200">
                  <FaInstagram size={18} />
                </a>
                <a href="https://www.linkedin.com/in/abdullah116632/" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/15 bg-white/8 p-2.5 text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-300/40 hover:bg-teal-400/12 hover:text-teal-200">
                  <FaLinkedin size={18} />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">{t('footer.forReaders')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/books" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.browseBooks')}
                  </Link>
                </li>
                <li>
                  <Link href="/active-book" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.myLibrary')}
                  </Link>
                </li>
                <li>
                  <Link href="/books" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.recommendations')}
                  </Link>
                </li>
                <li>
                  <Link href="/books" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.reviews')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">{t('footer.forPublishers')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/publisher" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.publishBook')}
                  </Link>
                </li>
                <li>
                  <Link href="/publisher" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.dashboard')}
                  </Link>
                </li>
                <li>
                  <Link href="/publisher" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.analytics')}
                  </Link>
                </li>
                <li>
                  <Link href="/publisher" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.support')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">{t('footer.company')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about-us" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.aboutUs')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.contact')}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.privacyPolicy')}
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="font-medium text-slate-300 transition-colors duration-300 hover:text-cyan-200">
                    {t('footer.termsOfService')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative mt-10 border-t border-white/15 pt-6">
            <div className="grid grid-cols-1 gap-5 text-sm md:grid-cols-3 md:items-center">
              <p className="text-slate-300">© {currentYear} {t('footer.copyright')}</p>
              <p className="text-slate-300 md:text-center">
                {t('footer.madeWith')} <span className="text-rose-400">❤</span> {t('footer.forBookLovers')}
              </p>
              <p className="md:text-right">
                <span className="bg-linear-to-r from-cyan-200 to-teal-200 bg-clip-text font-semibold text-transparent">{t('footer.version')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
