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
  const { t } = useTranslation();
  const isReaderLoggedIn = isAuthenticated && userType === 'reader';

  const fetchPurchasedBooks = async () => {
    try {
      setLoading(true);
      const response = await purchaseService.getMyPurchasedBooks();
      setBooks(response.data?.data?.books || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load purchased books');
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
      toast.error('Book file is not available right now');
      return;
    }

    const encodedTitle = encodeURIComponent(book.title || 'Book Reader');
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

      <main className="relative flex-1 overflow-hidden bg-transparent pt-8 pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-90 bg-linear-to-b from-slate-900 via-slate-800 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => router.push('/')}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-cyan-100 transition-colors hover:text-white"
          >
            <IoArrowBack /> {t('myBooks.backToHome')}
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-linear-to-br from-teal-600 to-cyan-600 p-3">
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
            className="rounded-3xl border border-white/12 bg-slate-900/62 px-8 py-16 text-center shadow-lg shadow-slate-900/35 backdrop-blur-md"
          >
            <IoBook className="mx-auto mb-4 text-5xl text-slate-300" />
            <h2 className="mb-2 text-xl font-bold text-white">To see your book, first login</h2>
            <p className="mb-6 text-slate-300">Please login with a reader account to access your purchased books.</p>
            <Button
              variant="primary"
              onClick={handleLoginClick}
            >
              Login
            </Button>
          </motion.div>
        ) : loading ? (
          <div className="rounded-3xl border border-white/12 bg-slate-900/62 px-8 py-16 text-center shadow-lg shadow-slate-900/35 backdrop-blur-md">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-cyan-300" />
            <p className="mt-4 text-slate-300">Loading purchased books...</p>
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
                className="group overflow-hidden rounded-2xl border border-white/12 bg-slate-900/62 shadow-lg shadow-slate-900/35 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-slate-900/72 hover:shadow-2xl"
              >
                {/* Book Cover */}
                <div className="relative h-64 overflow-hidden bg-slate-950">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                      {book.isUnlocked ? 'Unlocked' : 'Under Verify'}
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-slate-300/95">
                    <span>৳{Number(book.price || 0).toFixed(2)}</span>
                    <span>
                      {new Date(book.purchasedOn).toLocaleDateString('en-US', {
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
                      <span className="hidden sm:inline">{t('myBooks.read')}</span>
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
            className="rounded-3xl border border-white/12 bg-slate-900/62 px-8 py-16 text-center shadow-lg shadow-slate-900/35 backdrop-blur-md"
          >
            <IoBook className="mx-auto mb-4 text-5xl text-slate-300" />
            <h2 className="mb-2 text-xl font-bold text-white">You dont buyed any book</h2>
            <p className="mb-6 text-slate-300">Buy books from the store and they will appear here.</p>
            <Button
              variant="primary"
              onClick={() => router.push('/')}
            >
              {t('myBooks.browseBooks')}
            </Button>
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
          <div className="w-full max-w-md rounded-2xl border border-amber-300/45 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-200">Purchase Verification</h3>
            <p className="mt-3 text-sm text-slate-200">
              your purches for this book is under verification it will unlock very soon after check within 1 hour
            </p>
            <div className="mt-5 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setShowVerifyModal(false)}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
