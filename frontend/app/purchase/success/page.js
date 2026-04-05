'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoCheckmarkCircle, IoTimeOutline } from 'react-icons/io5';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';

const REDIRECT_SECONDS = 5;

function PurchaseSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const orderNumber = searchParams.get('orderNumber');
  const accountCreated = searchParams.get('accountCreated') === '1';

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeoutId = setTimeout(() => {
      router.push('/active-book');
    }, REDIRECT_SECONDS * 1000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="relative flex-1 overflow-hidden bg-transparent pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-90 bg-linear-to-b from-slate-950 via-slate-900 to-transparent" />

        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 sm:px-6 lg:px-8">
          <section className="w-full rounded-3xl border border-emerald-300/30 bg-slate-900/80 p-7 text-center shadow-xl shadow-slate-900/45 backdrop-blur-md lg:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <IoCheckmarkCircle size={34} />
            </div>

            <h1 className="text-2xl font-bold text-white sm:text-3xl">ক্রয় সফল হয়েছে</h1>
            <p className="mt-3 text-sm text-emerald-100/95 sm:text-base">
              আপনার পেমেন্ট তথ্য সফলভাবে জমা হয়েছে এবং অর্ডার প্রসেসিং চলছে।
            </p>

            <p className="mt-2 text-sm text-cyan-100/95">
              দয়া করে আপনার রিডার ইমেইল চেক করুন। প্রয়োজনীয় আপডেট সেখানে পাঠানো হয়েছে।
            </p>

            {accountCreated ? (
              <p className="mt-2 text-sm text-cyan-100/95">
                নতুন রিডার অ্যাকাউন্ট তৈরি হয়েছে। লগইন তথ্য আপনার ইমেইলে পাঠানো হয়েছে।
              </p>
            ) : null}

            {orderNumber ? (
              <p className="mt-3 text-sm font-medium text-cyan-200">অর্ডার নম্বর: {orderNumber}</p>
            ) : null}

            <div className="mt-6 rounded-2xl border border-cyan-300/35 bg-cyan-500/10 p-4">
              <div className="flex items-center justify-center gap-2 text-cyan-100">
                <IoTimeOutline />
                <span className="text-sm font-medium">{secondsLeft} সেকেন্ড পর আপনার বই পাতায় নেওয়া হবে</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="primary" onClick={() => router.push('/active-book')}>
                এখনই Active Book এ যান
              </Button>
              <Button variant="outline" onClick={() => router.push('/books')}>
                আরও বই দেখুন
              </Button>
            </div>
          </section>
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
