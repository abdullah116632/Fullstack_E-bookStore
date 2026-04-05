'use client';

import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';
import Button from '@/components/common/Button';
import { readerAuthService } from '@/services/authService';
import { restoreAuthFromStorage } from '@/store/slices/authSlice';

export default function SetupPasswordPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');

  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setupToken = useMemo(() => searchParams.get('token') || '', [searchParams]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!setupToken) {
      toast.error('সেটআপ লিংকটি সঠিক নয় বা মেয়াদ শেষ হয়েছে।');
      return;
    }

    if (!temporaryPassword.trim()) {
      toast.error('ইমেইলে পাওয়া temporary password দিন।');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('নতুন পাসওয়ার্ড এবং confirm password মিলছে না।');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await readerAuthService.completeAccountSetup({
        token: setupToken,
        temporaryPassword: temporaryPassword.trim(),
        newPassword,
      });

      const token = response.data?.data?.token;
      const user = response.data?.data?.user;

      if (!token || !user) {
        toast.error('লগইন তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।');
        return;
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userType', 'reader');
      dispatch(restoreAuthFromStorage());

      toast.success(response.data?.message || 'পাসওয়ার্ড আপডেট হয়েছে এবং আপনি লগইন হয়েছেন।');
      setTimeout(() => {
        router.push('/active-book');
      }, 600);
    } catch (error) {
      toast.error(error.response?.data?.message || 'পাসওয়ার্ড আপডেট করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />

      <main className="relative flex-1 overflow-hidden bg-transparent pb-16 pt-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-90 bg-linear-to-b from-slate-950 via-slate-900 to-transparent" />

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <section className="mx-auto max-w-xl rounded-3xl border border-cyan-200/20 bg-slate-900/72 p-7 shadow-xl shadow-slate-900/40 backdrop-blur-md lg:p-8">
            <h1 className="text-2xl font-bold text-white">নতুন পাসওয়ার্ড সেট করুন</h1>
            <p className="mt-2 text-sm text-slate-200">
              ইমেইলে পাওয়া temporary password দিয়ে নতুন password সেট করুন। সফল হলে আপনি স্বয়ংক্রিয়ভাবে লগইন হয়ে যাবেন।
            </p>

            {!setupToken ? (
              <div className="mt-6 rounded-2xl border border-red-300/40 bg-red-500/12 p-4 text-red-100">
                লিংকটি invalid বা expired। ইমেইল থেকে নতুন লিংক ব্যবহার করুন।
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-100">Temporary Password</label>
                  <input
                    type="password"
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/75 px-4 py-3 text-base text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                    placeholder="ইমেইলে পাওয়া পাসওয়ার্ড"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-100">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/75 px-4 py-3 text-base text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                    placeholder="নতুন পাসওয়ার্ড"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-100">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/75 px-4 py-3 text-base text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/30"
                    placeholder="আবার নতুন পাসওয়ার্ড দিন"
                    minLength={6}
                    required
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full py-3 text-base" isLoading={isSubmitting}>
                  Password Update করে Login করুন
                </Button>
              </form>
            )}
          </section>
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
