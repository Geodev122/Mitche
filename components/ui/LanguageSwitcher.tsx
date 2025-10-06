import React from 'react';
import { useTranslation } from 'react-i18next';

const languages: { [key: string]: { nativeName: string } } = {
  ar: { nativeName: 'العربية' },
  en: { nativeName: 'English' },
  fr: { nativeName: 'Français' },
};

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const current = i18n.resolvedLanguage || i18n.language || 'en';

  return (
    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
      {Object.keys(languages).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          className={`text-sm px-3 py-1 rounded-full transition-colors font-semibold ${
            current === lng
              ? 'bg-[#D4AF37] text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          aria-label={`Switch language to ${lng}`}
        >
          {languages[lng].nativeName}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;