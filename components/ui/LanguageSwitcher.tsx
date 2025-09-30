import React from 'react';
import { useTranslation } from 'react-i18next';

const languages: { [key: string]: { nativeName: string } } = {
  ar: { nativeName: 'العربية' },
  en: { nativeName: 'English' },
  fr: { nativeName: 'Français' },
};

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center space-x-1 rtl:space-x-reverse bg-gray-100 rounded-full p-1">
      {Object.keys(languages).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          className={`text-sm px-3 py-1 rounded-full transition-colors font-semibold ${
            i18n.resolvedLanguage === lng
              ? 'bg-white text-[#3A3A3A] shadow-sm'
              : 'bg-transparent text-gray-500 hover:text-[#3A3A3A]'
          }`}
        >
          {languages[lng].nativeName}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
