import React, { useState, useEffect } from 'react';
import { checkApiHealth } from '../../services/api';
import VoiceNavigator from '../common/VoiceNavigator';
import LanguageSelector from '../common/LanguageSelector';
import { ROLE_ALLOWED_TABS } from '../../constants/personas';

export default function Header({
  currentUser,
  activeFacility,
  setActiveFacility,
  onSignOut,
  setActiveTab,
  activeLang = 'en',
  setActiveLang,
  voiceLang = 'en-IN',
  setVoiceLang,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const verifyApi = async () => {
      const isHealthy = await checkApiHealth();
      if (isMounted) setApiOnline(isHealthy);
    };
    verifyApi();
    const healthInterval = setInterval(verifyApi, 15000);
    return () => {
      isMounted = false;
      clearInterval(healthInterval);
    };
  }, []);

  const user = currentUser || {
    actorId: 'USER_REC_042',
    name: 'Sunita Sharma',
    roleTitle: 'Health Records Officer',
    facilityName: 'Primary Health Centre (PHC-042)',
    canSwitchFacility: false,
    role: 'clerk',
  };

  const actorIdDisplay = user.actorId || user.id || 'USER_REC_042';
  const allowedTabs = ROLE_ALLOWED_TABS[user.role] || [];

  return (
    <header className="bg-white border-b border-slate-200 font-['Tenor_Sans',sans-serif]">
      {/* Institutional Top Bar */}
      <div className="bg-[#063b70] px-4 py-2 border-b border-[#052d56] text-xs text-blue-100 flex flex-wrap justify-between items-center gap-2 font-mono">
        <div className="flex items-center gap-3 font-medium text-white">
          <span>National Medical Stock Traceability &amp; Ledger System</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100">
          {/* Voice Command Navigation */}
          <VoiceNavigator
            onNavigate={(tab) => setActiveTab && setActiveTab(tab)}
            allowedTabs={allowedTabs}
            onSignOut={onSignOut}
            voiceLang={voiceLang}
          />

          <span className="hidden sm:inline text-blue-300">|</span>

          {/* Google Translate Language Selector */}
          <LanguageSelector
            currentLang={activeLang}
            onLanguageChange={(lang) => {
              if (setActiveLang) setActiveLang(lang.code);
              if (setVoiceLang) setVoiceLang(lang.voiceLang);
            }}
          />

          <span className="hidden sm:inline text-blue-300">|</span>

          {/* Locked Official Session Identity */}
          <span className="inline-flex items-center gap-1.5 bg-[#04284d] text-white px-2.5 py-1 rounded border border-blue-400/30 text-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Actor ID: <strong className="text-white font-bold">{actorIdDisplay}</strong> ({user.name} • {user.roleTitle})</span>
          </span>

          <span className="hidden sm:inline text-blue-300">|</span>

          <span>{currentTime.toLocaleTimeString('en-IN', { hour12: false })} IST</span>

          <div className="flex items-center gap-1.5 bg-[#052d56] px-2 py-0.5 rounded border border-blue-900">
            <span className={`h-2 w-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-[11px] font-semibold tracking-wide uppercase text-white">
              {apiOnline ? 'Backend Online' : 'Backend Offline'}
            </span>
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="bg-rose-900/50 hover:bg-rose-800 text-white border border-rose-400/30 text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer font-sans transition"
              title="Sign Out of Firebase Gateway Session"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main Portal Header */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 m-0 leading-tight">
              National Health Inventory Ledger
            </h1>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              OCR Inventory Ingestion, Human-in-the-Loop Review Buffer &amp; Immutable Audit Traceability
            </p>
          </div>
        </div>

        {/* Facility Tenancy Jurisdiction Bar */}
        {!user.canSwitchFacility ? (
          /* Facility Locked Badge for Clerk / Doctor */
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Jurisdiction:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {user.facilityName} (Facility-Locked)
            </span>
          </div>
        ) : (
          /* Interactive Statewide Audit Switcher for Auditor */
          <div className="flex flex-col items-end gap-1 self-stretch md:self-auto bg-slate-50 p-2 rounded-md border border-slate-200">
            <label htmlFor="header-facility-select" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1 whitespace-nowrap">
              Statewide Jurisdiction Audit Switcher:
            </label>
            <select
              id="header-facility-select"
              value={activeFacility}
              onChange={(e) => setActiveFacility(e.target.value)}
              className="bg-white text-slate-900 text-xs font-semibold rounded-md px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-2xs w-full"
            >
              <option value="PHC-042">Primary Health Centre (PHC-042)</option>
              <option value="CHC-101">Community Health Centre (CHC-101)</option>
              <option value="DH-88">District Hospital (DH-88)</option>
              <option value="PHC-019">Primary Health Centre (PHC-019)</option>
            </select>
          </div>
        )}
      </div>
    </header>
  );
}
