'use client';

import { motion } from 'framer-motion';
import { FaBook, FaUsers, FaChartLine } from 'react-icons/fa';
import Button from '@/components/common/Button';

export default function HeroSection({ onSignupClick, onLoginClick }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const features = [
    {
      icon: FaBook,
      title: 'Curated Collection',
      description: 'Discover quality titles selected across fiction, non-fiction, business, and learning.',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: FaUsers,
      title: 'Author & Publisher Hub',
      description: 'Connect directly with creators, follow releases, and support independent publishing.',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: FaChartLine,
      title: 'Smart Reading Journey',
      description: 'Track progress, save favorites, and build a personal library that grows with you.',
      color: 'from-sky-500 to-blue-500',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-teal-300/35 blur-3xl" />
        <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
      </div>

      {/* Main Hero */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16 text-center"
        >
          <motion.div variants={itemVariants} className="mb-6 inline-block">
            <div className="rounded-full border border-teal-300 bg-white/70 px-4 py-2 text-sm font-semibold tracking-wide text-teal-700 shadow-sm">
              Built for modern readers and publishers
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-7 text-5xl font-bold leading-tight text-slate-900 sm:text-6xl lg:text-7xl"
          >
            A New Way To
            <br />
            <span className="bg-linear-to-r from-teal-600 via-cyan-600 to-orange-500 bg-clip-text text-transparent">
              Read, Publish, Grow
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl"
          >
            Explore standout books, follow the publishers you trust, and build your reading life with a platform designed to feel fast, clear, and premium.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={onSignupClick}
              className="w-full sm:w-auto"
            >
              Create Free Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onLoginClick}
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-20 grid gap-6 md:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-7 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br ${feature.color} shadow-md transition-transform duration-300 group-hover:scale-105`}>
                <feature.icon className="text-white text-2xl" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="leading-relaxed text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-20 grid gap-10 rounded-2xl border border-slate-200 bg-white/70 px-6 py-10 shadow-sm backdrop-blur-sm md:grid-cols-3"
        >
          {[
            { number: '10K+', label: 'Books Published' },
            { number: '100K+', label: 'Active Readers' },
            { number: '50+', label: 'Countries Served' },
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants} className="text-center">
              <p className="mb-2 bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
                {stat.number}
              </p>
              <p className="text-base font-medium text-slate-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-20 rounded-3xl bg-linear-to-r from-teal-600 via-cyan-600 to-sky-600 p-12 text-center text-white shadow-2xl lg:p-16"
        >
          <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to elevate your reading experience?
          </motion.h2>
          <motion.p variants={itemVariants} className="mx-auto mb-8 max-w-2xl text-lg opacity-95">
            Join a platform built to feel modern, simple, and powerful from your first click.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={onSignupClick}
              className="w-full border-white/60 bg-white/90 text-slate-900 hover:bg-white sm:w-auto"
            >
              Start Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onLoginClick}
              className="w-full border-white bg-white/10 text-white hover:bg-white/20 sm:w-auto"
            >
              View Library
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
