'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { IoCart, IoBook } from 'react-icons/io5';
import Navbar from '@/components/common/Navbar';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import { bookService } from '@/services/bookService';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state) => state.auth);
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);

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

  const fetchFeaturedBooks = async () => {
    try {
      setIsLoadingFeatured(true);
      const response = await bookService.getFeaturedBooks(6);
      setFeaturedBooks(response.data?.data?.books || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load featured books');
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const handleBuyNow = (book) => {
    if (!isAuthenticated || userType !== 'reader') {
      toast.error('Please login as Reader to buy books');
      handleLoginClick();
      return;
    }

    toast.success(`Purchase flow for \"${book.title}\" will be added next`);
  };

  const handleReadFewPages = (book) => {
    if (!book?._id) {
      toast.error('Preview is not available for this book');
      return;
    }

    const encodedTitle = encodeURIComponent(book.title || 'Book Preview');
    router.push(`/preview/${book._id}?title=${encodedTitle}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onEditProfile={handleEditProfile}
        onUpdatePassword={handleUpdatePassword}
        onChangeEmail={handleChangeEmail}
      />

      <main className="flex-1">
        <section className="relative mx-auto mt-2 mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/12 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30 backdrop-blur-md sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">Featured Books</h2>
                <p className="mt-1 text-sm text-slate-300">Discover highlighted titles from our marketplace.</p>
              </div>
            </div>

            {isLoadingFeatured ? (
              <div className="py-12 text-center text-slate-300">Loading featured books...</div>
            ) : featuredBooks.length === 0 ? (
              <div className="py-12 text-center text-slate-300">No featured books available yet.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {featuredBooks.map((book, index) => (
                  <motion.div
                    key={book._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.25 }}
                    className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]"
                  >
                    <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-md shadow-slate-900/20">
                      <div className="h-60 overflow-hidden bg-slate-950">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-3 p-4">
                        <h3 className="line-clamp-2 text-base font-bold text-white">{book.title}</h3>
                        <p className="text-sm text-slate-300">{book.author}</p>
                        <p className="text-sm font-semibold text-cyan-200">৳{Number(book.price || 0).toFixed(2)}</p>

                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 border-cyan-200/40 bg-white/5 text-cyan-100 hover:bg-white/10"
                            onClick={() => handleReadFewPages(book)}
                          >
                            <IoBook className="text-sm" />
                            Read Few Pages
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1 gap-1.5"
                            onClick={() => handleBuyNow(book)}
                          >
                            <IoCart />
                            Buy
                          </Button>
                        </div>
                      </div>
                    </article>

                    <aside className="rounded-2xl border border-cyan-200/20 bg-slate-900/55 p-5 backdrop-blur-md">
                      <h3 className="mt-2 text-lg font-bold text-white">About This Book</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-200/95">
                        {book.description || 'No description available for this featured book yet.'}
                      </p>
                    </aside>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <HeroSection
          onSignupClick={handleSignupClick}
          onLoginClick={handleLoginClick}
        />
      </main>

      <Footer />

      <AuthDrawer
        isOpen={authDrawerOpen}
        onClose={() => setAuthDrawerOpen(false)}
        initialUserType={authUserType}
        initialFormType={authFormType}
      />
    </div>
  );
}
