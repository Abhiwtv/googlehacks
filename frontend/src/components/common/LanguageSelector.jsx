import React, { useState, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English', voiceLang: 'en-IN' },
  { code: 'hi', label: 'हिन्दी (Hindi)', voiceLang: 'hi-IN' },
  { code: 'mr', label: 'मराठी (Marathi)', voiceLang: 'mr-IN' },
  { code: 'bn', label: 'বাংলা (Bengali)', voiceLang: 'bn-IN' },
  { code: 'te', label: 'తెలుగు (Telugu)', voiceLang: 'te-IN' },
  { code: 'ta', label: 'தமிழ் (Tamil)', voiceLang: 'ta-IN' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', voiceLang: 'gu-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', voiceLang: 'kn-IN' },
  { code: 'ml', label: 'മലയാളം (Malayalam)', voiceLang: 'ml-IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', voiceLang: 'pa-IN' },
  { code: 'ur', label: 'اردو (Urdu)', voiceLang: 'ur-IN' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)', voiceLang: 'or-IN' }
];

export default function LanguageSelector({ currentLang = 'en', onLanguageChange }) {
  const [selectedLang, setSelectedLang] = useState(currentLang);

  useEffect(() => {
    // Reset body top offset if Google Translate dynamically attempts to push down 40px
    const resetBodyTop = () => {
      if (document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
    };
    
    const interval = setInterval(resetBodyTop, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if googtrans cookie is already set
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match && match[1]) {
      const activeCode = match[1];
      setSelectedLang(activeCode);
      const langObj = LANGUAGES.find((l) => l.code === activeCode);
      if (langObj && onLanguageChange) {
        onLanguageChange(langObj);
      }
    }
  }, []);

  const applyTranslation = (langCode) => {
    setSelectedLang(langCode);
    
    // Set Google Translate standard cookie
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;

    const langObj = LANGUAGES.find((l) => l.code === langCode);
    if (onLanguageChange && langObj) {
      onLanguageChange(langObj);
    }

    // Trigger translation by updating Google Translate hidden combo box if present
    const selectElem = document.querySelector('.goog-te-combo');
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      // Reload page to apply cookie if script hasn't bound the combo
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center gap-1.5 font-sans">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">LANGUAGE:</span>
      <select
        value={selectedLang}
        onChange={(e) => applyTranslation(e.target.value)}
        className="bg-slate-800 text-white text-xs border border-white/25 rounded px-2 py-1 outline-none hover:border-white/50 cursor-pointer font-sans max-w-[150px] truncate"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-slate-900 text-white font-sans py-1">
            {lang.label}
          </option>
        ))}
      </select>

      {/* Hidden container where Google Translate injects its core DOM */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
    </div>
  );
}
