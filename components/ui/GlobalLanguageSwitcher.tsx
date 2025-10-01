import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const languages: { [key: string]: { short: string; nativeName: string } } = {
  ar: { short: 'AR', nativeName: 'العربية' },
  en: { short: 'EN', nativeName: 'English' },
  fr: { short: 'FR', nativeName: 'Français' },
};

const GlobalLanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentLangCode = i18n.resolvedLanguage || 'ar';
  const currentLang = languages[currentLangCode] || languages['ar'];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);


  return (
    <div ref={wrapperRef} className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-gray-200/50 hover:bg-gray-50 transition-colors px-4 py-2"
          aria-label="Change language"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="font-semibold text-sm text-gray-700">{currentLang.short}</span>
          <ChevronDown className={`w-4 h-4 text-gray-600 ml-1 rtl:ml-0 rtl:mr-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-36 bg-white rounded-lg shadow-xl border animate-fade-in-down origin-top py-1">
              {Object.keys(languages).map((lng) => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={`w-full text-left rtl:text-right px-4 py-2 text-sm transition-colors ${
                    currentLangCode === lng
                      ? 'font-bold text-[#D4AF37] bg-amber-50/80'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {languages[lng].nativeName}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLanguageSwitcher;