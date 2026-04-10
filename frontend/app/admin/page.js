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
  const ADMIN_LIST_PAGE_LIMIT = 50;
  const dispatch = useDispatch();
  const { isAuthenticated, userType, user } = useSelector((state) => state.auth);

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [activePanel, setActivePanel] = useState('books');
  const [createStep, setCreateStep] = useState('form');
  const [createLoading, setCreateLoading] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [bookList, setBookList] = useState([]);
  const [bookSearchPublisher, setBookSearchPublisher] = useState('');
  const [bookPage, setBookPage] = useState(1);
  const [bookPagination, setBookPagination] = useState({
    page: 1,
    limit: ADMIN_LIST_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [readerList, setReaderList] = useState([]);
  const [readerSearchEmail, setReaderSearchEmail] = useState('');
  const [publisherList, setPublisherList] = useState([]);
  const [publisherSearchEmail, setPublisherSearchEmail] = useState('');
  const [readerPage, setReaderPage] = useState(1);
  const [readerPagination, setReaderPagination] = useState({
    page: 1,
    limit: ADMIN_LIST_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [publisherPage, setPublisherPage] = useState(1);
  const [publisherPagination, setPublisherPagination] = useState({
    page: 1,
    limit: ADMIN_LIST_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [purchaseList, setPurchaseList] = useState([]);
  const [purchaseFilter, setPurchaseFilter] = useState('all');
  const [purchaseSearchBy, setPurchaseSearchBy] = useState('ordernumber');
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState('');
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchasePagination, setPurchasePagination] = useState({
    page: 1,
    limit: ADMIN_LIST_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [bookActionLoadingId, setBookActionLoadingId] = useState('');
  const [publisherActionLoadingId, setPublisherActionLoadingId] = useState('');
  const [purchaseActionLoadingId, setPurchaseActionLoadingId] = useState('');
  const [expandedBookIds, setExpandedBookIds] = useState([]);
  const [expandedPurchaseIds, setExpandedPurchaseIds] = useState([]);
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

  const fetchAllBooks = async (page = bookPage, searchPublisher = bookSearchPublisher) => {
    try {
      setIsLoading(true);
      const response = await adminAuthService.getAllBooks(page, ADMIN_LIST_PAGE_LIMIT, searchPublisher);
      const books = response.data?.data?.books || [];
      const pagination = response.data?.data?.pagination || {
        page,
        limit: ADMIN_LIST_PAGE_LIMIT,
        total: books.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: page > 1,
      };

      setBookList(books);
      setBookPage(pagination.page || page);
      setBookPagination(pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllReaders = async (page = readerPage, searchEmail = readerSearchEmail) => {
    try {
      setIsLoading(true);
      const response = await adminAuthService.getAllReaders(page, ADMIN_LIST_PAGE_LIMIT, searchEmail);
      const readers = response.data?.data?.readers || [];
      const pagination = response.data?.data?.pagination || {
        page,
        limit: ADMIN_LIST_PAGE_LIMIT,
        total: readers.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: page > 1,
      };

      setReaderList(readers);
      setReaderPage(pagination.page || page);
      setReaderPagination(pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load readers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPublishers = async (page = publisherPage, searchEmail = publisherSearchEmail) => {
    try {
      setIsLoading(true);
      const response = await adminAuthService.getAllPublishers(page, ADMIN_LIST_PAGE_LIMIT, searchEmail);
      const publishers = response.data?.data?.publishers || [];
      const pagination = response.data?.data?.pagination || {
        page,
        limit: ADMIN_LIST_PAGE_LIMIT,
        total: publishers.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: page > 1,
      };

      setPublisherList(publishers);
      setPublisherPage(pagination.page || page);
      setPublisherPagination(pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load publishers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPurchases = async (
    status = purchaseFilter,
    page = purchasePage,
    searchBy = purchaseSearchBy,
    searchTerm = purchaseSearchTerm
  ) => {
    try {
      setIsLoading(true);
      const response = await adminAuthService.getAllPurchases(
        status,
        page,
        ADMIN_LIST_PAGE_LIMIT,
        searchBy,
        searchTerm
      );
      const purchases = response.data?.data?.purchases || [];
      const pagination = response.data?.data?.pagination || {
        page,
        limit: ADMIN_LIST_PAGE_LIMIT,
        total: purchases.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: page > 1,
      };

      setPurchaseList(purchases);
      setPurchasePage(pagination.page || page);
      setPurchasePagination(pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivatePurchase = async (purchase) => {
    try {
      setPurchaseActionLoadingId(purchase._id);
      await adminAuthService.approvePurchase(purchase._id);
      toast.success(`Activated ${purchase.orderNumber}`);
      await fetchAllPurchases(purchaseFilter, purchasePage, purchaseSearchBy, purchaseSearchTerm);
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate purchase');
    } finally {
      setPurchaseActionLoadingId('');
    }
  };

  const handleDeactivatePurchase = async (purchase) => {
    const reason = window.prompt('Optional reason for deactivation:', 'Payment verification issue') || undefined;
    const confirmed = window.confirm(`Deactivate ${purchase.orderNumber} and lock access again?`);
    if (!confirmed) return;

    try {
      setPurchaseActionLoadingId(purchase._id);
      await adminAuthService.deactivatePurchase(purchase._id, { reason });
      toast.success(`Deactivated ${purchase.orderNumber}`);
      await fetchAllPurchases(purchaseFilter, purchasePage, purchaseSearchBy, purchaseSearchTerm);
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate purchase');
    } finally {
      setPurchaseActionLoadingId('');
    }
  };

  const handleTogglePurchaseChecked = async (purchase) => {
    try {
      setPurchaseActionLoadingId(purchase._id);
      const nextChecked = !Boolean(purchase.isChecked);
      await adminAuthService.markPurchaseChecked(purchase._id, nextChecked);
      toast.success(`${purchase.orderNumber} marked as ${nextChecked ? 'checked' : 'unchecked'}`);
      await fetchAllPurchases(purchaseFilter, purchasePage, purchaseSearchBy, purchaseSearchTerm);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update checked status');
    } finally {
      setPurchaseActionLoadingId('');
    }
  };

  const handleTogglePublisherActive = async (publisher) => {
    const nextIsActive = !Boolean(publisher.isActive);
    const actionLabel = nextIsActive ? 'activate' : 'deactivate';
    const confirmed = window.confirm(`Are you sure you want to ${actionLabel} ${publisher.publisherName || publisher.fullName}?`);
    if (!confirmed) return;

    try {
      setPublisherActionLoadingId(publisher._id);
      await adminAuthService.updatePublisherActiveStatus(publisher._id, nextIsActive);
      toast.success(`Publisher ${nextIsActive ? 'activated' : 'deactivated'} successfully`);
      await fetchAllPublishers(publisherPage, publisherSearchEmail);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update publisher status');
    } finally {
      setPublisherActionLoadingId('');
    }
  };

  const handleSidebarSelect = async (panel) => {
    setActivePanel(panel);

    if (panel === 'books') {
      setBookSearchPublisher('');
      setBookPage(1);
      await fetchAllBooks(1, '');
      return;
    }

    if (panel === 'sales') {
      setPurchaseFilter('all');
      setPurchaseSearchBy('ordernumber');
      setPurchaseSearchTerm('');
      setPurchasePage(1);
      await fetchAllPurchases('all', 1, 'ordernumber', '');
      return;
    }

    if (panel === 'users') {
      setReaderSearchEmail('');
      setReaderPage(1);
      await fetchAllReaders(1, '');
      return;
    }

    if (panel === 'publishers') {
      setPublisherSearchEmail('');
      setPublisherPage(1);
      await fetchAllPublishers(1, '');
    }
  };

  const handleToggleFeatured = async (book) => {
    try {
      setBookActionLoadingId(book._id);
      await adminAuthService.updateBookControls(book._id, { isFeatured: !book.isFeatured });
      toast.success(`Featured ${!book.isFeatured ? 'enabled' : 'disabled'} for ${book.title}`);
      await fetchAllBooks(bookPage, bookSearchPublisher);
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
      await fetchAllBooks(bookPage, bookSearchPublisher);
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
      await fetchAllBooks(bookPage, bookSearchPublisher);
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete book');
    } finally {
      setBookActionLoadingId('');
    }
  };

  const toggleBookExpand = (bookId) => {
    setExpandedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const togglePurchaseExpand = (purchaseId) => {
    setExpandedPurchaseIds((prev) =>
      prev.includes(purchaseId) ? prev.filter((id) => id !== purchaseId) : [...prev, purchaseId]
    );
  };

  useEffect(() => {
    if (hasAdminAccess) {
      fetchDashboard();
      handleSidebarSelect('books');
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

  const sidebarItems = [
    {
      key: 'books',
      title: 'All Books',
      icon: <FaBookOpen className="text-2xl text-cyan-600" />,
      count: dashboard.stats.totalBooks,
      tone: 'text-cyan-700',
    },
    {
      key: 'sales',
      title: 'All Sales',
      icon: <FaChartLine className="text-2xl text-teal-600" />,
      count: dashboard.stats.totalSales,
      tone: 'text-teal-700',
    },
    {
      key: 'users',
      title: 'All Users',
      icon: <FaUsers className="text-2xl text-emerald-600" />,
      count: dashboard.stats.totalUsers,
      tone: 'text-emerald-700',
    },
    {
      key: 'publishers',
      title: 'All Publishers',
      icon: <FaUserTie className="text-2xl text-orange-600" />,
      count: dashboard.stats.totalPublishers,
      tone: 'text-orange-700',
    },
  ];

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-GB');
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('en-GB');
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
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-3xl border border-slate-200/70 bg-white/88 p-4 shadow-lg shadow-slate-300/20 backdrop-blur-md">
              <h2 className="px-2 pb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Dashboard Menu</h2>
              <div className="space-y-2">
                {sidebarItems.map((item) => {
                  const isActive = activePanel === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSidebarSelect(item.key)}
                      className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                        isActive
                          ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className={`text-sm font-semibold ${isActive ? 'text-cyan-900' : 'text-slate-800'}`}>{item.title}</span>
                        </div>
                        <span className={`text-xs font-bold ${item.tone}`}>{item.count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Total Revenue</p>
                <p className="mt-1 text-lg font-bold text-slate-900">${Number(dashboard.stats.totalRevenue || 0).toFixed(2)}</p>
              </div>
            </aside>

            <section className="rounded-3xl border border-slate-200/70 bg-white/86 p-6 shadow-lg shadow-slate-300/20 backdrop-blur-md">
            {activePanel === 'books' && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">All Books List</h3>
                  <Button variant="outline" size="sm" onClick={() => fetchAllBooks(bookPage, bookSearchPublisher)} isLoading={isLoading}>
                    Refresh List
                  </Button>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    value={bookSearchPublisher}
                    onChange={(event) => setBookSearchPublisher(event.target.value)}
                    placeholder="Search books by publisher"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={async () => {
                        setBookPage(1);
                        await fetchAllBooks(1, bookSearchPublisher);
                      }}
                      isLoading={isLoading}
                    >
                      Search
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setBookSearchPublisher('');
                        setBookPage(1);
                        await fetchAllBooks(1, '');
                      }}
                      disabled={isLoading}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium text-slate-600">
                    Showing up to {bookPagination.limit} books per page. Total: {bookPagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAllBooks(Math.max(1, bookPage - 1), bookSearchPublisher)}
                      disabled={!bookPagination.hasPrevPage || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-xs font-semibold text-slate-700">
                      Page {bookPage} of {bookPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAllBooks(bookPage + 1, bookSearchPublisher)}
                      disabled={!bookPagination.hasNextPage || isLoading}
                    >
                      Next
                    </Button>
                  </div>
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
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleBookExpand(book._id)}
                            >
                              {expandedBookIds.includes(book._id) ? 'Hide Details' : 'Expand'}
                            </Button>
                          </div>
                        </div>

                        {expandedBookIds.includes(book._id) && (
                          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs text-slate-600">Visibility: {book.visibility}</p>
                            <p className="text-xs text-slate-600">Featured: {book.isFeatured ? 'ON' : 'OFF'}</p>
                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activePanel === 'sales' && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">All Purchases Verification List</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={purchaseFilter}
                      onChange={async (event) => {
                        const nextFilter = event.target.value;
                        setPurchaseFilter(nextFilter);
                        setPurchasePage(1);
                        await fetchAllPurchases(nextFilter, 1, purchaseSearchBy, purchaseSearchTerm);
                      }}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="marked">Marked</option>
                      <option value="unmarked">Unmarked</option>
                      <option value="all">All</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAllPurchases(purchaseFilter, purchasePage, purchaseSearchBy, purchaseSearchTerm)}
                      isLoading={isLoading}
                    >
                      Refresh List
                    </Button>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[190px_1fr_auto]">
                  <select
                    value={purchaseSearchBy}
                    onChange={(event) => setPurchaseSearchBy(event.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="number">Phone Number</option>
                    <option value="email">Email</option>
                    <option value="ordernumber">Order Number</option>
                  </select>
                  <input
                    type="text"
                    value={purchaseSearchTerm}
                    onChange={(event) => setPurchaseSearchTerm(event.target.value)}
                    placeholder="Enter value to search"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={async () => {
                        setPurchasePage(1);
                        await fetchAllPurchases(purchaseFilter, 1, purchaseSearchBy, purchaseSearchTerm);
                      }}
                      isLoading={isLoading}
                    >
                      Search
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setPurchaseSearchBy('ordernumber');
                        setPurchaseSearchTerm('');
                        setPurchasePage(1);
                        await fetchAllPurchases(purchaseFilter, 1, 'ordernumber', '');
                      }}
                      disabled={isLoading}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium text-slate-600">
                    Showing up to {purchasePagination.limit} sales per page. Total: {purchasePagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchAllPurchases(
                          purchaseFilter,
                          Math.max(1, purchasePage - 1),
                          purchaseSearchBy,
                          purchaseSearchTerm
                        )
                      }
                      disabled={!purchasePagination.hasPrevPage || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-xs font-semibold text-slate-700">
                      Page {purchasePage} of {purchasePagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchAllPurchases(
                          purchaseFilter,
                          purchasePage + 1,
                          purchaseSearchBy,
                          purchaseSearchTerm
                        )
                      }
                      disabled={!purchasePagination.hasNextPage || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {purchaseList.length === 0 ? (
                    <p className="text-sm text-slate-500">No purchases found for this filter.</p>
                  ) : (
                    purchaseList.map((purchase) => {
                      const book = purchase.books?.[0]?.bookId;
                      const isApproved = Boolean(purchase.accessControl?.isUnlocked);
                      const isDeactivated = purchase.status === 'cancelled' && !isApproved;

                      return (
                        <div key={purchase._id} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{purchase.orderNumber}</p>
                              <p className="text-xs text-slate-600">Phone: {purchase.paymentDetails?.senderMobileNumber || '-'}</p>
                              <p className="text-xs text-slate-600">Gateway: {String(purchase.paymentDetails?.gateway || purchase.paymentMethod || '-').toUpperCase()}</p>
                              <p className="text-xs text-slate-600">Transaction ID: {purchase.paymentDetails?.transactionId || '-'}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePurchaseExpand(purchase._id)}
                              >
                                {expandedPurchaseIds.includes(purchase._id) ? 'Hide Details' : 'Expand'}
                              </Button>
                              <Button
                                variant={purchase.isChecked ? 'success' : 'outline'}
                                size="sm"
                                onClick={() => handleTogglePurchaseChecked(purchase)}
                                isLoading={purchaseActionLoadingId === purchase._id}
                              >
                                {purchase.isChecked ? 'checked' : 'mark checked'}
                              </Button>
                              {isApproved ? (
                                <>
                                  <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    Approved
                                  </span>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeactivatePurchase(purchase)}
                                    isLoading={purchaseActionLoadingId === purchase._id}
                                  >
                                    Deactivate
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleActivatePurchase(purchase)}
                                  isLoading={purchaseActionLoadingId === purchase._id}
                                >
                                  Activate & Unlock
                                </Button>
                              )}
                            </div>
                          </div>

                          {expandedPurchaseIds.includes(purchase._id) && (
                            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs text-slate-600">Book: {book?.title || '-'}</p>
                              <p className="text-xs text-slate-600">Buyer: {purchase.buyer?.fullName || '-'} ({purchase.buyerEmail})</p>
                              <p className="text-xs text-slate-600">Submitted: {formatDateTime(purchase.createdAt)}</p>
                              <p className="text-xs text-slate-600">Receiver Number: {purchase.paymentDetails?.receiverMobileNumber || '-'}</p>
                              <p className="text-xs text-slate-500">Amount: ৳{Number(purchase.finalAmount || 0).toFixed(2)}</p>
                              <p className="text-xs text-slate-500">
                                Status: {isApproved ? 'Approved & Unlocked' : isDeactivated ? 'Deactivated by Admin' : 'Pending Approval'}
                              </p>
                              <p className="text-xs text-slate-500">Activation Mode: {purchase.accessControl?.autoActivated ? 'Auto (1 hour)' : isApproved ? 'Manual by Admin' : '-'}</p>
                              <p className="text-xs text-slate-500">Approved At: {formatDateTime(purchase.accessControl?.approvedAt)}</p>
                              <p className="text-xs text-slate-500">Approved By: {purchase.accessControl?.approvedBy?.fullName || '-'}</p>
                              <p className="text-xs text-slate-500">Deactivated At: {formatDateTime(purchase.accessControl?.deactivatedAt)}</p>
                              <p className="text-xs text-slate-500">Deactivated Reason: {purchase.accessControl?.deactivatedReason || '-'}</p>
                              <p className="text-xs text-slate-500">Checked by Admin: {purchase.isChecked ? 'Yes' : 'No'}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activePanel === 'users' && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">All Readers List</h3>
                  <Button variant="outline" size="sm" onClick={() => fetchAllReaders(readerPage, readerSearchEmail)} isLoading={isLoading}>
                    Refresh List
                  </Button>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    value={readerSearchEmail}
                    onChange={(event) => setReaderSearchEmail(event.target.value)}
                    placeholder="Search reader by email"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={async () => {
                        setReaderPage(1);
                        await fetchAllReaders(1, readerSearchEmail);
                      }}
                      isLoading={isLoading}
                    >
                      Search
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setReaderSearchEmail('');
                        setReaderPage(1);
                        await fetchAllReaders(1, '');
                      }}
                      disabled={isLoading}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium text-slate-600">
                    Showing up to {readerPagination.limit} readers per page. Total: {readerPagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAllReaders(Math.max(1, readerPage - 1), readerSearchEmail)}
                      disabled={!readerPagination.hasPrevPage || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-xs font-semibold text-slate-700">
                      Page {readerPage} of {readerPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAllReaders(readerPage + 1, readerSearchEmail)}
                      disabled={!readerPagination.hasNextPage || isLoading}
                    >
                      Next
                    </Button>
                  </div>
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
              </div>
            )}

            {activePanel === 'publishers' && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">All Publishers List</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAllPublishers(publisherPage, publisherSearchEmail)}
                    isLoading={isLoading}
                  >
                    Refresh List
                  </Button>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    value={publisherSearchEmail}
                    onChange={(event) => setPublisherSearchEmail(event.target.value)}
                    placeholder="Search publisher by email"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={async () => {
                        setPublisherPage(1);
                        await fetchAllPublishers(1, publisherSearchEmail);
                      }}
                      isLoading={isLoading}
                    >
                      Search
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setPublisherSearchEmail('');
                        setPublisherPage(1);
                        await fetchAllPublishers(1, '');
                      }}
                      disabled={isLoading}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium text-slate-600">
                    Showing up to {publisherPagination.limit} publishers per page. Total: {publisherPagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAllPublishers(Math.max(1, publisherPage - 1), publisherSearchEmail)}
                      disabled={!publisherPagination.hasPrevPage || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-xs font-semibold text-slate-700">
                      Page {publisherPage} of {publisherPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAllPublishers(publisherPage + 1, publisherSearchEmail)}
                      disabled={!publisherPagination.hasNextPage || isLoading}
                    >
                      Next
                    </Button>
                  </div>
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
                        <div className="mt-3">
                          <Button
                            variant={publisher.isActive ? 'danger' : 'success'}
                            size="sm"
                            onClick={() => handleTogglePublisherActive(publisher)}
                            isLoading={publisherActionLoadingId === publisher._id}
                          >
                            {publisher.isActive ? 'Deactivate Publisher' : 'Activate Publisher'}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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
