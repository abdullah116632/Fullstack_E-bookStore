'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import { API_BASE_URL } from '@/constants/api';
import { useTranslation } from '@/hooks/useTranslation';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

function ReaderBookContent() {
  const params = useParams();
  const router = useRouter();
  const [readUrl, setReadUrl] = useState('');
  const [bookTitle, setBookTitle] = useState('Read Book');
  const [pages, setPages] = useState([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [readError, setReadError] = useState('');
  const [desktopWidthMode, setDesktopWidthMode] = useState('medium');
  const [pageSearchValue, setPageSearchValue] = useState('1');
  const [currentPage, setCurrentPage] = useState(1);
  const [readerWaitMessageIndex, setReaderWaitMessageIndex] = useState(0);
  const readerContainerRef = useRef(null);
  const { language } = useTranslation();
  const isBn = language === 'bn';

  const readerWaitMessages = isBn
    ? [
        'আপনার কেনা বই আনলক করা হচ্ছে...',
        'নিরাপদ স্টোরেজ থেকে পেজ লোড হচ্ছে...',
        'উচ্চ মানের পেজ রেন্ডার করা হচ্ছে...',
        'স্মুথ রিডিং মোড প্রস্তুত করা হচ্ছে...',
        'শেষ ধাপ চলছে। এখনই বই খুলছে...',
      ]
    : [
        'Unlocking your purchased book...',
        'Loading pages from secure storage...',
        'Rendering high-quality pages...',
        'Setting up smooth reading mode...',
        'Final touches. Opening your book now...',
      ];

  const bookId = params?.id;

  useEffect(() => {
    if (!bookId) return;

    const workingApiBaseUrl = typeof window !== 'undefined'
      ? localStorage.getItem('apiBaseUrl') || API_BASE_URL
      : API_BASE_URL;

    setReadUrl(`${workingApiBaseUrl}/purchases/books/${bookId}/read`);

    const loadBookTitle = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const response = await fetch(`${workingApiBaseUrl}/purchases/my-books`, {
          credentials: 'include',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) return;

        const payload = await response.json();
        const matchedBook = (payload?.data?.books || []).find((book) => String(book?._id) === String(bookId));
        setBookTitle(matchedBook?.title || 'Read Book');
      } catch (error) {
        setBookTitle('Read Book');
      }
    };

    loadBookTitle();
  }, [bookId]);

  useEffect(() => {
    if (!readUrl) return;

    let isMounted = true;

    const loadPages = async () => {
      try {
        setIsLoadingPages(true);
        setReadError('');
        setPages([]);

        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const response = await fetch(readUrl, {
          credentials: 'include',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || 'Unable to load this book right now');
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
          setPages(renderedPages);
          setCurrentPage(1);
          setPageSearchValue('1');
        }
      } catch (error) {
        if (isMounted) {
          setReadError(error.message || 'Unable to load this book right now');
          toast.error(error.message || 'Unable to load this book right now');
        }
      } finally {
        if (isMounted) {
          setIsLoadingPages(false);
        }
      }
    };

    loadPages();

    return () => {
      isMounted = false;
    };
  }, [readUrl]);

  useEffect(() => {
    if (!isLoadingPages) {
      setReaderWaitMessageIndex(0);
      return undefined;
    }

    const intervalId = setInterval(() => {
      setReaderWaitMessageIndex((current) => (current + 1) % readerWaitMessages.length);
    }, 1700);

    return () => clearInterval(intervalId);
  }, [isLoadingPages, readerWaitMessages.length]);

  const pageTitle = useMemo(() => {
    if (!bookTitle) return 'Read Book';
    return `Reading - ${bookTitle}`;
  }, [bookTitle]);

  const desktopWidthClass = {
    narrow: 'xl:max-w-2xl',
    medium: 'xl:max-w-3xl',
    wide: 'xl:max-w-4xl',
  }[desktopWidthMode];

  const handleGoToPage = () => {
    if (!pages.length) return;

    const targetPage = Number(pageSearchValue);
    if (!Number.isInteger(targetPage) || targetPage < 1 || targetPage > pages.length) {
      toast.error(`Enter a page number between 1 and ${pages.length}`);
      return;
    }

    const pageElement = document.getElementById(`reader-page-${targetPage}`);
    if (!pageElement) return;

    pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentPage(targetPage);
  };

  const handleReaderScroll = () => {
    const container = readerContainerRef.current;
    if (!container) return;

    const pageNodes = container.querySelectorAll('[data-reader-page]');
    if (!pageNodes.length) return;

    const containerTop = container.getBoundingClientRect().top;
    let closestPage = currentPage;
    let closestDiff = Number.POSITIVE_INFINITY;

    pageNodes.forEach((node, index) => {
      const diff = Math.abs(node.getBoundingClientRect().top - containerTop);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestPage = index + 1;
      }
    });

    if (closestPage !== currentPage) {
      setCurrentPage(closestPage);
      setPageSearchValue(String(closestPage));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 px-3 py-2 backdrop-blur-md sm:px-5">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-3 sm:justify-between">
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white sm:text-base">{pageTitle}</h1>
            <p className="text-[11px] text-slate-300 sm:text-xs">Scroll vertically to read continuously</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1">
              <span className="text-xs text-slate-300">Page</span>
              <input
                type="number"
                min={1}
                max={pages.length || 1}
                value={pageSearchValue}
                onChange={(event) => setPageSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleGoToPage();
                  }
                }}
                className="h-7 w-16 rounded-md border border-white/15 bg-slate-900 px-2 text-xs text-white outline-none focus:border-cyan-300"
              />
              <span className="text-xs text-slate-400">/ {pages.length || 0}</span>
              <button
                type="button"
                onClick={handleGoToPage}
                className="rounded-md bg-cyan-400 px-2 py-1 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300"
              >
                Go
              </button>
            </div>
            <div className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 md:flex">
              <button
                type="button"
                onClick={() => setDesktopWidthMode('narrow')}
                className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${desktopWidthMode === 'narrow' ? 'bg-cyan-400 text-slate-900' : 'text-slate-200 hover:bg-white/10'}`}
              >
                Narrow
              </button>
              <button
                type="button"
                onClick={() => setDesktopWidthMode('medium')}
                className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${desktopWidthMode === 'medium' ? 'bg-cyan-400 text-slate-900' : 'text-slate-200 hover:bg-white/10'}`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setDesktopWidthMode('wide')}
                className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${desktopWidthMode === 'wide' ? 'bg-cyan-400 text-slate-900' : 'text-slate-200 hover:bg-white/10'}`}
              >
                Wide
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/active-book')} className="shrink-0">
              My Books
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-0 py-0 sm:px-4 sm:py-4">
        <div className="overflow-hidden rounded-none border-y border-white/10 bg-slate-900 shadow-lg sm:rounded-2xl sm:border sm:border-white/12">
          {isLoadingPages && (
            <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-6 py-12 text-center sm:min-h-[70vh]">
              <div className="w-full max-w-md rounded-3xl border border-cyan-200/25 bg-linear-to-b from-white/15 to-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-md">
                <div className="relative mx-auto mb-6 h-20 w-20">
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-200" />
                  <div className="absolute inset-2 animate-pulse rounded-full border border-cyan-200/30" />
                </div>
                <div className="mx-auto mb-5 flex w-28 items-end justify-center gap-1.5">
                  <span className="h-8 w-2 animate-pulse rounded bg-cyan-200/80 [animation-delay:-0.3s]" />
                  <span className="h-11 w-2 animate-pulse rounded bg-cyan-300/90 [animation-delay:-0.15s]" />
                  <span className="h-14 w-2 animate-pulse rounded bg-cyan-100 [animation-delay:0s]" />
                  <span className="h-11 w-2 animate-pulse rounded bg-cyan-300/90 [animation-delay:0.15s]" />
                  <span className="h-8 w-2 animate-pulse rounded bg-cyan-200/80 [animation-delay:0.3s]" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">{isBn ? 'আপনার বই খোলা হচ্ছে' : 'Opening your book'}</h2>
                <div className="mt-2 min-h-11">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={readerWaitMessages[readerWaitMessageIndex]}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                      className="text-sm leading-relaxed text-cyan-100/90"
                    >
                      {readerWaitMessages[readerWaitMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="mt-6 overflow-hidden rounded-full bg-white/10">
                  <div className="h-1.5 w-1/2 animate-pulse rounded-full bg-linear-to-r from-cyan-200 via-cyan-300 to-blue-300" />
                </div>
              </div>
            </div>
          )}

          {!isLoadingPages && readError && (
            <div className="p-8 text-center text-rose-600">{readError}</div>
          )}

          {!isLoadingPages && !readError && pages.length > 0 && (
            <div
              ref={readerContainerRef}
              onScroll={handleReaderScroll}
              className="max-h-[calc(100vh)] min-h-[calc(100vh-88px)] space-y-4 overflow-y-auto bg-slate-100 p-3 sm:p-4"
            >
              {pages.map((imageSrc, index) => (
                <div
                  key={`page-${index + 1}`}
                  id={`reader-page-${index + 1}`}
                  data-reader-page
                  className={`mx-auto rounded-lg border border-slate-300 bg-white p-2 shadow-sm ${desktopWidthClass}`}
                >
                  <p className="mb-2 text-xs font-semibold text-slate-500">Page {index + 1}</p>
                  <img
                    src={imageSrc}
                    alt={`Page ${index + 1}`}
                    className="w-full rounded"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

export default function ReaderBookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <ReaderBookContent />
    </Suspense>
  );
}
