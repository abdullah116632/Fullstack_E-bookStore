'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { IoBook, IoArrowBack, IoEye } from 'react-icons/io5';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { purchaseService } from '@/services/purchaseService';

export default function ActiveBooksPage() {
  const router = useRouter();
  const { isAuthenticated, user, userType } = useSelector((state) => state.auth);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');
  const [isChecking, setIsChecking] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const { t, language } = useTranslation();
  const isBn = language === 'bn';
  const isReaderLoggedIn = isAuthenticated && userType === 'reader';

  const isBookVisible = (book) => {
    if (!book) return false;
    if (book.visibility === 'private' || book.visibility === false) return false;
    if (book.isVisible === false) return false;
    return true;
  };

  const text = isBn
    ? {
        loadFailed: 'কেনা বই লোড করা যায়নি',
        fileUnavailable: 'এই মুহূর্তে বই ফাইল পাওয়া যাচ্ছে না',
        readerFallbackTitle: 'বুক রিডার',
        loginPromptTitle: 'বই দেখতে হলে আগে লগইন করুন',
        loginPromptDesc: 'আপনার কেনা বই দেখতে রিডার অ্যাকাউন্ট দিয়ে লগইন করুন।',
        loginCta: 'লগইন',
        loadingBooks: 'কেনা বইগুলো লোড হচ্ছে...',
        unlocked: 'আনলকড',
        underVerify: 'ভেরিফিকেশনে',
        emptyTitle: 'এখনও কোনো বই কেনা হয়নি',
        emptyDesc: 'স্টোর থেকে বই কিনুন, এখানে আপনার লাইব্রেরিতে দেখাবে।',
        verifyTitle: 'পারচেজ ভেরিফিকেশন',
        verifyMessage: 'এই বইয়ের জন্য আপনার পারচেজ ভেরিফিকেশনে আছে। সর্বোচ্চ ১ ঘণ্টার মধ্যে এটি আনলক হবে।',
        ok: 'ঠিক আছে',
      }
    : {
        loadFailed: 'Failed to load purchased books',
        fileUnavailable: 'Book file is not available right now',
        readerFallbackTitle: 'Book Reader',
        loginPromptTitle: 'To see your book, first login',
        loginPromptDesc: 'Please login with a reader account to access your purchased books.',
        loginCta: 'Login',
        loadingBooks: 'Loading purchased books...',
        unlocked: 'Unlocked',
        underVerify: 'Under Verify',
        emptyTitle: 'You have not bought any book yet',
        emptyDesc: 'Buy books from the store and they will appear here.',
        verifyTitle: 'Purchase Verification',
        verifyMessage: 'Your purchase for this book is under verification. It will be unlocked very soon (within 1 hour).',
        ok: 'OK',
      };

  const fetchPurchasedBooks = async () => {
    try {
      setLoading(true);
      const response = await purchaseService.getMyPurchasedBooks();
      const purchasedBooks = response.data?.data?.books || [];
      setBooks(purchasedBooks.filter(isBookVisible));
    } catch (error) {
      toast.error(error.response?.data?.message || text.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    // Check if user data exists in Redux or localStorage
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        
        // First check Redux state
        if (isAuthenticated && userType === 'reader') {
          await fetchPurchasedBooks();
          setIsChecking(false);
          return;
        }

        // Then check localStorage
        const authToken = localStorage.getItem('authToken');
        const storedUserType = localStorage.getItem('userType');
        
        if (authToken && storedUserType === 'reader') {
          // Auth exists in localStorage, it will be restored
          await fetchPurchasedBooks();
          setIsChecking(false);
          return;
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, userType]);

  const handleLoginClick = () => {
    setAuthUserType('reader');
    setAuthFormType('login');
    setAuthDrawerOpen(true);
  };

  const handleSignupClick = () => {
    setAuthUserType('reader');
    setAuthFormType('signup');
    setAuthDrawerOpen(true);
  };

  const handleEditProfile = () => {
    setAuthFormType('updateProfile');
    setAuthDrawerOpen(true);
  };

  const handleUpdatePassword = () => {
    setAuthFormType('updatePassword');
    setAuthDrawerOpen(true);
  };

  const handleChangeEmail = () => {
    setAuthFormType('changeEmail');
    setAuthDrawerOpen(true);
  };

  const handleReadBook = (book) => {
    if (!book?.isUnlocked) {
      setShowVerifyModal(true);
      return;
    }

    if (!book?.fileUrl) {
      toast.error(text.fileUnavailable);
      return;
    }

    const encodedTitle = encodeURIComponent(book.title || text.readerFallbackTitle);
    router.push(`/read/${book._id}?title=${encodedTitle}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
          onEditProfile={handleEditProfile}
          onUpdatePassword={handleUpdatePassword}
          onChangeEmail={handleChangeEmail}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-teal-600" />
            <p className="mt-4 text-slate-600">{t('common.loading')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onEditProfile={handleEditProfile}
        onUpdatePassword={handleUpdatePassword}
        onChangeEmail={handleChangeEmail}
      />

      <main className="relative flex-1 overflow-hidden pt-4 pb-16 sm:pt-6">
        <div className="mx-3 max-w-7xl overflow-hidden rounded-2xl bg-linear-to-b from-[#13110E] via-[#1F1A14] to-[#2B241B] px-4 py-6 shadow-2xl shadow-black/55 sm:mx-auto sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 sm:mb-9"
        >
          <button
            onClick={() => router.push('/')}
            className="group mb-4 inline-flex items-center gap-2 rounded-full border border-amber-100/45 bg-amber-200/12 px-4 py-2 text-sm font-semibold text-amber-50 shadow-md shadow-black/35 backdrop-blur-sm transition-all duration-300 hover:border-amber-100/80 hover:bg-amber-200/22 hover:text-white"
          >
            <IoArrowBack className="text-base transition-transform duration-300 group-hover:-translate-x-0.5" />
            {t('myBooks.backToHome')}
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-linear-to-br from-[#B98B2E] to-[#7A5A1E] p-3 shadow-lg shadow-black/40">
                <IoBook className="text-2xl text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                {t('myBooks.title')}
              </h1>
            </div>
            <p className="text-slate-200/95">
              {t('myBooks.subtitle')} {books.length} {books.length !== 1 ? t('myBooks.plural') : t('myBooks.singular')} {t('myBooks.inYourLibrary')}
            </p>
          </div>
        </motion.div>

        {/* Books Grid */}
        {!isReaderLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-amber-100/20 bg-[#13110E]/68 px-8 py-16 text-center shadow-lg shadow-black/45 backdrop-blur-md"
          >
            <IoBook className="mx-auto mb-4 text-5xl text-slate-300" />
            <h2 className="mb-2 text-xl font-bold text-white">{text.loginPromptTitle}</h2>
            <p className="mb-6 text-slate-300">{text.loginPromptDesc}</p>
            <div className="flex justify-center">
              <Button
                variant="primary"
                onClick={handleLoginClick}
              >
                {text.loginCta}
              </Button>
            </div>
          </motion.div>
        ) : loading ? (
          <div className="rounded-3xl border border-amber-100/20 bg-[#13110E]/68 px-8 py-16 text-center shadow-lg shadow-black/45 backdrop-blur-md">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-amber-300" />
            <p className="mt-4 text-slate-300">{text.loadingBooks}</p>
          </div>
        ) : books.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {books.map((book) => (
              <motion.div
                key={book._id}
                variants={itemVariants}
                className="group overflow-hidden rounded-2xl border border-amber-100/20 bg-[#13110E]/68 shadow-lg shadow-black/45 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-200/45 hover:bg-[#241E16]/78 hover:shadow-2xl"
              >
                {/* Book Cover */}
                <div className="relative h-64 overflow-hidden bg-[#13110E]/60">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 transition-all duration-300 group-hover:bg-black/35" />
                </div>

                {/* Book Info */}
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="line-clamp-2 text-sm font-bold text-white">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300/95">{book.author}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${book.isUnlocked ? 'bg-emerald-300/15 text-emerald-200 border border-emerald-300/40' : 'bg-amber-300/15 text-amber-200 border border-amber-300/40'}`}>
                      {book.isUnlocked ? text.unlocked : text.underVerify}
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-slate-300/95">
                    <span>৳{Number(book.price || 0).toFixed(2)}</span>
                    <span>
                      {new Date(book.purchasedOn).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => handleReadBook(book)}
                    >
                      <IoEye className="text-sm" />
                      <span>{t('myBooks.read')}</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-amber-100/20 bg-[#13110E]/68 px-8 py-16 text-center shadow-lg shadow-black/45 backdrop-blur-md"
          >
            <IoBook className="mx-auto mb-4 text-5xl text-slate-300" />
            <h2 className="mb-2 text-xl font-bold text-white">{text.emptyTitle}</h2>
            <p className="mb-6 text-slate-300">{text.emptyDesc}</p>
            <div className="flex justify-center">
              <Button
                variant="primary"
                onClick={() => router.push('/')}
              >
                {t('myBooks.browseBooks')}
              </Button>
            </div>
          </motion.div>
        )}
        </div>
      </main>

      <Footer />

      <AuthDrawer
        isOpen={authDrawerOpen}
        onClose={() => setAuthDrawerOpen(false)}
        initialUserType={authUserType}
        initialFormType={authFormType}
      />

      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-2xl border border-amber-300/45 bg-[#13110E] p-6 shadow-2xl shadow-black/65">
            <h3 className="text-lg font-bold text-amber-200">{text.verifyTitle}</h3>
            <p className="mt-3 text-sm text-slate-200">
              {text.verifyMessage}
            </p>
            <div className="mt-5 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setShowVerifyModal(false)}>
                {text.ok}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
