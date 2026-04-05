'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import { bookService } from '@/services/bookService';
import { purchaseService } from '@/services/purchaseService';

const MOBILE_PAYMENT_NUMBER = '01768899941';

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, userType, user } = useSelector((state) => state.auth);

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');

  const [book, setBook] = useState(null);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [hasActiveOrderForBook, setHasActiveOrderForBook] = useState(false);

  const [form, setForm] = useState({
    email: '',
    senderMobileNumber: '',
    transactionId: '',
    paymentMethod: 'bkash',
  });

  const isReaderLoggedIn = isAuthenticated && userType === 'reader';
  const isReaderOrPublisherLoggedIn = isAuthenticated && (userType === 'reader' || userType === 'publisher');
  const isNonReaderLoggedIn = isAuthenticated && userType !== 'reader';
  const bookId = params?.bookId;

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      try {
        setIsLoadingBook(true);
        const response = await bookService.getBookById(bookId);
        setBook(response.data?.data?.book || null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'বইয়ের তথ্য লোড করা যায়নি');
      } finally {
        setIsLoadingBook(false);
      }
    };

    fetchBook();
  }, [bookId]);

  useEffect(() => {
    if (isReaderOrPublisherLoggedIn && user?.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [isReaderOrPublisherLoggedIn, user?.email]);

  useEffect(() => {
    const checkExistingOrder = async () => {
      if (!bookId || !isReaderLoggedIn) {
        setHasActiveOrderForBook(false);
        return;
      }

      try {
        const response = await purchaseService.getMyPurchasedBooks();
        const books = response.data?.data?.books || [];
        const existing = books.find((item) => String(item._id) === String(bookId) && Boolean(item.isUnlocked));
        setHasActiveOrderForBook(Boolean(existing));

        if (existing) {
          toast.error('আপনি এই বইটি ইতোমধ্যে কিনেছেন, তাই আবার কিনতে পারবেন না।');
        }
      } catch (error) {
        setHasActiveOrderForBook(false);
      }
    };

    checkExistingOrder();
  }, [bookId, isReaderLoggedIn]);

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!book?._id) {
      toast.error('বইয়ের তথ্য পাওয়া যায়নি। আবার রিফ্রেশ করে চেষ্টা করুন');
      return;
    }

    if (isReaderLoggedIn && hasActiveOrderForBook) {
      toast.error('আপনি এই বইটি ইতোমধ্যে কিনেছেন, তাই আবার কিনতে পারবেন না।');
      router.push('/active-book');
      return;
    }

    if (!form.transactionId.trim()) {
      toast.error('ট্রানজেকশন আইডি দিতে হবে');
      return;
    }

    if (!/^\d{11}$/.test(form.senderMobileNumber.trim())) {
      toast.error('প্রেরকের মোবাইল নম্বর ১১ ডিজিট হতে হবে');
      return;
    }

    if (!isReaderOrPublisherLoggedIn && !form.email.trim()) {
      toast.error('গেস্ট হিসেবে কিনতে ইমেইল দিতে হবে');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        bookId: book._id,
        paymentMethod: form.paymentMethod,
        senderMobileNumber: form.senderMobileNumber.trim(),
        transactionId: form.transactionId.trim(),
        email: form.email.trim() || undefined,
      };

      const response = await purchaseService.createManualPurchase(payload);
      const orderData = response.data?.data;
      setSubmittedOrder(orderData);

      toast.success(response.data?.message || 'ক্রয়ের তথ্য সফলভাবে জমা হয়েছে');
      if (orderData?.accountCreated) {
        toast.success('নতুন রিডার অ্যাকাউন্ট তৈরি করা হয়েছে এবং লগইন তথ্য ইমেইলে পাঠানো হয়েছে');
      }

      if (!isReaderLoggedIn) {
        toast.success('দয়া করে ইমেইল চেক করুন। প্রয়োজনীয় তথ্য সেখানে পাঠানো হয়েছে।');
      }

      const params = new URLSearchParams();
      if (orderData?.orderNumber) params.set('orderNumber', orderData.orderNumber);
      if (orderData?.accountCreated) params.set('accountCreated', '1');

      const query = params.toString();
      router.push(query ? `/purchase/success?${query}` : '/purchase/success');
      return;
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('আপনি এই বইটি ইতোমধ্যে কিনেছেন, তাই আবার কিনতে পারবেন না।');
        return;
      }
      toast.error(error.response?.data?.message || 'ক্রয়ের তথ্য জমা দেওয়া যায়নি');
    } finally {
      setIsSubmitting(false);
    }
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

      <main className="relative flex-1 overflow-hidden bg-transparent pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-90 bg-linear-to-b from-slate-950 via-slate-900 to-transparent" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-100 transition-colors hover:text-white"
          >
            <IoArrowBack /> ফিরে যান
          </button>

          {isLoadingBook ? (
            <div className="rounded-3xl border border-white/12 bg-slate-900/62 p-10 text-center text-slate-200">
              ক্রয়ের তথ্য লোড হচ্ছে...
            </div>
          ) : !book ? (
            <div className="rounded-3xl border border-red-200/35 bg-red-900/18 p-10 text-center text-red-100">
              বই পাওয়া যায়নি
            </div>
          ) : (
            <section className="mx-auto max-w-3xl rounded-3xl border border-cyan-200/20 bg-slate-900/72 p-7 shadow-xl shadow-slate-900/40 backdrop-blur-md lg:p-8">
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/12 bg-slate-950/55 p-3">
                <img
                  src={book.coverImage}
                  alt="নির্বাচিত বইয়ের কভার"
                  className="h-14 w-11 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-cyan-100">আপনি এই বইটি কিনছেন</p>
                  <h2 className="line-clamp-1 text-sm font-bold text-white">{book.title}</h2>
                </div>
              </div>

              {submittedOrder ? (
                <div className="rounded-2xl border border-emerald-300/35 bg-emerald-500/10 p-5 text-emerald-100">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <IoCheckmarkCircle />
                    সফলভাবে জমা হয়েছে
                  </div>
                  <p className="mt-3 text-sm text-emerald-100/95">অর্ডার নম্বর: {submittedOrder.orderNumber}</p>
                  <p className="mt-1 text-sm text-emerald-100/95">স্ট্যাটাস: প্রসেসিং চলছে</p>
                  <p className="mt-4 text-sm text-emerald-100/95">
                    {isReaderLoggedIn
                      ? 'বইটি আনলক হতে কিছু সময় লাগতে পারে (সর্বোচ্চ ১ ঘণ্টা)।'
                      : 'দয়া করে ইমেইল চেক করুন। প্রয়োজনীয় তথ্য সেখানে পাঠানো হয়েছে। নতুন অ্যাকাউন্ট তৈরি হয়ে থাকলে লগইন তথ্যও ইমেইলে পাবেন।'}
                  </p>
                  <div className="mt-5 flex gap-3">
                    {isReaderOrPublisherLoggedIn ? (
                      <Button variant="primary" onClick={() => router.push('/active-book')}>
                        আপনার বইয়ে যান
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={handleLoginClick}>
                        রিডার হিসেবে লগইন
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => router.push('/books')}>
                      আরও বই দেখুন
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  

                  <div className="space-y-3 rounded-2xl border border-cyan-300/45 bg-cyan-500/18 p-5 shadow-lg shadow-cyan-900/20 animate-pulse">
                    <p className="text-xs font-semibold tracking-wider text-cyan-100">
                      আগে এই নম্বরে <span className="font-bold text-amber-300">সেন্ড মানি</span> করুন
                    </p>
                    <p className="text-3xl font-extrabold tracking-wide text-white sm:text-4xl">{MOBILE_PAYMENT_NUMBER}</p>
                    <p className="text-sm font-medium text-cyan-100/95">
                      bKash, Nagad, Rocket অথবা Upay দিয়ে <span className="font-semibold text-amber-300">সেন্ড মানি</span> করে নিচের ফরম পূরণ করুন।
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-300/45 bg-amber-500/15 p-5 text-amber-50 shadow-lg shadow-amber-900/20">
                    <h2 className="text-base font-bold tracking-wide">পেমেন্ট ও ফরম পূরণের নিয়ম</h2>
                    <ol className="mt-3 space-y-2 text-sm leading-relaxed">
                      <li>
                        <span className="font-semibold text-amber-200">১.</span> বইয়ের নির্ধারিত টাকা{' '}
                        <span className="font-bold text-cyan-300">{MOBILE_PAYMENT_NUMBER}</span> নম্বরে{' '}
                        <span className="font-bold text-amber-300">সেন্ড মানি</span> করুন।
                      </li>
                      <li><span className="font-semibold text-amber-200">২.</span> যে মোবাইল ব্যাংকিং দিয়ে টাকা পাঠিয়েছেন, ফরমে সেটিই নির্বাচন করুন।</li>
                      <li><span className="font-semibold text-amber-200">৩.</span> প্রেরকের মোবাইল নম্বর ও ট্রানজেকশন আইডি ঠিকভাবে লিখুন।</li>
                      <li><span className="font-semibold text-amber-200">৪.</span> সঠিক ইমেইল দিন। বই আনলক হতে কিছু সময় লাগতে পারে (সর্বোচ্চ ১ ঘণ্টা)।</li>
                    </ol>
                  </div>

                  <h2 className="text-2xl font-bold text-white">পেমেন্ট জমা দেওয়ার ফরম</h2>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-100">ইমেইল</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      disabled={isReaderLoggedIn}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/75 px-4 py-3 text-base text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
                      placeholder="আপনার ইমেইল লিখুন"
                      required={!isReaderLoggedIn}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-100">মোবাইল ব্যাংকিং অ্যাকাউন্ট</label>
                    <select
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/75 px-4 py-3 text-base text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                    >
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="upay">Upay</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-100">প্রেরকের মোবাইল নম্বর</label>
                    <input
                      type="text"
                      name="senderMobileNumber"
                      value={form.senderMobileNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/75 px-4 py-3 text-base text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                      placeholder="১১ ডিজিটের মোবাইল নম্বর লিখুন"
                      maxLength={11}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-100">ট্রানজেকশন আইডি</label>
                    <input
                      type="text"
                      name="transactionId"
                      value={form.transactionId}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/75 px-4 py-3 text-base text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                      placeholder="ট্রানজেকশন আইডি লিখুন"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-base"
                    isLoading={isSubmitting}
                    disabled={isReaderLoggedIn && hasActiveOrderForBook}
                  >
                    জমা দিন
                  </Button>
                  {isReaderLoggedIn && hasActiveOrderForBook && (
                    <div className="rounded-2xl border border-amber-300/40 bg-amber-500/12 p-4 text-amber-100">
                      <p className="text-sm font-medium">
                        আপনি এই বইটি ইতোমধ্যে কিনেছেন, তাই আবার কিনতে পারবেন না।
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" onClick={() => router.push('/active-book')}>
                          Active Book এ যান
                        </Button>
                      </div>
                    </div>
                  )}
                  {isNonReaderLoggedIn && (
                    <div className="rounded-2xl border border-blue-300/35 bg-blue-500/12 p-4 text-blue-100">
                      <p className="text-sm font-medium">
                        আপনার ইমেইল আগে ইউজার তালিকায় খোঁজা হবে। না থাকলে উপরে দেওয়া ইমেইল দিয়ে রিডার অ্যাকাউন্ট তৈরি করে ক্রয় সম্পন্ন হবে।
                      </p>
                    </div>
                  )}
                </form>
              )}
            </section>
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
