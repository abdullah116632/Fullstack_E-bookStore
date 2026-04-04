'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaBookOpen, FaUsers, FaUserTie, FaChartLine } from 'react-icons/fa';
import { IoLogOut, IoRefresh, IoTrash } from 'react-icons/io5';
import toast from 'react-hot-toast';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import Footer from '@/components/common/Footer';
import { adminAuthService } from '@/services/authService';
import { logout } from '@/store/slices/authSlice';

export default function AdminPage() {
  const mainAdminApprovalEmail = 'abdullah116632@gmail.com';
  const dispatch = useDispatch();
  const { isAuthenticated, userType, user } = useSelector((state) => state.auth);

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [activePanel, setActivePanel] = useState('overview');
  const [createStep, setCreateStep] = useState('form');
  const [createLoading, setCreateLoading] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [bookList, setBookList] = useState([]);
  const [readerList, setReaderList] = useState([]);
  const [publisherList, setPublisherList] = useState([]);
  const [bookActionLoadingId, setBookActionLoadingId] = useState('');
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    otp: '',
  });
  const [dashboard, setDashboard] = useState({
    stats: {
      totalBooks: 0,
      totalSales: 0,
      totalUsers: 0,
      totalPublishers: 0,
      totalRevenue: 0,
    },
    books: [],
    users: [],
    publishers: [],
  });

  useEffect(() => {
    const checkAdminAccess = () => {
      setIsChecking(true);

      if (isAuthenticated && userType === 'admin') {
        setHasAdminAccess(true);
        setIsChecking(false);
        return;
      }

      const storedToken = localStorage.getItem('authToken');
      const storedUserType = localStorage.getItem('userType');
      const hasStoredAdminAuth = Boolean(storedToken && storedUserType === 'admin');

      setHasAdminAccess(hasStoredAdminAuth);
      setIsChecking(false);
    };

    checkAdminAccess();
  }, [isAuthenticated, userType]);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await adminAuthService.getDashboard();
      setDashboard(response.data?.data || dashboard);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllBooks = async () => {
    try {
      setIsLoading(true);
      const response = await adminAuthService.getAllBooks();
      setBookList(response.data?.data?.books || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookCardClick = async () => {
    setActivePanel('books');
    await fetchAllBooks();
  };

  const fetchAllReaders = async () => {
    try {
      setIsLoading(true);
      const response = await adminAuthService.getAllReaders();
      setReaderList(response.data?.data?.readers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load readers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPublishers = async () => {
    try {
      setIsLoading(true);
      const response = await adminAuthService.getAllPublishers();
      setPublisherList(response.data?.data?.publishers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load publishers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsersCardClick = async () => {
    setActivePanel('users');
    await fetchAllReaders();
  };

  const handlePublishersCardClick = async () => {
    setActivePanel('publishers');
    await fetchAllPublishers();
  };

  const handleToggleFeatured = async (book) => {
    try {
      setBookActionLoadingId(book._id);
      await adminAuthService.updateBookControls(book._id, { isFeatured: !book.isFeatured });
      toast.success(`Featured ${!book.isFeatured ? 'enabled' : 'disabled'} for ${book.title}`);
      await fetchAllBooks();
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update featured option');
    } finally {
      setBookActionLoadingId('');
    }
  };

  const handleToggleVisibility = async (book) => {
    const nextVisibility = book.visibility === 'public' ? 'private' : 'public';
    try {
      setBookActionLoadingId(book._id);
      await adminAuthService.updateBookControls(book._id, { visibility: nextVisibility });
      toast.success(`Visibility set to ${nextVisibility} for ${book.title}`);
      await fetchAllBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update visibility');
    } finally {
      setBookActionLoadingId('');
    }
  };

  const handleDeleteBook = async (book) => {
    const confirmed = window.confirm(`Delete book \"${book.title}\"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setBookActionLoadingId(book._id);
      await adminAuthService.deleteBook(book._id);
      toast.success(`Deleted ${book.title}`);
      await fetchAllBooks();
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete book');
    } finally {
      setBookActionLoadingId('');
    }
  };

  useEffect(() => {
    if (hasAdminAccess) {
      fetchDashboard();
    }
  }, [hasAdminAccess]);

  const openLogin = () => {
    setAuthDrawerOpen(true);
  };

  const resetCreateAdminState = () => {
    setCreateStep('form');
    setCreateErrors({});
    setCreateForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      otp: '',
    });
  };

  const validateCreateForm = () => {
    const newErrors = {};

    if (!createForm.fullName.trim() || createForm.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    const normalizedEmail = createForm.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      newErrors.email = 'Please enter a valid admin email';
    }

    if (!createForm.password || createForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (createForm.confirmPassword !== createForm.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setCreateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    if (createErrors[name]) {
      setCreateErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRequestSignupOTP = async (event) => {
    event.preventDefault();

    if (!validateCreateForm()) return;

    try {
      setCreateLoading(true);
      const response = await adminAuthService.requestSignupOTP({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        phoneNumber: createForm.phoneNumber.trim() || undefined,
      });

      toast.success(response.data?.message || `OTP sent to ${mainAdminApprovalEmail}`);
      setCreateStep('otp');
      setCreateErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleVerifySignupOTP = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(createForm.otp)) {
      setCreateErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    try {
      setCreateLoading(true);
      const response = await adminAuthService.verifySignupOTP({
        email: createForm.email.trim().toLowerCase(),
        otp: createForm.otp,
      });

      toast.success(response.data?.message || 'Admin account created successfully');
      setShowCreateAdmin(false);
      resetCreateAdminState();
      openLogin();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setHasAdminAccess(false);
    toast.success('Logged out successfully');
  };

  const statCards = [
    {
      key: 'books',
      title: 'All Books',
      value: dashboard.stats.totalBooks,
      icon: <FaBookOpen className="text-2xl text-cyan-600" />,
      tone: 'border-cyan-200 bg-cyan-50/80',
      onClick: handleBookCardClick,
    },
    {
      key: 'sales',
      title: 'All Sales',
      value: dashboard.stats.totalSales,
      icon: <FaChartLine className="text-2xl text-teal-600" />,
      tone: 'border-teal-200 bg-teal-50/80',
      onClick: () => setActivePanel('overview'),
    },
    {
      key: 'users',
      title: 'All Users',
      value: dashboard.stats.totalUsers,
      icon: <FaUsers className="text-2xl text-emerald-600" />,
      tone: 'border-emerald-200 bg-emerald-50/80',
      onClick: handleUsersCardClick,
    },
    {
      key: 'publishers',
      title: 'All Publishers',
      value: dashboard.stats.totalPublishers,
      icon: <FaUserTie className="text-2xl text-orange-600" />,
      tone: 'border-orange-200 bg-orange-50/80',
      onClick: handlePublishersCardClick,
    },
  ];

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-GB');
  };

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-slate-200/70 bg-white/78 px-4 py-3 shadow-lg shadow-slate-300/35 backdrop-blur-xl sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              {hasAdminAccess
                ? `Welcome${user?.fullName ? `, ${user.fullName}` : ''}`
                : 'Access restricted to admin accounts'}
            </p>
          </div>

          {hasAdminAccess ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchDashboard} className="gap-2" isLoading={isLoading}>
                <IoRefresh />
                Refresh
              </Button>
              <Button variant="danger" size="sm" onClick={handleLogout} className="gap-2">
                <IoLogOut />
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={openLogin}>
              Login as Admin
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        {isChecking ? (
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-16 text-center shadow-lg backdrop-blur-md">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-teal-600" />
            <p className="mt-4 text-slate-600">Checking admin access...</p>
          </div>
        ) : hasAdminAccess ? (
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl border border-cyan-200/40 bg-linear-to-r from-slate-900 via-cyan-900 to-teal-900 p-8 text-white shadow-2xl shadow-cyan-900/20">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
              <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-teal-300/20 blur-2xl" />
              <div className="relative">
                <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
                <p className="mt-2 max-w-2xl text-cyan-100/95">
                  Monitor platform-wide books, sales, users, and publishers from one place.
                </p>
                <p className="mt-4 text-sm font-semibold text-cyan-100">
                  Total Revenue: ${Number(dashboard.stats.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={card.onClick}
                  className={`rounded-2xl border p-6 text-left shadow-md backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-lg ${card.tone}`}
                >
                  {card.icon}
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-700">{card.title}</h3>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
                </button>
              ))}
            </section>

            {activePanel === 'books' && (
              <section className="rounded-3xl border border-slate-200/70 bg-white/86 p-6 shadow-lg shadow-slate-300/20 backdrop-blur-md">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">All Books List</h3>
                  <Button variant="outline" size="sm" onClick={fetchAllBooks} isLoading={isLoading}>
                    Refresh List
                  </Button>
                </div>

                <div className="space-y-3">
                  {bookList.length === 0 ? (
                    <p className="text-sm text-slate-500">No books found.</p>
                  ) : (
                    bookList.map((book) => (
                      <div key={book._id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{book.title}</p>
                            <p className="text-xs text-slate-600">Author: {book.author}</p>
                            <p className="text-xs text-slate-600">Publisher: {book.publisher?.publisherName || '-'}</p>
                            <p className="text-xs text-slate-500">Visibility: {book.visibility}</p>
                            <p className="text-xs text-slate-500">Featured: {book.isFeatured ? 'ON' : 'OFF'}</p>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <Button
                              variant={book.isFeatured ? 'secondary' : 'primary'}
                              size="sm"
                              onClick={() => handleToggleFeatured(book)}
                              isLoading={bookActionLoadingId === book._id}
                            >
                              Featured {book.isFeatured ? 'OFF' : 'ON'}
                            </Button>
                            <Button
                              variant={book.visibility === 'public' ? 'secondary' : 'primary'}
                              size="sm"
                              onClick={() => handleToggleVisibility(book)}
                              isLoading={bookActionLoadingId === book._id}
                            >
                              Visibility {book.visibility === 'public' ? 'OFF' : 'ON'}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteBook(book)}
                              isLoading={bookActionLoadingId === book._id}
                              className="gap-1.5"
                            >
                              <IoTrash />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {activePanel === 'users' && (
              <section className="rounded-3xl border border-slate-200/70 bg-white/86 p-6 shadow-lg shadow-slate-300/20 backdrop-blur-md">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">All Readers List</h3>
                  <Button variant="outline" size="sm" onClick={fetchAllReaders} isLoading={isLoading}>
                    Refresh List
                  </Button>
                </div>

                <div className="space-y-3">
                  {readerList.length === 0 ? (
                    <p className="text-sm text-slate-500">No readers found.</p>
                  ) : (
                    readerList.map((reader) => (
                      <div key={reader._id} className="rounded-xl border border-slate-200 p-4">
                        <p className="text-sm font-semibold text-slate-900">{reader.fullName}</p>
                        <p className="text-xs text-slate-600">{reader.email}</p>
                        <p className="text-xs text-slate-500">Status: {reader.isActive ? 'Active' : 'Inactive'}</p>
                        <p className="text-xs text-slate-500">Joined: {formatDate(reader.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {activePanel === 'publishers' && (
              <section className="rounded-3xl border border-slate-200/70 bg-white/86 p-6 shadow-lg shadow-slate-300/20 backdrop-blur-md">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">All Publishers List</h3>
                  <Button variant="outline" size="sm" onClick={fetchAllPublishers} isLoading={isLoading}>
                    Refresh List
                  </Button>
                </div>

                <div className="space-y-3">
                  {publisherList.length === 0 ? (
                    <p className="text-sm text-slate-500">No publishers found.</p>
                  ) : (
                    publisherList.map((publisher) => (
                      <div key={publisher._id} className="rounded-xl border border-slate-200 p-4">
                        <p className="text-sm font-semibold text-slate-900">{publisher.publisherName || publisher.fullName}</p>
                        <p className="text-xs text-slate-600">{publisher.email}</p>
                        <p className="text-xs text-slate-500">Approval: {publisher.isApproved ? 'Approved' : 'Pending'}</p>
                        <p className="text-xs text-slate-500">Status: {publisher.isActive ? 'Active' : 'Inactive'}</p>
                        <p className="text-xs text-slate-500">Joined: {formatDate(publisher.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/70 bg-white/86 p-6 shadow-lg shadow-slate-300/20 backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-900">Recent Books</h3>
                <div className="mt-4 space-y-3">
                  {dashboard.books.length === 0 ? (
                    <p className="text-sm text-slate-500">No books found.</p>
                  ) : (
                    dashboard.books.map((book) => (
                      <div key={book._id} className="rounded-xl border border-slate-200 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-800">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                        <p className="text-xs text-slate-500">Publisher: {book.publisher?.publisherName || '-'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/86 p-6 shadow-lg shadow-slate-300/20 backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-900">Recent Users</h3>
                <div className="mt-4 space-y-3">
                  {dashboard.users.length === 0 ? (
                    <p className="text-sm text-slate-500">No users found.</p>
                  ) : (
                    dashboard.users.map((reader) => (
                      <div key={reader._id} className="rounded-xl border border-slate-200 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-800">{reader.fullName}</p>
                        <p className="text-xs text-slate-500">{reader.email}</p>
                        <p className="text-xs text-slate-500">Joined: {formatDate(reader.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/86 p-6 shadow-lg shadow-slate-300/20 backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-900">Recent Publishers</h3>
                <div className="mt-4 space-y-3">
                  {dashboard.publishers.length === 0 ? (
                    <p className="text-sm text-slate-500">No publishers found.</p>
                  ) : (
                    dashboard.publishers.map((publisher) => (
                      <div key={publisher._id} className="rounded-xl border border-slate-200 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-800">{publisher.publisherName}</p>
                        <p className="text-xs text-slate-500">{publisher.email}</p>
                        <p className="text-xs text-slate-500">
                          Status: {publisher.isApproved ? 'Approved' : 'Pending Approval'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-10 text-center shadow-lg backdrop-blur-md sm:p-14">
            <h2 className="text-2xl font-bold text-slate-900">Admin Access Required</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Login with an admin account to view platform analytics and management data.
            </p>
            <div className="mx-auto mt-8 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              <Button variant="primary" size="md" onClick={openLogin} className="w-full">
                Login as Admin
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setShowCreateAdmin((prev) => !prev);
                  if (showCreateAdmin) {
                    resetCreateAdminState();
                  }
                }}
                className="w-full"
              >
                {showCreateAdmin ? 'Close Create Admin' : 'Create Admin'}
              </Button>
            </div>

            {showCreateAdmin && (
              <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-md">
                <h3 className="text-lg font-bold text-slate-900">Create Admin Account</h3>
                <p className="mt-1 text-sm text-slate-600">
                  You can enter any new admin email. OTP approval will always be sent to main admin: {mainAdminApprovalEmail}.
                </p>

                {createStep === 'form' ? (
                  <form className="mt-5 space-y-4" onSubmit={handleRequestSignupOTP}>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={createForm.fullName}
                        onChange={handleCreateFormChange}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        required
                      />
                      {createErrors.fullName && <p className="mt-1 text-xs text-red-600">{createErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Admin Email</label>
                      <input
                        type="email"
                        name="email"
                        value={createForm.email}
                        onChange={handleCreateFormChange}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        placeholder="new-admin@example.com"
                        required
                      />
                      {createErrors.email && <p className="mt-1 text-xs text-red-600">{createErrors.email}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={createForm.password}
                          onChange={handleCreateFormChange}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                          required
                        />
                        {createErrors.password && <p className="mt-1 text-xs text-red-600">{createErrors.password}</p>}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={createForm.confirmPassword}
                          onChange={handleCreateFormChange}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                          required
                        />
                        {createErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{createErrors.confirmPassword}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number (optional)</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={createForm.phoneNumber}
                        onChange={handleCreateFormChange}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      />
                    </div>

                    <Button type="submit" variant="primary" size="md" isLoading={createLoading} className="w-full">
                      Send OTP
                    </Button>
                  </form>
                ) : (
                  <form className="mt-5 space-y-4" onSubmit={handleVerifySignupOTP}>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">OTP Code</label>
                      <p className="mb-1 text-xs text-slate-500">
                        Enter OTP received by main admin on {mainAdminApprovalEmail} to approve creating {createForm.email || 'this admin account'}.
                      </p>
                      <input
                        type="text"
                        name="otp"
                        value={createForm.otp}
                        onChange={handleCreateFormChange}
                        maxLength={6}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        placeholder="Enter 6-digit OTP"
                        required
                      />
                      {createErrors.otp && <p className="mt-1 text-xs text-red-600">{createErrors.otp}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Button type="submit" variant="primary" size="md" isLoading={createLoading} className="w-full">
                        Verify OTP & Create
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => {
                          setCreateStep('form');
                          setCreateErrors({});
                          setCreateForm((prev) => ({ ...prev, otp: '' }));
                        }}
                        className="w-full"
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <AuthDrawer
        isOpen={authDrawerOpen}
        onClose={() => setAuthDrawerOpen(false)}
        initialUserType="admin"
        initialFormType="login"
      />
    </div>
  );
}
