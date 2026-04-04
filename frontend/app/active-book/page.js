'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { IoBook, IoArrowBack, IoEye, IoDownload, IoStarHalf } from 'react-icons/io5';
import Button from '@/components/common/Button';

// Dummy data - Replace with real API call
const PURCHASED_BOOKS = [
  {
    _id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
    purchasedOn: '2024-03-15',
    price: 9.99,
    rating: 4.5,
  },
  {
    _id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverImage: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=600&fit=crop',
    purchasedOn: '2024-02-28',
    price: 8.99,
    rating: 4.8,
  },
  {
    _id: '3',
    title: '1984',
    author: 'George Orwell',
    coverImage: 'https://images.unsplash.com/photo-1543002588-d83a5b814b5d?w=400&h=600&fit=crop',
    purchasedOn: '2024-01-10',
    price: 10.99,
    rating: 4.6,
  },
];

export default function ActiveBooksPage() {
  const router = useRouter();
  const { isAuthenticated, user, userType } = useSelector((state) => state.auth);
  const [books, setBooks] = useState(PURCHASED_BOOKS);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or not a reader
  useEffect(() => {
    if (!isAuthenticated || userType !== 'reader') {
      toast.error('Please login as a reader to access this page');
      router.push('/');
    }
  }, [isAuthenticated, userType, router]);

  const handleReadBook = (bookId) => {
    toast.success('Opening book reader...');
    // TODO: Implement actual book reader functionality
  };

  const handleDownloadBook = (bookId) => {
    toast.loading('Downloading book...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Book downloaded successfully!');
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-transparent pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => router.push('/')}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
          >
            <IoArrowBack /> Back to Home
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-linear-to-br from-teal-600 to-cyan-600 p-3">
                <IoBook className="text-2xl text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900">
                My Books
              </h1>
            </div>
            <p className="text-slate-600">
              You have {books.length} book{books.length !== 1 ? 's' : ''} in your library
            </p>
          </div>
        </motion.div>

        {/* Books Grid */}
        {books.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {books.map((book) => (
              <motion.div
                key={book._id}
                variants={itemVariants}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:border-teal-300"
              >
                {/* Book Cover */}
                <div className="relative overflow-hidden bg-slate-100 h-64">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" />
                </div>

                {/* Book Info */}
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{book.author}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: Math.floor(book.rating) }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                      {book.rating % 1 !== 0 && <IoStarHalf />}
                    </div>
                    <span className="text-xs text-slate-500">({book.rating})</span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>${book.price}</span>
                    <span>
                      {new Date(book.purchasedOn).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => handleReadBook(book._id)}
                    >
                      <IoEye className="text-sm" />
                      <span className="hidden sm:inline">Read</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleDownloadBook(book._id)}
                    >
                      <IoDownload className="text-sm" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white px-8 py-16 text-center"
          >
            <IoBook className="mx-auto mb-4 text-5xl text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Books Yet</h2>
            <p className="text-slate-600 mb-6">Start exploring and purchase books to build your library</p>
            <Button
              variant="primary"
              onClick={() => router.push('/')}
            >
              Browse Books
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
