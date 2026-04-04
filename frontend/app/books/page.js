'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { IoCart, IoEye } from 'react-icons/io5';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { bookService } from '@/services/bookService';

export default function BooksPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);

  const featuredBooks = books.filter((book) => book.isFeatured);
  const otherBooks = books.filter((book) => !book.isFeatured);

  useEffect(() => {
    const fetchPublicBooks = async () => {
      try {
        setIsLoadingBooks(true);
        const response = await bookService.getPublicBooks(200);
        setBooks(response.data?.data?.books || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load books');
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchPublicBooks();
  }, []);

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

  const handleBuyNow = (book) => {
    if (!book?._id) {
      toast.error('Book is not available for purchase right now');
      return;
    }

    router.push(`/purchase/${book._id}`);
  };

  const handlePreview = (book) => {
    if (!book?._id) {
      toast.error('Preview is not available for this book');
      return;
    }

    const encodedTitle = encodeURIComponent(book.title || 'Book Preview');
    router.push(`/preview/${book._id}?title=${encodedTitle}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onEditProfile={handleEditProfile}
        onUpdatePassword={handleUpdatePassword}
        onChangeEmail={handleChangeEmail}
      />

      <main className="relative flex-1 overflow-hidden bg-transparent pt-8 pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-90 bg-linear-to-b from-slate-950 via-slate-900 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-8 space-y-8"
          >
            {isLoadingBooks ? (
              <div className="py-8 text-center text-slate-300">Loading books...</div>
            ) : books.length === 0 ? (
              <div className="py-8 text-center text-slate-300">No books available yet.</div>
            ) : (
              <>
                {featuredBooks.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Featured Books</h2>
                    <div className="grid grid-cols-1 gap-6">
                      {featuredBooks.map((book) => (
                        <div
                          key={book._id}
                          className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]"
                        >
                          <article className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/58 shadow-lg shadow-slate-900/35 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-slate-900/70">
                            <div className="relative h-64 overflow-hidden bg-slate-950">
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/15 transition-all duration-300 group-hover:bg-black/30" />
                            </div>

                            <div className="space-y-3 p-4">
                              <div>
                                <h3 className="line-clamp-2 text-sm font-bold text-white">{book.title}</h3>
                                <p className="mt-1 text-xs text-slate-300">{book.author}</p>
                                <span className="mt-1 inline-block rounded-full border border-amber-300/50 bg-amber-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                                  Featured
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-base font-bold text-cyan-200">৳{Number(book.price || 0).toFixed(2)}</span>
                              </div>

                              <div className="flex gap-2 pt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 gap-1.5 border-cyan-200/40 bg-white/5 text-cyan-100 hover:bg-white/10"
                                  onClick={() => handlePreview(book)}
                                >
                                  <IoEye className="text-sm" />
                                  Preview
                                </Button>
                                <Button variant="primary" size="sm" className="flex-1 gap-1.5" onClick={() => handleBuyNow(book)}>
                                  <IoCart className="text-sm" />
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
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {otherBooks.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Other Books</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {otherBooks.map((book) => (
                        <article
                          key={book._id}
                          className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/58 shadow-lg shadow-slate-900/35 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-slate-900/70"
                        >
                          <div className="relative h-64 overflow-hidden bg-slate-950">
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/15 transition-all duration-300 group-hover:bg-black/30" />
                          </div>

                          <div className="space-y-3 p-4">
                            <div>
                              <h3 className="line-clamp-2 text-sm font-bold text-white">{book.title}</h3>
                              <p className="mt-1 text-xs text-slate-300">{book.author}</p>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-cyan-200">৳{Number(book.price || 0).toFixed(2)}</span>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-1.5 border-cyan-200/40 bg-white/5 text-cyan-100 hover:bg-white/10"
                                onClick={() => handlePreview(book)}
                              >
                                <IoEye className="text-sm" />
                                Preview
                              </Button>
                              <Button variant="primary" size="sm" className="flex-1 gap-1.5" onClick={() => handleBuyNow(book)}>
                                <IoCart className="text-sm" />
                                Buy
                              </Button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </motion.section>
        </div>
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
