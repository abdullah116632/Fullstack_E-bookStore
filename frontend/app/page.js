'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  IoArrowForward,
  IoBook,
  IoCart,
  IoEye,
  IoFlash,
  IoShieldCheckmark,
  IoSparkles,
} from 'react-icons/io5';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import { bookService } from '@/services/bookService';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { language } = useLanguage();
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);

  const isBn = language === 'bn';
  const text = isBn
    ? {
        featuredTitle: 'ফিচার্ড বই',
        featuredSubtitle: 'প্রিভিউ এবং দ্রুত ক্রয়ের জন্য পেশাদারভাবে বাছাই করা বই।',
        viewAllBooks: 'সব বই দেখুন',
        loadingFeatured: 'ফিচার্ড বই লোড হচ্ছে...',
        noFeatured: 'এখনও কোনো ফিচার্ড বই পাওয়া যায়নি।',
        featuredBadge: 'ফিচার্ড',
        preview: 'প্রিভিউ',
        buyNow: 'এখনই কিনুন',
        noDescription: 'এই ফিচার্ড বইটির জন্য এখনও কোনো বর্ণনা যোগ করা হয়নি।',
        heroBadge: 'বাছাইকৃত ডিজিটাল লাইব্রেরি',
        heroTitle: 'আরও স্মার্টভাবে ই-বুক কিনুন ও পড়ুন।',
        heroDescription:
          'পেশাদার ও শিক্ষামূলক বই আবিষ্কার করুন, কেনার আগে প্রিভিউ দেখুন, এবং এক জায়গা থেকে আপনার অ্যাকটিভ বইগুলোতে দ্রুত প্রবেশ করুন।',
        browseBooks: 'বই ব্রাউজ করুন',
        myActiveBooks: 'আমার অ্যাকটিভ বই',
        createReader: 'রিডার অ্যাকাউন্ট তৈরি করুন',
        stat1Label: 'তাৎক্ষণিক অ্যাক্সেস',
        stat1Value: 'দ্রুত আনলক',
        stat2Label: 'বাছাইকৃত শিরোনাম',
        stat2Value: 'সেরা নির্বাচন',
        stat3Label: 'রিডার ফোকাসড',
        stat3Value: 'সহজ অভিজ্ঞতা',
        whyTitle: 'কেন রিডাররা এই প্ল্যাটফর্ম বেছে নেয়',
        why1Title: 'বিশ্বস্ত ক্রয় ট্র্যাকিং',
        why1Desc: 'আপনার সব ক্রয় Active Book তালিকায় দৃশ্যমান থাকে।',
        why2Title: 'দ্রুত পড়া শুরু',
        why2Desc: 'অপ্রয়োজনীয় ধাপ ছাড়াই ক্রয় থেকে রিডিং-এ যান।',
        why3Title: 'কেনার আগে প্রিভিউ',
        why3Desc: 'Read Few Pages দিয়ে আত্মবিশ্বাসের সাথে সিদ্ধান্ত নিন।',
        ctaBadge: 'রিডার ওয়ার্কস্পেস',
        ctaTitle: 'আজই আপনার পরের বই শুরু করুন',
        ctaDesc: 'এক জায়গা থেকে কিনুন, ট্র্যাক করুন এবং পড়ুন। Active Book-এ সব ক্রয় সুন্দরভাবে সংগঠিত থাকবে।',
        exploreCatalog: 'ক্যাটালগ দেখুন',
        openMyBooks: 'আমার বই খুলুন',
        readerLogin: 'রিডার লগইন',
        errFeatured: 'ফিচার্ড বই লোড করা যায়নি',
        errBuyUnavailable: 'এই বইটি এখন কিনতে পাওয়া যাচ্ছে না',
        errPreviewUnavailable: 'এই বইটির প্রিভিউ এখন পাওয়া যাচ্ছে না',
      }
    : {
        featuredTitle: 'Featured Books',
        featuredSubtitle: 'Professionally selected books with preview and quick purchase.',
        viewAllBooks: 'View All Books',
        loadingFeatured: 'Loading featured books...',
        noFeatured: 'No featured books available yet.',
        featuredBadge: 'Featured',
        preview: 'Preview',
        buyNow: 'Buy Now',
        noDescription: 'No description available for this featured book yet.',
        heroBadge: 'Curated Digital Library',
        heroTitle: 'Read smarter with a premium e-book buying experience.',
        heroDescription:
          'Discover professional and educational titles, preview before purchase, and access your active books instantly from one clean workspace.',
        browseBooks: 'Browse Books',
        myActiveBooks: 'My Active Books',
        createReader: 'Create Reader Account',
        stat1Label: 'Instant Access',
        stat1Value: 'Fast Unlock',
        stat2Label: 'Handpicked Titles',
        stat2Value: 'Top Picks',
        stat3Label: 'Reader Focused',
        stat3Value: 'Simple Flow',
        whyTitle: 'Why readers choose this platform',
        why1Title: 'Reliable purchase tracking',
        why1Desc: 'Every purchase stays visible in your Active Book list.',
        why2Title: 'Quick reading start',
        why2Desc: 'Jump from purchase to reading without complicated steps.',
        why3Title: 'Preview before buying',
        why3Desc: 'Use read-few-pages preview to decide confidently.',
        ctaBadge: 'Reader Workspace',
        ctaTitle: 'Start your next book today',
        ctaDesc: 'Buy, track and read from one place. Your purchases stay organized inside Active Book for faster access.',
        exploreCatalog: 'Explore Catalog',
        openMyBooks: 'Open My Books',
        readerLogin: 'Reader Login',
        errFeatured: 'Failed to load featured books',
        errBuyUnavailable: 'Book is not available for purchase right now',
        errPreviewUnavailable: 'Preview is not available for this book',
      };

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
      toast.error(error.response?.data?.message || text.errFeatured);
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const handleBuyNow = (book) => {
    if (!book?._id) {
      toast.error(text.errBuyUnavailable);
      return;
    }

    router.push(`/purchase/${book._id}`);
  };

  const handleReadFewPages = (book) => {
    if (!book?._id) {
      toast.error(text.errPreviewUnavailable);
      return;
    }

    const encodedTitle = encodeURIComponent(book.title || 'Book Preview');
    router.push(`/preview/${book._id}?title=${encodedTitle}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#edf6ff]">
      <Navbar
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onEditProfile={handleEditProfile}
        onUpdatePassword={handleUpdatePassword}
        onChangeEmail={handleChangeEmail}
      />

      <main className="flex-1 pb-20">
        <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/55 bg-slate-900/78 p-6 shadow-xl shadow-slate-900/30 backdrop-blur-md sm:p-8">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">{text.featuredTitle}</h2>
                <p className="mt-1 text-sm text-slate-300">{text.featuredSubtitle}</p>
              </div>

              <Button variant="outline" size="sm" onClick={() => router.push('/books')}>
                {text.viewAllBooks}
              </Button>
            </div>

            {isLoadingFeatured ? (
              <div className="py-12 text-center text-slate-300">{text.loadingFeatured}</div>
            ) : featuredBooks.length === 0 ? (
              <div className="py-12 text-center text-slate-300">{text.noFeatured}</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {featuredBooks.map((book, index) => (
                  <motion.div
                    key={book._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    className="group overflow-hidden rounded-2xl border border-white/12 bg-slate-900/65 shadow-lg shadow-slate-900/35"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
                      <div className="border-b border-white/10 p-5 lg:border-r lg:border-b-0">
                        <div className="relative h-62 overflow-hidden rounded-xl bg-slate-950">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-900/35 to-transparent" />
                          <div className="absolute bottom-3 left-3 rounded-full border border-cyan-200/35 bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-100">
                            {text.featuredBadge}
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="line-clamp-2 text-base font-bold text-white">{book.title}</h3>
                              <p className="mt-1 text-sm text-slate-300">{book.author}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-cyan-200">৳{Number(book.price || 0).toFixed(2)}</span>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1.5 border-cyan-200/40 bg-white/5 text-cyan-100 hover:bg-white/10"
                              onClick={() => handleReadFewPages(book)}
                            >
                              <IoEye className="text-sm" />
                              {text.preview}
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1 gap-1.5"
                              onClick={() => handleBuyNow(book)}
                            >
                              <IoCart />
                              {text.buyNow}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center p-5 lg:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200/90">About this book</p>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300/95 lg:text-base">
                          {book.description || text.noDescription}
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-xl border border-white/12 bg-slate-950/35 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Author</p>
                            <p className="mt-1 text-sm font-semibold text-slate-200">{book.author || '-'}</p>
                          </div>
                          <div className="rounded-xl border border-white/12 bg-slate-950/35 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Price</p>
                            <p className="mt-1 text-sm font-semibold text-cyan-200">৳{Number(book.price || 0).toFixed(2)}</p>
                          </div>
                          <div className="rounded-xl border border-white/12 bg-slate-950/35 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Availability</p>
                            <p className="mt-1 text-sm font-semibold text-emerald-200">Ready to buy</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="relative mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-cyan-200/18 bg-slate-900/75 shadow-2xl shadow-slate-950/45 backdrop-blur-xl">
            <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
              <div className="pointer-events-none absolute inset-0 opacity-80">
                <div className="absolute -left-20 -top-16 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
                <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-teal-400/14 blur-3xl" />
                <div className="absolute inset-x-0 top-22 h-px bg-linear-to-r from-transparent via-cyan-200/35 to-transparent" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative z-10"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100">
                  <IoSparkles /> {text.heroBadge}
                </div>

                <h1 className="mt-5 max-w-2xl text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">
                  {text.heroTitle}
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200/95 sm:text-lg">
                  {text.heroDescription}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => router.push('/books')}
                  >
                    {text.browseBooks}
                    <IoArrowForward />
                  </Button>

                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => router.push('/active-book')}
                    >
                      {text.myActiveBooks}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={handleSignupClick}
                    >
                      {text.createReader}
                    </Button>
                  )}
                </div>

                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: text.stat1Label, value: text.stat1Value },
                    { label: text.stat2Label, value: text.stat2Value },
                    { label: text.stat3Label, value: text.stat3Value },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/15 bg-slate-950/45 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                      <p className="mt-1 text-lg font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.aside
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
                className="relative z-10 rounded-3xl border border-white/15 bg-slate-950/45 p-5 shadow-lg shadow-slate-950/35"
              >
                <h2 className="text-xl font-bold text-white">{text.whyTitle}</h2>
                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/65 p-3">
                    <IoShieldCheckmark className="mt-0.5 text-xl text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{text.why1Title}</p>
                      <p className="text-xs text-slate-700">{text.why1Desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-cyan-200/70 bg-cyan-50/65 p-3">
                    <IoFlash className="mt-0.5 text-xl text-cyan-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{text.why2Title}</p>
                      <p className="text-xs text-slate-700">{text.why2Desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-3">
                    <IoBook className="mt-0.5 text-xl text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{text.why3Title}</p>
                      <p className="text-xs text-slate-700">{text.why3Desc}</p>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-cyan-200/40 bg-linear-to-r from-slate-900 via-slate-800 to-cyan-900 p-7 text-white shadow-xl shadow-slate-900/30 sm:p-10">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">{text.ctaBadge}</p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{text.ctaTitle}</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  {text.ctaDesc}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => router.push('/books')}>
                  {text.exploreCatalog}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-white bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                  onClick={isAuthenticated ? () => router.push('/active-book') : handleLoginClick}
                >
                  {isAuthenticated ? text.openMyBooks : text.readerLogin}
                </Button>
              </div>
            </div>
          </div>
        </section>
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
