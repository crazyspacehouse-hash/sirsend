"use client";
import { useTranslation } from '@/lib/i18n';
import { Language } from '@/lib/translations';

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
            lang === l.code
              ? 'bg-red-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={l.label}
        >
          <span className="mr-1">{l.flag}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  );
}