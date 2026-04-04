'use client';

import { motion } from 'framer-motion';
import { FaBook, FaUsers, FaChartLine } from 'react-icons/fa';
import Button from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';

export default function HeroSection({ onSignupClick, onLoginClick }) {
  const { t } = useTranslation();

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
      titleKey: 'hero.feature1Title',
      descKey: 'hero.feature1Desc',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: FaUsers,
      titleKey: 'hero.feature2Title',
      descKey: 'hero.feature2Desc',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: FaChartLine,
      titleKey: 'hero.feature3Title',
      descKey: 'hero.feature3Desc',
      color: 'from-sky-500 to-blue-500',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-140 bg-linear-to-b from-slate-900 via-slate-800 to-transparent" />
        <div className="absolute -left-24 -top-10 h-80 w-80 rounded-full bg-cyan-300/18 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-sky-300/18 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-300/14 blur-3xl" />
        <div className="absolute inset-x-0 top-36 h-px bg-linear-to-r from-transparent via-cyan-200/35 to-transparent" />
      </div>

      {/* Main Hero */}
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16 text-center"
        >
          <motion.div variants={itemVariants} className="mb-7 inline-block">
            <div className="rounded-full border border-cyan-200/30 bg-white/12 px-5 py-2 text-sm font-semibold tracking-wide text-cyan-50 shadow-md backdrop-blur-sm">
              {t('hero.badge')}
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-7 text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl"
          >
            {t('hero.mainTitle')}
            <br />
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-slate-200/95 sm:text-xl"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={onSignupClick}
              className="w-full sm:w-auto"
            >
              {t('hero.cta')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onLoginClick}
              className="w-full sm:w-auto"
            >
              {t('hero.ctaSecondary')}
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
              className="group rounded-3xl border border-white/12 bg-slate-900/55 p-7 shadow-md shadow-slate-900/35 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-200/35 hover:bg-slate-900/65 hover:shadow-xl"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${feature.color} shadow-md transition-transform duration-300 group-hover:scale-105`}>
                <feature.icon className="text-white text-2xl" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">{t(feature.titleKey)}</h3>
              <p className="leading-relaxed text-slate-300/95">{t(feature.descKey)}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-20 grid gap-10 rounded-3xl border border-white/12 bg-slate-900/55 px-6 py-10 shadow-md shadow-slate-900/35 backdrop-blur-md md:grid-cols-3"
        >
          {[
            { numberKey: 'hero.stat1Number', labelKey: 'hero.stat1Label' },
            { numberKey: 'hero.stat2Number', labelKey: 'hero.stat2Label' },
            { numberKey: 'hero.stat3Number', labelKey: 'hero.stat3Label' },
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants} className="text-center">
              <p className="mb-2 bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
                {t(stat.numberKey)}
              </p>
              <p className="text-base font-medium text-slate-300/95">{t(stat.labelKey)}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-20 rounded-3xl border border-cyan-200/25 bg-linear-to-r from-slate-900 via-slate-800 to-cyan-900 p-12 text-center text-white shadow-2xl shadow-slate-900/30 lg:p-16"
        >
          <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
            {t('hero.ctaTitle')}
          </motion.h2>
          <motion.p variants={itemVariants} className="mx-auto mb-8 max-w-2xl text-lg opacity-95">
            {t('hero.ctaDescription')}
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={onSignupClick}
              className="w-full border-white/60 bg-white/90 text-slate-900 hover:bg-white sm:w-auto"
            >
              {t('hero.ctaButton')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onLoginClick}
              className="w-full border-white bg-white/10 text-white hover:bg-white/20 sm:w-auto"
            >
              {t('hero.ctaSecondaryButton')}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
