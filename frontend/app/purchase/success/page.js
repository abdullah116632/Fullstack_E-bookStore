'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoMailOpenOutline, IoSparkles } from 'react-icons/io5';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';

function PurchaseSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useTranslation();

  const orderNumber = searchParams.get('orderNumber');
  const accountCreated = searchParams.get('accountCreated') === '1';
  const isBn = language === 'bn';

  const text = isBn
    ? {
        purchaseComplete: 'ক্রয় সম্পন্ন',
        title: 'আপনার ক্রয় সফল হয়েছে',
        subtitle: 'ধন্যবাদ। আপনার পেমেন্ট গ্রহণ করা হয়েছে এবং অর্ডার প্রসেসিং চলছে।',
        importantMessage: 'গুরুত্বপূর্ণ বার্তা',
        checkEmail: 'পেমেন্টের সময় যে ইমেইল দিয়েছেন, দয়া করে সেটি চেক করুন।',
        passwordNotice: 'যদি ঐ ইমেইলে আপনার কোনো অ্যাকাউন্ট না থাকে, তাহলে আমরা আপনার ইমেইলে একটি পাসওয়ার্ড এবং পাসওয়ার্ড আপডেট লিংক পাঠিয়েছি।',
        existingAccountNotice: 'যদি এই ইমেইলে আগে থেকেই আপনার অ্যাকাউন্ট থাকে, তাহলে লগইন করে পড়া শুরু করুন।',
        accountCreated: 'আপনার জন্য নতুন রিডার অ্যাকাউন্ট তৈরি করা হয়েছে এবং লগইন তথ্য ইমেইলে পাঠানো হয়েছে।',
        orderNumber: 'অর্ডার নম্বর',
        startReading: 'পড়া শুরু করুন',
      }
    : {
        purchaseComplete: 'Purchase Complete',
        title: 'Your purchase was successful',
        subtitle: 'Thank you. Your payment has been received and your order is now being processed.',
        importantMessage: 'Important Message',
        checkEmail: 'Please check the email address you provided during payment.',
        passwordNotice: 'If you do not have any account with that email, we sent a password and an update-password link to your email.',
        existingAccountNotice: 'If you have already created an account before purchase, just log in to start reading.',
        accountCreated: 'A new reader account was created for you and the credentials were sent by email.',
        orderNumber: 'Order Number',
        startReading: 'Start Reading',
      };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="relative flex-1 overflow-hidden bg-linear-to-b from-slate-950 via-slate-900 to-cyan-950 pb-16 pt-6 sm:pt-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-90 bg-linear-to-b from-cyan-950/40 via-slate-900/35 to-transparent" />

        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 sm:px-6 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative w-full overflow-hidden rounded-3xl border border-emerald-300/30 bg-slate-900/80 p-7 text-center shadow-xl shadow-slate-900/45 backdrop-blur-md lg:p-10"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-10 -top-12 h-40 w-40 rounded-full bg-emerald-400/14 blur-3xl" />
              <div className="absolute -right-8 top-8 h-36 w-36 rounded-full bg-cyan-400/12 blur-3xl" />
            </div>

            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
              className="relative mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-500/20 text-emerald-300"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/25" />
              <IoCheckmarkCircle size={38} className="relative" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.35 }}
              className="relative"
            >
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100">
                <IoSparkles /> {text.purchaseComplete}
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">{text.title}</h1>
              <p className="mt-3 text-sm text-emerald-100/95 sm:text-base">
                {text.subtitle}
              </p>
            </motion.div>

            <motion.div
              animate={{ boxShadow: ['0 0 0 rgba(251, 191, 36, 0)', '0 0 0 6px rgba(251, 191, 36, 0.14)', '0 0 0 rgba(251, 191, 36, 0)'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mt-6 rounded-2xl border-2 border-amber-300/70 bg-linear-to-r from-amber-400/20 via-orange-300/16 to-amber-400/20 p-5 text-left shadow-lg shadow-amber-900/20"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-300/25 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-amber-50">
                <IoMailOpenOutline className="text-base" /> {text.importantMessage}
              </div>

              <p className="text-base leading-relaxed font-semibold text-amber-50 sm:text-lg">
                {text.checkEmail}
              </p>

              <p className="mt-2 text-sm leading-relaxed text-amber-100 sm:text-base">
                {text.passwordNotice}
              </p>

              <p className="mt-2 text-sm leading-relaxed font-semibold text-amber-50 sm:text-base">
                {text.existingAccountNotice}
              </p>
            </motion.div>

            {accountCreated ? (
              <p className="mt-3 text-sm text-emerald-100/95">
                {text.accountCreated}
              </p>
            ) : null}

            {orderNumber ? (
              <p className="mt-3 text-sm font-medium text-cyan-200">{text.orderNumber}: {orderNumber}</p>
            ) : null}

            <div className="relative mt-7 flex justify-center">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <span className="pointer-events-none absolute -inset-2 rounded-2xl bg-emerald-400/25 blur-xl" />
                <Button variant="primary" onClick={() => router.push('/active-book')}>
                  {text.startReading}
                </Button>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <PurchaseSuccessContent />
    </Suspense>
  );
}
