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
            <div className="p-8 text-center text-slate-600">Loading preview...</div>
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
