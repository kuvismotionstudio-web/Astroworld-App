import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'pl');

  // Update local state when language changes
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng);
      document.documentElement.setAttribute('lang', lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const changeLanguage = (lng) => {
    if (lng !== currentLanguage) {
      i18n.changeLanguage(lng);
      // The languageChanged event will update the state
    }
  };

  return (
    <div className="language-switcher">
      <button 
        className={`lang-btn ${currentLanguage === 'pl' ? 'active' : ''}`}
        onClick={() => changeLanguage('pl')}
        aria-label={t('common.language_pl') || 'Polski'}
        data-lang="pl"
      >
        PL
      </button>
      <span className="lang-separator">|</span>
      <button 
        className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        aria-label={t('common.language_en') || 'English'}
        data-lang="en"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
