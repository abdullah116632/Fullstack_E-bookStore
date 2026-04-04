'use client';

import Link from 'next/link';
import { FaBook, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useTranslation } from '@/hooks/useTranslation';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="mt-24 px-3 pb-3 text-slate-600 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/70 bg-white/80 px-4 py-16 shadow-xl shadow-slate-300/20 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-linear-to-br from-teal-600 to-cyan-600 p-2.5">
                <FaBook className="text-white text-lg" />
              </div>
              <div>
                <span className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-bold text-transparent">{t('nav.ebook')}</span>
                <p className="text-xs text-slate-500">{t('nav.marketplace')}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              {t('footer.description')}
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-sky-50 hover:text-sky-600">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-pink-50 hover:text-pink-600">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-teal-50 hover:text-teal-600">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Readers */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{t('footer.forReaders')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.browseBooks')}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.myLibrary')}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.recommendations')}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.reviews')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Publishers */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{t('footer.forPublishers')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.publishBook')}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.analytics')}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.support')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{t('footer.company')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  {t('footer.termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <p className="text-slate-500">
              © {currentYear} {t('footer.copyright')}
            </p>
            <p className="text-center text-slate-500 md:text-center">
              {t('footer.madeWith')} <span className="text-rose-500">❤</span> {t('footer.forBookLovers')}
            </p>
            <p className="text-slate-500 md:text-right">
              <span className="bg-linear-to-r from-teal-700 to-cyan-600 bg-clip-text font-semibold text-transparent">{t('footer.version')}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
