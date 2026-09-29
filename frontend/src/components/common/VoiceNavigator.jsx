import React, { useState, useEffect, useRef } from 'react';

export default function VoiceNavigator({ onNavigate, allowedTabs = [], onSignOut, voiceLang = 'en-IN' }) {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = voiceLang;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript.toLowerCase().trim();
      handleBilingualCommand(text);
    };

    recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
    if (isListening) {
      try { recognition.start(); } catch (e) {}
    }

    return () => {
      try { recognition.stop(); } catch (e) {}
    };
  }, [isListening, voiceLang, allowedTabs]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setFeedback('');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setFeedback(voiceLang.startsWith('hi') ? 'आदेश बोलें...' : voiceLang.startsWith('mr') ? 'आदेश बोला...' : 'Listening...');
      } catch (e) {}
    }
  };

  const handleBilingualCommand = (cmd) => {
    // 1. Dashboard (Dashboard, Mukhya, Ghar, Home, मुख्य, घर, डैशबोर्ड)
    if (cmd.includes('dashboard') || cmd.includes('home') || cmd.includes('मुख्य') || cmd.includes('घर') || cmd.includes('डैशबोर्ड')) {
      executeNav('dashboard', 'Portal Dashboard');
    }
    // 2. Ingestion (Ingest, Register, Scan, Upload, रजिस्टर, पर्ची, स्कैन)
    else if (cmd.includes('ingest') || cmd.includes('register') || cmd.includes('scan') || cmd.includes('रजिस्टर') || cmd.includes('स्कैन') || cmd.includes('पर्ची')) {
      executeNav('ingestion', 'Register Ingestion');
    }
    // 3. HITL Workspace (HITL, Review, Workspace, जांच, सत्यापन)
    else if (cmd.includes('hitl') || cmd.includes('review') || cmd.includes('workspace') || cmd.includes('जांच') || cmd.includes('सत्यापन')) {
      executeNav('hitl', 'HITL Review Workspace');
    }
    // 4. OPD Desk (OPD, Clinic, Doctor, Patient, मरीज, डॉक्टर, ओपीडी, रुग्णालयात)
    else if (cmd.includes('opd') || cmd.includes('clinic') || cmd.includes('doctor') || cmd.includes('patient') || cmd.includes('मरीज') || cmd.includes('डॉक्टर') || cmd.includes('ओपीडी') || cmd.includes('रुग्ण')) {
      executeNav('clinic-desk', 'OPD Desk');
    }
    // 5. Facility Ops & Beds (Bed, Facility, Cold Chain, बिस्तर, कोल्ड चेन, सुविधा, खाटा)
    else if (cmd.includes('bed') || cmd.includes('facility') || cmd.includes('cold chain') || cmd.includes('बिस्तर') || cmd.includes('सुविधा') || cmd.includes('खाटा')) {
      executeNav('facility-ops', 'Facility Ops & Beds');
    }
    // 6. Demand Forecast (Forecast, Prediction, Demand, मांग, पूर्वानुमान, अंदाज)
    else if (cmd.includes('forecast') || cmd.includes('demand') || cmd.includes('prediction') || cmd.includes('मांग') || cmd.includes('पूर्वानुमान') || cmd.includes('अंदाज')) {
      executeNav('forecast', 'Demand Forecast');
    }
    // 7. Spatial War Room (War Room, Map, Logistics, नक्शा, वॉर रूम)
    else if (cmd.includes('war room') || cmd.includes('spatial') || cmd.includes('map') || cmd.includes('नक्शा') || cmd.includes('वॉर रूम')) {
      executeNav('spatial-war-room', 'Spatial War Room');
    }
    // 8. Audit Trail (Audit, Ledger, History, ऑडिट, हिसाब, खाते)
    else if (cmd.includes('audit') || cmd.includes('trail') || cmd.includes('ledger') || cmd.includes('ऑडिट') || cmd.includes('हिसाब') || cmd.includes('खाते')) {
      executeNav('audit', 'Audit Trail');
    }
    // 9. Sign Out (Log out, Exit, बाहर, बंद, बाहेर)
    else if (cmd.includes('logout') || cmd.includes('sign out') || cmd.includes('exit') || cmd.includes('बाहर') || cmd.includes('बंद') || cmd.includes('बाहेर')) {
      setFeedback(voiceLang.startsWith('hi') ? 'बाहर निकल रहे हैं...' : voiceLang.startsWith('mr') ? 'बाहेर पडत आहे...' : 'Signing out...');
      setTimeout(() => onSignOut && onSignOut(), 800);
    } else {
      setFeedback(`"${cmd}"`);
      setTimeout(() => setFeedback(isListening ? (voiceLang.startsWith('hi') ? 'सुन रहा है...' : voiceLang.startsWith('mr') ? 'ऐकत आहे...' : 'Listening...') : ''), 2500);
    }
  };

  const executeNav = (tabKey, tabLabel) => {
    const normalizedKey = tabKey === 'opd' ? 'clinic-desk'
      : tabKey === 'facility' ? 'facility-ops'
      : tabKey === 'spatial' ? 'spatial-war-room'
      : tabKey;

    if (allowedTabs.length === 0 || allowedTabs.includes(normalizedKey) || allowedTabs.includes(tabKey)) {
      setFeedback(voiceLang.startsWith('hi') ? `${tabLabel} पर जा रहे हैं` : voiceLang.startsWith('mr') ? `${tabLabel} वर जात आहे` : `Navigating to ${tabLabel}`);
      onNavigate(normalizedKey);
      setTimeout(() => setFeedback(voiceLang.startsWith('hi') ? 'सुन रहा है...' : voiceLang.startsWith('mr') ? 'ऐकत आहे...' : 'Listening...'), 2000);
    } else {
      setFeedback(voiceLang.startsWith('hi') ? 'आपकी भूमिका के लिए सीमित है' : voiceLang.startsWith('mr') ? 'आपल्या भूमिकेसाठी मर्यादित' : 'Restricted for your role');
      setTimeout(() => setFeedback(voiceLang.startsWith('hi') ? 'सुन रहा है...' : voiceLang.startsWith('mr') ? 'ऐकत आहे...' : 'Listening...'), 2500);
    }
  };

  if (typeof window === 'undefined' || (!window.SpeechRecognition && !window.webkitSpeechRecognition)) return null;

  return (
    <div className="flex items-center gap-2 font-sans">
      <button
        onClick={toggleListening}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold tracking-wide transition-all border cursor-pointer ${
          isListening
            ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span>{isListening ? (voiceLang.startsWith('hi') ? 'सुन रहा है...' : voiceLang.startsWith('mr') ? 'ऐकत आहे...' : 'Listening...') : 'Voice Nav'}</span>
      </button>

      {feedback && (
        <span className="text-[11px] font-mono text-cyan-300 bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-800/50 max-w-[160px] truncate">
          {feedback}
        </span>
      )}
    </div>
  );
}
