import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useContext(LanguageContext);
  
  const langs = {
    en: 'English',
    hi: 'हिंदी',
    or: 'ଓଡ଼ିଆ',
    te: 'తెలుగు'
  };

  return (
    <div className="relative group z-50">
      <button className="flex items-center gap-1.5 p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800">
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:block">{langs[language]}</span>
      </button>
      <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="p-1">
          {Object.entries(langs).map(([code, name]) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${language === code ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-bold' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
