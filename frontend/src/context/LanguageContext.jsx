import React, { createContext, useState, useEffect } from 'react';
import { en } from '../i18n/translations/en';
import { hi } from '../i18n/translations/hi';
import { or } from '../i18n/translations/or';
import { te } from '../i18n/translations/te';

const translations = {
  en: en,
  hi: hi,
  or: or,
  te: te,
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('appLanguage', lang);
    }
  };

  const t = (key) => {
    const defaultDict = translations['en'];
    const selectedDict = translations[language];

    if (selectedDict && selectedDict[key]) {
      return selectedDict[key];
    }
    
    // Fallback to English
    if (defaultDict[key]) {
      return defaultDict[key];
    }

    return key; // If key is completely missing, return key itself
  };

  // Locale mapping for formatting dates and numbers
  const getLocale = () => {
    const map = {
      en: 'en-IN',
      hi: 'hi-IN',
      or: 'or-IN',
      te: 'te-IN'
    };
    return map[language] || 'en-IN';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(getLocale(), {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat(getLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, getLocale, formatCurrency, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
};
