'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { IoCart, IoEye, IoFlash, IoShieldCheckmark, IoSparkles } from 'react-icons/io5';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { bookService } from '@/services/bookService';

export default function BooksPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { language } = useTranslation();

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);

  const featuredBooks = books.filter((book) => book.isFeatured);
  const otherBooks = books.filter((book) => !book.isFeatured);

  const isBn = language === 'bn';
  const text = isBn
    ? {
        readerCatalog: 'রিডার ক্যাটালগ',
        discoverBooks: 'বই আবিষ্কার করুন',
        booksSubtitle: 'ফিচার্ড ও নতুন বই দেখুন, দ্রুত প্রিভিউ ও ক্রয় করুন।',
        totalBooks: 'মোট বই',
        loadingBooks: 'বই লোড হচ্ছে...',
        noBooks: 'এখনও কোনো বই পাওয়া যায়নি।',
        featuredBooks: 'ফিচার্ড বই',
        featuredBadge: 'ফিচার্ড',
        preview: 'প্রিভিউ',
        buy: 'কিনুন',
        aboutThisBook: 'এই বই সম্পর্কে',
        noDescription: 'এই ফিচার্ড বইটির জন্য এখনও কোনো বর্ণনা যোগ করা হয়নি।',
        secureAccessTitle: 'নিরাপদ অ্যাক্সেস',
        secureAccessDesc: 'আপনার কেনা বইগুলো Active Book-এ স্ট্যাটাসসহ দেখা যাবে।',
        quickPreviewTitle: 'দ্রুত প্রিভিউ',
        quickPreviewDesc: 'কিনার আগে কয়েক পৃষ্ঠা দেখে সঠিক বই বেছে নিন।',
        curatedPicksTitle: 'বাছাইকৃত বই',
        curatedPicksDesc: 'ফিচার্ড বইগুলো মান ও পাঠকের চাহিদার ভিত্তিতে বাছাই করা।',
        otherBooks: 'অন্যান্য বই',
        buyUnavailable: 'এই বইটি এখন কিনতে পাওয়া যাচ্ছে না',
        previewUnavailable: 'এই বইটির প্রিভিউ এখন পাওয়া যাচ্ছে না',
        loadFailed: 'বই লোড করা যায়নি',
      }
    : {
        readerCatalog: 'Reader Catalog',
        discoverBooks: 'Discover Books',
        booksSubtitle: 'Explore featured and latest books with quick preview and purchase actions.',
        totalBooks: 'Total Books',
        loadingBooks: 'Loading books...',
        noBooks: 'No books available yet.',
        featuredBooks: 'Featured Books',
        featuredBadge: 'Featured',
        preview: 'Preview',
        buy: 'Buy',
        aboutThisBook: 'About This Book',
        noDescription: 'No description available for this featured book yet.',
        secureAccessTitle: 'Secure Access',
        secureAccessDesc: 'Your purchased books remain available inside Active Book with status visibility.',
        quickPreviewTitle: 'Quick Preview',
        quickPreviewDesc: 'Check preview pages before buying to choose the right book confidently.',
        curatedPicksTitle: 'Curated Picks',
        curatedPicksDesc: 'Featured books are selected to highlight quality and reader demand.',
        otherBooks: 'Other Books',
        buyUnavailable: 'Book is not available for purchase right now',
        previewUnavailable: 'Preview is not available for this book',
        loadFailed: 'Failed to load books',
      };

  useEffect(() => {
    const fetchPublicBooks = async () => {
      try {
        setIsLoadingBooks(true);
        const response = await bookService.getPublicBooks(200);
        setBooks(response.data?.data?.books || []);
      } catch (error) {
        toast.error(error.response?.data?.message || text.loadFailed);
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
      toast.error(text.buyUnavailable);
      return;
    }

    router.push(`/purchase/${book._id}`);
  };

  const handlePreview = (book) => {
    if (!book?._id) {
      toast.error(text.previewUnavailable);
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

      <main className="relative flex-1 overflow-hidden bg-transparent pb-16 pt-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-90 bg-linear-to-b from-slate-950 via-slate-900 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-white/55 bg-white/65 p-6 shadow-xl shadow-slate-300/25 backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/60 bg-cyan-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-900">
                  <IoSparkles /> {text.readerCatalog}
                </div>
                <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{text.discoverBooks}</h1>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">{text.booksSubtitle}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700">
                {text.totalBooks}: <span className="font-bold text-slate-900">{books.length}</span>
              </div>
            </div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-8 space-y-8"
          >
            {isLoadingBooks ? (
              <div className="py-8 text-center text-slate-300">{text.loadingBooks}</div>
            ) : books.length === 0 ? (
              <div className="py-8 text-center text-slate-300">{text.noBooks}</div>
            ) : (
              <>
                {featuredBooks.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">{text.featuredBooks}</h2>
                    <div className="grid grid-cols-1 gap-6">
                      {featuredBooks.map((book) => (
                        <div
                          key={book._id}
                          className="overflow-hidden rounded-2xl border border-white/12 bg-slate-900/62 shadow-lg shadow-slate-900/35"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr]">
                            <article className="group border-b border-white/10 p-5 lg:border-r lg:border-b-0">
                              <div className="relative h-64 overflow-hidden rounded-xl bg-slate-950">
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/15 transition-all duration-300 group-hover:bg-black/30" />
                                <span className="absolute bottom-3 left-3 inline-block rounded-full border border-amber-300/50 bg-amber-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                                  {text.featuredBadge}
                                </span>
                              </div>

                              <div className="mt-4 space-y-3">
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
                                    {text.preview}
                                  </Button>
                                  <Button variant="primary" size="sm" className="flex-1 gap-1.5" onClick={() => handleBuyNow(book)}>
                                    <IoCart className="text-sm" />
                                    {text.buy}
                                  </Button>
                                </div>
                              </div>
                            </article>

                            <aside className="p-5 lg:p-6">
                              <h3 className="text-lg font-bold text-white">{text.aboutThisBook}</h3>
                              <p className="mt-3 text-sm leading-relaxed text-slate-200/95 lg:text-base">
                                {book.description || text.noDescription}
                              </p>
                            </aside>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {featuredBooks.length > 0 && (
                  <section className="rounded-3xl border border-cyan-200/30 bg-linear-to-r from-slate-900/80 via-slate-800/75 to-cyan-900/70 p-6 shadow-lg shadow-slate-900/30 sm:p-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-emerald-200/35 bg-emerald-500/8 p-4">
                        <div className="flex items-center gap-2 text-emerald-200">
                          <IoShieldCheckmark />
                          <p className="text-sm font-semibold">{text.secureAccessTitle}</p>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">{text.secureAccessDesc}</p>
                      </div>

                      <div className="rounded-2xl border border-cyan-200/35 bg-cyan-500/8 p-4">
                        <div className="flex items-center gap-2 text-cyan-200">
                          <IoFlash />
                          <p className="text-sm font-semibold">{text.quickPreviewTitle}</p>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">{text.quickPreviewDesc}</p>
                      </div>

                      <div className="rounded-2xl border border-amber-200/35 bg-amber-500/8 p-4">
                        <div className="flex items-center gap-2 text-amber-200">
                          <IoSparkles />
                          <p className="text-sm font-semibold">{text.curatedPicksTitle}</p>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">{text.curatedPicksDesc}</p>
                      </div>
                    </div>
                  </section>
                )}

                {otherBooks.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">{text.otherBooks}</h2>
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
                                {text.preview}
                              </Button>
                              <Button variant="primary" size="sm" className="flex-1 gap-1.5" onClick={() => handleBuyNow(book)}>
                                <IoCart className="text-sm" />
                                {text.buy}
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
