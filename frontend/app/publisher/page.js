'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaBookOpen, FaChartBar, FaUsers } from 'react-icons/fa';
import { IoLogOut } from 'react-icons/io5';
import toast from 'react-hot-toast';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import Footer from '@/components/common/Footer';
import Input from '@/components/common/Input';
import { publisherAuthService } from '@/services/authService';
import { logout } from '@/store/slices/authSlice';

export default function PublisherPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, userType, user } = useSelector((state) => state.auth);

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authFormType, setAuthFormType] = useState('login');
  const [hasPublisherAccess, setHasPublisherAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});
  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: null,
    bookFile: null,
  });

  useEffect(() => {
    const checkPublisherAccess = () => {
      setIsChecking(true);

      if (isAuthenticated && userType === 'publisher') {
        setHasPublisherAccess(true);
        setIsChecking(false);
        return;
      }

      const storedToken = localStorage.getItem('authToken');
      const storedUserType = localStorage.getItem('userType');
      const hasStoredPublisherAuth = Boolean(storedToken && storedUserType === 'publisher');

      setHasPublisherAccess(hasStoredPublisherAuth);
      setIsChecking(false);
    };

    checkPublisherAccess();
  }, [isAuthenticated, userType]);

  const openLogin = () => {
    setAuthFormType('login');
    setAuthDrawerOpen(true);
  };

  const openSignup = () => {
    setAuthFormType('signup');
    setAuthDrawerOpen(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    setHasPublisherAccess(false);
  };

  const getWordCount = (text = '') => text.trim().split(/\s+/).filter(Boolean).length;

  const validateUploadForm = () => {
    const newErrors = {};

    if (!uploadForm.title.trim()) newErrors.title = 'Book title is required';
    if (!uploadForm.author.trim()) newErrors.author = 'Author is required';

    const wordCount = getWordCount(uploadForm.description);
    if (!uploadForm.description.trim()) {
      newErrors.description = 'Book description is required';
    } else if (wordCount < 100) {
      newErrors.description = `Description must be at least 100 words (currently ${wordCount})`;
    }

    if (!uploadForm.coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }

    if (!uploadForm.bookFile) {
      newErrors.bookFile = 'PDF file is required';
    } else if (uploadForm.bookFile.type !== 'application/pdf') {
      newErrors.bookFile = 'Only PDF files are allowed';
    }

    setUploadErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setUploadForm((prev) => ({ ...prev, [name]: value }));
    if (uploadErrors[name]) {
      setUploadErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setUploadForm((prev) => ({ ...prev, [name]: files?.[0] || null }));
    if (uploadErrors[name]) {
      setUploadErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleUploadBook = async (e) => {
    e.preventDefault();
    if (!validateUploadForm()) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('title', uploadForm.title.trim());
      formData.append('author', uploadForm.author.trim());
      formData.append('description', uploadForm.description.trim());
      formData.append('coverImage', uploadForm.coverImage);
      formData.append('bookFile', uploadForm.bookFile);

      const response = await publisherAuthService.uploadBook(formData);
      toast.success(response.data?.message || 'Book uploaded successfully');

      setUploadForm({
        title: '',
        author: '',
        description: '',
        coverImage: null,
        bookFile: null,
      });
      setUploadErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Book upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-slate-200/70 bg-white/78 px-4 py-3 shadow-lg shadow-slate-300/35 backdrop-blur-xl sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Publisher Dashboard</h1>
            <p className="text-xs text-slate-500 sm:text-sm">Upload and manage your digital books</p>
          </div>

          {hasPublisherAccess ? (
            <Button variant="danger" size="sm" onClick={handleLogout} className="gap-2">
              <IoLogOut />
              Logout
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={openLogin}>
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={openSignup}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        {isChecking ? (
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-16 text-center shadow-lg backdrop-blur-md">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-teal-600" />
            <p className="mt-4 text-slate-600">Checking access...</p>
          </div>
        ) : hasPublisherAccess ? (
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl border border-cyan-200/40 bg-linear-to-r from-slate-900 via-cyan-900 to-teal-900 p-8 text-white shadow-2xl shadow-cyan-900/20">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
              <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-teal-300/20 blur-2xl" />
              <div className="relative">
                <h2 className="text-2xl font-bold tracking-tight">Welcome{user?.fullName ? `, ${user.fullName}` : ''}</h2>
                <p className="mt-2 max-w-2xl text-cyan-100/95">Your publishing workspace is ready. Start by uploading a new title and we&apos;ll keep it saved as draft.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wide text-cyan-100">Status</p>
                    <p className="mt-1 text-sm font-semibold">Publisher Active</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wide text-cyan-100">Upload Type</p>
                    <p className="mt-1 text-sm font-semibold">PDF + Cover Image</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wide text-cyan-100">Visibility</p>
                    <p className="mt-1 text-sm font-semibold">Saved as Draft</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/70 bg-white/86 p-7 shadow-lg shadow-slate-300/20 backdrop-blur-md lg:col-span-2">
                <h3 className="text-xl font-bold text-slate-900">Upload New Book</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Fill in the details below and upload files. Description must be at least 100 words.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleUploadBook}>
                  <Input
                    label="Book Title"
                    type="text"
                    name="title"
                    value={uploadForm.title}
                    onChange={handleFieldChange}
                    error={uploadErrors.title}
                    placeholder="Enter book title"
                    required
                  />

                  <Input
                    label="Author"
                    type="text"
                    name="author"
                    value={uploadForm.author}
                    onChange={handleFieldChange}
                    error={uploadErrors.author}
                    placeholder="Enter author name"
                    required
                  />

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Book Description</label>
                    <textarea
                      name="description"
                      value={uploadForm.description}
                      onChange={handleFieldChange}
                      rows={7}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      placeholder="Write at least 100 words about the book..."
                      required
                    />
                    <div className="mt-1 flex items-center justify-between">
                      {uploadErrors.description ? (
                        <p className="text-xs text-red-600">{uploadErrors.description}</p>
                      ) : (
                        <span className="text-xs text-slate-500">Describe the storyline, style, and reader benefit.</span>
                      )}
                      <p className="text-xs font-semibold text-slate-600">{getWordCount(uploadForm.description)} words</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Cover Image</label>
                      <input
                        type="file"
                        name="coverImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-100 file:px-3 file:py-1.5 file:text-teal-800"
                        required
                      />
                      {uploadErrors.coverImage && <p className="mt-1 text-xs text-red-600">{uploadErrors.coverImage}</p>}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Main PDF File</label>
                      <input
                        type="file"
                        name="bookFile"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-100 file:px-3 file:py-1.5 file:text-cyan-800"
                        required
                      />
                      {uploadErrors.bookFile && <p className="mt-1 text-xs text-red-600">{uploadErrors.bookFile}</p>}
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="md" isLoading={isUploading} className="w-full md:w-auto">
                    {isUploading ? 'Uploading Book...' : 'Upload Book'}
                  </Button>
                </form>
              </div>

              <aside className="space-y-4 rounded-3xl border border-slate-200/70 bg-slate-900 p-6 text-slate-100 shadow-lg shadow-slate-700/30">
                <h4 className="text-lg font-bold">Upload Checklist</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>Book title and author are required.</li>
                  <li>Description must be at least 100 words.</li>
                  <li>Cover must be an image file.</li>
                  <li>Main file must be a PDF.</li>
                </ul>
                <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                  Files are uploaded to Cloudinary and saved as draft entries.
                </div>
              </aside>
            </section>

            <section className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-teal-200/80 bg-teal-50/80 p-6 shadow-md backdrop-blur-md">
                <FaBookOpen className="text-2xl text-teal-600" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">Books</h3>
                <p className="mt-1 text-sm text-slate-600">Create and manage your catalogue.</p>
              </div>
              <div className="rounded-2xl border border-cyan-200/80 bg-cyan-50/80 p-6 shadow-md backdrop-blur-md">
                <FaChartBar className="text-2xl text-cyan-600" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">Analytics</h3>
                <p className="mt-1 text-sm text-slate-600">Track performance and growth.</p>
              </div>
              <div className="rounded-2xl border border-orange-200/80 bg-orange-50/80 p-6 shadow-md backdrop-blur-md">
                <FaUsers className="text-2xl text-orange-500" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">Audience</h3>
                <p className="mt-1 text-sm text-slate-600">Understand and engage readers.</p>
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-10 text-center shadow-lg backdrop-blur-md sm:p-14">
            <h2 className="text-2xl font-bold text-slate-900">Publisher Access Required</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Login or sign up with a publisher account to access this page.
            </p>

            <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row">
              <Button variant="outline" size="md" onClick={openLogin} className="w-full">
                Login as Publisher
              </Button>
              <Button variant="primary" size="md" onClick={openSignup} className="w-full">
                Sign up as Publisher
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <AuthDrawer
        isOpen={authDrawerOpen}
        onClose={() => setAuthDrawerOpen(false)}
        initialUserType="publisher"
        initialFormType={authFormType}
      />
    </div>
  );
}
