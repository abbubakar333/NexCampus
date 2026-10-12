import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Landing = () => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center text-primary-600 font-bold text-2xl">
            NexCampus
          </div>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2">
              {t('login')}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl mb-6">
          <span className="block">Smart Campus Platform</span>
          <span className="block text-primary-600">for Modern Education</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-slate-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl mb-10">
          Centralize attendance, leaves, gate passes, complaints, and notices in one unified platform designed for students, faculty, and administrators.
        </p>
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 shadow-sm"
          >
            {t('login')}
          </Link>
        </div>
      </main>
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} NexCampus. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
