'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoMenu, IoClose, IoLogOut } from 'react-icons/io5';
import { FaBook } from 'react-icons/fa';
import Button from '@/components/common/Button';
import ProfileDropdown from '@/components/common/ProfileDropdown';
import { logout } from '@/store/slices/authSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar({ 
  onLoginClick, 
  onSignupClick, 
  onEditProfile, 
  onUpdatePassword,
  onChangeEmail
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, userType } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();

  const isActivePath = (href) => pathname === href || pathname?.startsWith(`${href}/`);

  const desktopLinkClass = (href) => {
    const isActive = isActivePath(href);
    return [
      'rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300',
      isActive
        ? 'border-amber-400 bg-linear-to-r from-amber-200 to-rose-200 text-rose-900 shadow-md shadow-amber-300/45'
        : 'border-transparent bg-white/70 text-slate-700 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100/75 hover:text-rose-800',
    ].join(' ');
  };

  const mobileLinkClass = (href) => {
    const isActive = isActivePath(href);
    return [
      'mb-3 block rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-300',
      isActive
        ? 'bg-linear-to-r from-amber-200 to-rose-200 text-rose-900 ring-1 ring-amber-400'
        : 'text-slate-700 hover:bg-amber-100 hover:text-rose-800',
    ].join(' ');
  };

  const handleLogout = () => {
    sessionStorage.setItem('intentionalLogout', '1');
    dispatch(logout());
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-2xl border border-emerald-200/70 bg-linear-to-r from-teal-50/90 via-emerald-50/90 to-lime-50/90 px-4 shadow-lg shadow-emerald-200/35 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="rounded-xl bg-linear-to-br from-teal-600 to-cyan-600 p-2.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-teal-500/30">
              <FaBook className="text-white text-xl" />
            </div>
            <div className="block">
              <div className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-[11px] font-bold text-transparent sm:text-xl">
                {language === 'bn' ? 'অক্ষরবাড়ি' : 'Okkhorbari'}
              </div>
              <div className="text-[9px] font-medium text-slate-500 sm:text-xs">
                {language === 'bn' ? 'ডিজিটাল পাঠশালা' : 'Digital Book Hub'}
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/books"
              className={desktopLinkClass('/books')}
            >
              {t('nav.allBooks')}
            </Link>

            <Link
              href="/active-book"
              className={desktopLinkClass('/active-book')}
            >
              {t('nav.yourBooks')}
            </Link>

            {isAuthenticated ? (
              <>
                <ProfileDropdown 
                  onEditProfile={onEditProfile}
                  onUpdatePassword={onUpdatePassword}
                  onChangeEmail={onChangeEmail}
                />
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoginClick}
                >
                  {t('nav.login')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onSignupClick}
                >
                  {t('nav.signup')}
                </Button>
              </>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="rounded-xl border border-emerald-300/80 bg-white/85 px-3 py-2 text-sm font-semibold text-emerald-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>

          {/* Mobile Menu Button & Language Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="rounded-xl border border-emerald-300 bg-white/85 px-2 py-2 text-xs font-semibold text-emerald-900 transition-all duration-300 hover:bg-white"
            >
              {language === 'en' ? 'বাংলা' : 'ENG'}
            </button>
            {isAuthenticated ? (
              <ProfileDropdown
                onEditProfile={onEditProfile}
                onUpdatePassword={onUpdatePassword}
                onChangeEmail={onChangeEmail}
              />
            ) : null}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-transparent p-2.5 text-emerald-900 transition-colors duration-300 hover:border-emerald-200 hover:bg-emerald-100/70"
            >
              {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="border-t border-emerald-200 py-4 md:hidden"
          >
            {isAuthenticated ? (
              <>
                <div className="my-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3.5">
                  <p className="text-sm font-bold text-slate-800">{user?.fullName}</p>
                  <p className="text-xs font-medium capitalize text-slate-500">{userType}</p>
                </div>
                <Link
                  href="/books"
                  className={mobileLinkClass('/books')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.allBooks')}
                </Link>
                <Link
                  href="/active-book"
                  className={mobileLinkClass('/active-book')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.yourBooks')}
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full gap-2"
                >
                  <IoLogOut />
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/books"
                  className={mobileLinkClass('/books')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.allBooks')}
                </Link>
                <Link
                  href="/active-book"
                  className={mobileLinkClass('/active-book')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.yourBooks')}
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mb-3"
                >
                  {t('nav.login')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    onSignupClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  {t('nav.signup')}
                </Button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
