import React, { FC, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languageDirection: { [key: string]: 'rtl' | 'ltr' } = {
  ar: 'rtl',
  en: 'ltr',
  fr: 'ltr',
};

const LanguageManager: FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language.split('-')[0]; // handle cases like en-US
    document.documentElement.lang = currentLang;
    document.documentElement.dir = languageDirection[currentLang] || 'ltr';
  }, [i18n, i18n.language]);

  return <>{children}</>;
};

export default LanguageManager;