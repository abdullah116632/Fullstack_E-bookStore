'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import { API_BASE_URL } from '@/constants/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

export default function BookPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');

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

  const pageTitle = useMemo(() => {
    if (!bookTitle) return 'Read Few Pages';
    return `Read Few Pages - ${bookTitle}`;
  }, [bookTitle]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onEditProfile={handleEditProfile}
        onUpdatePassword={handleUpdatePassword}
        onChangeEmail={handleChangeEmail}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/12 bg-slate-900/60 p-4 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-bold text-white">{pageTitle}</h1>
            <p className="text-sm text-slate-300">Preview is limited to first 7 pages.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/12 bg-white shadow-lg">
          {isLoadingPreview && (
            <div className="flex min-h-[60vh] items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-6 py-12 text-center">
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

                <h2 className="text-xl font-bold tracking-tight text-white">Book is loading, please wait</h2>
                <p className="mt-2 text-sm leading-relaxed text-cyan-100/90">
                  Turning pages for your preview and preparing the first 7 pages.
                </p>

                <div className="mt-6 overflow-hidden rounded-full bg-white/10">
                  <div className="h-1.5 w-1/2 animate-pulse rounded-full bg-linear-to-r from-cyan-200 via-cyan-300 to-blue-300" />
                </div>
              </div>
            </div>
          )}

          {!isLoadingPreview && previewError && (
            <div className="p-8 text-center text-rose-600">{previewError}</div>
          )}

          {!isLoadingPreview && !previewError && previewImages.length > 0 && (
            <div className="max-h-[78vh] space-y-4 overflow-auto bg-slate-100 p-4">
              {previewImages.map((imageSrc, index) => (
                <div key={`${index + 1}`} className="rounded-lg border border-slate-300 bg-white p-2 shadow-sm">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Page {index + 1}</p>
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
