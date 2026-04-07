'use client';

import { Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import { API_BASE_URL } from '@/constants/api';
import { useTranslation } from '@/hooks/useTranslation';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

function BookPreviewContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [totalBookPages, setTotalBookPages] = useState(0);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewWaitMessageIndex, setPreviewWaitMessageIndex] = useState(0);
  const { language } = useTranslation();
  const isBn = language === 'bn';

  const previewWaitMessages = isBn
    ? [
        'প্রিভিউ ইঞ্জিন প্রস্তুত করা হচ্ছে...',
        'নিরাপদ প্রিভিউ পেজ আনা হচ্ছে...',
        'পেজ স্ন্যাপশট রেন্ডার করা হচ্ছে...',
        'আরও স্মুথ রিডিংয়ের জন্য অপ্টিমাইজ করা হচ্ছে...',
        'প্রায় শেষ। আপনার প্রিভিউ খুলছে...',
      ]
    : [
        'Warming up the preview engine...',
        'Fetching secure preview pages...',
        'Rendering page snapshots...',
        'Optimizing quality for smoother reading...',
        'Almost done. Your preview is opening...',
      ];

  const bookId = params?.id;
  const bookTitle = searchParams.get('title') || 'Book Preview';

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

  useEffect(() => {
    if (!bookId) return;

    const workingApiBaseUrl = typeof window !== 'undefined'
      ? localStorage.getItem('apiBaseUrl') || API_BASE_URL
      : API_BASE_URL;

    setPreviewUrl(`${workingApiBaseUrl}/books/${bookId}/preview?pages=7`);

    const loadBookDetails = async () => {
      try {
        const response = await fetch(`${workingApiBaseUrl}/books/${bookId}`, { credentials: 'include' });
        if (!response.ok) return;

        const payload = await response.json();
        const pages = Number(payload?.data?.book?.pages || 0);
        setTotalBookPages(Number.isNaN(pages) ? 0 : pages);
      } catch (error) {
        setTotalBookPages(0);
      }
    };

    loadBookDetails();
  }, [bookId]);

  useEffect(() => {
    if (!previewUrl) return;

    let isMounted = true;

    const loadPreviewPages = async () => {
      try {
        setIsLoadingPreview(true);
        setPreviewError('');
        setPreviewImages([]);

        const response = await fetch(previewUrl, { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Unable to load preview PDF');
        }

        const pdfData = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

        const renderedPages = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          // eslint-disable-next-line no-await-in-loop
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.25 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // eslint-disable-next-line no-await-in-loop
          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          renderedPages.push(canvas.toDataURL('image/png'));
        }

        if (isMounted) {
          setPreviewImages(renderedPages);
        }
      } catch (error) {
        if (isMounted) {
          setPreviewError('Preview unavailable for this book right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    };

    loadPreviewPages();

    return () => {
      isMounted = false;
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isLoadingPreview) {
      setPreviewWaitMessageIndex(0);
      return undefined;
    }

    const intervalId = setInterval(() => {
      setPreviewWaitMessageIndex((current) => (current + 1) % previewWaitMessages.length);
    }, 1700);

    return () => clearInterval(intervalId);
  }, [isLoadingPreview, previewWaitMessages.length]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onEditProfile={handleEditProfile}
        onUpdatePassword={handleUpdatePassword}
        onChangeEmail={handleChangeEmail}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-0 pb-0 pt-2 sm:px-6 sm:pb-10 lg:px-8">
        <div className="grid gap-4 sm:gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <div className="order-2 overflow-hidden bg-white lg:order-2 lg:rounded-2xl lg:border lg:border-white/12 lg:shadow-lg">
          {isLoadingPreview && (
            <div className="flex min-h-[calc(100vh-5.25rem)] items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-6 py-12 text-center sm:min-h-[70vh]">
              <div className="w-full max-w-md rounded-3xl border border-cyan-200/25 bg-linear-to-b from-white/15 to-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-md">
                <div className="relative mx-auto mb-6 h-20 w-20">
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-200" />
                  <div className="absolute inset-2 animate-pulse rounded-full border border-cyan-200/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-9 w-9 rounded-lg bg-cyan-300/20 shadow-inner shadow-cyan-200/20" />
                  </div>
                </div>

                <div className="mx-auto mb-5 flex w-28 items-end justify-center gap-1.5">
                  <span className="h-8 w-2 animate-pulse rounded bg-cyan-200/80 [animation-delay:-0.3s]" />
                  <span className="h-11 w-2 animate-pulse rounded bg-cyan-300/90 [animation-delay:-0.15s]" />
                  <span className="h-14 w-2 animate-pulse rounded bg-cyan-100 [animation-delay:0s]" />
                  <span className="h-11 w-2 animate-pulse rounded bg-cyan-300/90 [animation-delay:0.15s]" />
                  <span className="h-8 w-2 animate-pulse rounded bg-cyan-200/80 [animation-delay:0.3s]" />
                </div>

                <h2 className="text-xl font-bold tracking-tight text-white">{isBn ? 'আপনার প্রিভিউ প্রস্তুত হচ্ছে' : 'Preparing your preview'}</h2>
                <div className="mt-2 min-h-11">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={previewWaitMessages[previewWaitMessageIndex]}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                      className="text-sm leading-relaxed text-cyan-100/90"
                    >
                      {previewWaitMessages[previewWaitMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mt-6 overflow-hidden rounded-full bg-white/10">
                  <div className="h-1.5 w-1/2 animate-pulse rounded-full bg-linear-to-r from-cyan-200 via-cyan-300 to-blue-300" />
                </div>
              </div>
            </div>
          )}

          {!isLoadingPreview && previewError && (
            <div className="flex min-h-[calc(100vh-5.25rem)] items-center justify-center p-8 text-center text-rose-600 sm:min-h-[70vh]">{previewError}</div>
          )}

          {!isLoadingPreview && !previewError && previewImages.length > 0 && (
            <div className="h-[calc(100vh-5.25rem)] space-y-3 overflow-auto bg-slate-100 p-0 sm:h-[78vh] sm:space-y-4 sm:p-4">
              {previewImages.map((imageSrc, index) => (
                <div key={`${index + 1}`} className="bg-white p-0 sm:rounded-lg sm:border sm:border-slate-300 sm:p-2 sm:shadow-sm">
                  <p className="mb-2 px-2 pt-2 text-xs font-semibold text-slate-500 sm:px-0 sm:pt-0">Page {index + 1}</p>
                  <img
                    src={imageSrc}
                    alt={`Preview page ${index + 1}`}
                    className="w-full rounded"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          )}
          </div>

          <aside className="order-1 mx-3 rounded-2xl border border-white/12 bg-slate-900/60 p-4 backdrop-blur-md sm:mx-0 lg:order-1 lg:sticky lg:top-24">
            <div className="text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-cyan-200">Read Few Pages</p>
              <h1 className="mt-1 text-xl font-bold text-white wrap-break-word">{bookTitle || 'Book Preview'}</h1>
              <p className="text-sm text-slate-300">Preview is limited to first 7 pages.</p>
              <p className="mt-2 text-sm font-medium text-cyan-100">Total Pages: {totalBookPages || '-'}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </aside>
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

export default function BookPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <BookPreviewContent />
    </Suspense>
  );
}
