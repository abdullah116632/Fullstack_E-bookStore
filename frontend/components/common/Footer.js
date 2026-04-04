'use client';

import Link from 'next/link';
import { FaBook, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white/80 text-slate-600 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-linear-to-br from-teal-600 to-cyan-600 p-2.5">
                <FaBook className="text-white text-lg" />
              </div>
              <div>
                <span className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-bold text-transparent">EBook</span>
                <p className="text-xs text-slate-500">Marketplace</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Your ultimate destination for discovering, reading, and publishing amazing books worldwide.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-sky-50 hover:text-sky-600">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-pink-50 hover:text-pink-600">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-teal-50 hover:text-teal-600">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Readers */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">For Readers</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  My Library
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Recommendations
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Publishers */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">For Publishers</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Publish a Book
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <p className="text-slate-500">
              © {currentYear} EBook Marketplace. All rights reserved.
            </p>
            <p className="text-center text-slate-500">
              Made with <span className="text-rose-500">❤</span> for book lovers everywhere
            </p>
            <p className="text-right text-slate-500">
              <span className="bg-linear-to-r from-teal-700 to-cyan-600 bg-clip-text font-semibold text-transparent">Version 1.0.0</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
