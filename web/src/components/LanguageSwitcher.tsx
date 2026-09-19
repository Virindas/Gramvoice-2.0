import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { LanguageCode } from '../i18n/translations';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'ta', label: 'தமிழ்' },
  ];

  return (
    <div className={`inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 ${className}`}>
      <Globe className="w-4 h-4 text-emerald-700 ml-1" />
      <div className="flex items-center gap-1">
        {languages.map((lang, idx) => (
          <React.Fragment key={lang.code}>
            <button
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === lang.code
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {lang.label}
            </button>
            {idx < languages.length - 1 && <span className="text-slate-300 select-none">|</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
