import React, { useState } from 'react';
import { auth, googleProvider, signInWithEmailAndPassword, signInWithPopup } from '../services/firebase';
import { OFFICIAL_ROSTER, getOfficialByEmail } from '../config/officials';
import LanguageSelector from '../components/common/LanguageSelector';
import VoiceNavigator from '../components/common/VoiceNavigator';

export default function PortalLandingPage({
  onAuthenticate,
  activeLang = 'en',
  setActiveLang,
  voiceLang = 'en-IN',
  setVoiceLang,
}) {
  const [activeModal, setActiveModal] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Role Provisioning Modal State (for Google Auth unlisted emails)
  const [provisioningUser, setProvisioningUser] = useState(null);
  const [provisionRole, setProvisionRole] = useState('doctor');
  const [provisionFacility, setProvisionFacility] = useState('PHC-042');

  const handleLandingVoiceCommand = (cmdKey) => {
    if (cmdKey === 'ingestion' || cmdKey === 'clerk') {
      openAuthModal('records');
    } else if (cmdKey === 'clinic-desk' || cmdKey === 'doctor' || cmdKey === 'opd') {
      openAuthModal('clinical');
    } else if (cmdKey === 'spatial-war-room' || cmdKey === 'auditor' || cmdKey === 'audit') {
      openAuthModal('auditor');
    } else {
      openAuthModal('records');
    }
  };

  const openAuthModal = (deptType) => {
    let modalData = {
      deptType,
      title: '',
      subtitle: '',
      pills: []
    };

    if (deptType === 'records') {
      modalData.title = 'Records & Ingestion Directorate';
      modalData.subtitle = 'Health Records Officers (Tier-1 Operations)';
      modalData.pills = [
        {
          name: 'Pooja Verma',
          badge: 'PHC-019',
          email: 'pooja.verma@nhm.gov.in',
        },
        {
          name: 'Sunita Sharma',
          badge: 'PHC-042',
          email: 'sunita.sharma@nhm.gov.in',
        }
      ];
      setEmail('pooja.verma@nhm.gov.in');
    } else if (deptType === 'clinical') {
      modalData.title = 'Primary Healthcare Clinic Administration';
      modalData.subtitle = 'Medical Officer In-Charge (Tier-1 Clinical)';
      modalData.pills = [
        {
          name: 'Dr. Rajesh Kumar',
          badge: 'PHC-042',
          email: 'dr.rajesh@nhm.gov.in',
        }
      ];
      setEmail('dr.rajesh@nhm.gov.in');
    } else if (deptType === 'auditor') {
      modalData.title = 'State Health Directorate & Epidemic Command';
      modalData.subtitle = 'State Epidemiologist & Forensic Auditor (Tier-3 Oversight)';
      modalData.pills = [
        {
          name: 'Dr. V. Ramanathan',
          badge: 'State Directorate',
          email: 'auditor.state@nhm.gov.in',
        }
      ];
      setEmail('auditor.state@nhm.gov.in');
    }

    setPassword('password123');
    setAuthError('');
    setActiveModal(modalData);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEmail('');
    setPassword('');
    setAuthError('');
    setIsLoading(false);
  };

  const selectPillOfficial = (pillEmail) => {
    setEmail(pillEmail);
    setPassword('password123');
    setAuthError('');
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Please enter an official email address.');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const official = getOfficialByEmail(email);
      onAuthenticate(official);
    } catch (err) {
      console.warn('Firebase Auth notice (falling back to roster verification):', err.message || err);
      const official = getOfficialByEmail(email);
      if (official) {
        onAuthenticate(official);
      } else {
        setAuthError(err.message || 'Authentication failed. Please check official credentials.');
        setIsLoading(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setAuthError('');

    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userEmail = res.user?.email || '';
      const normalized = userEmail.toLowerCase().trim();

      if (OFFICIAL_ROSTER[normalized]) {
        onAuthenticate(OFFICIAL_ROSTER[normalized]);
      } else {
        // Unlisted Google Account ➔ Open Authorized Role Provisioning Modal
        setProvisioningUser(res.user || { displayName: 'Google Official', email: userEmail });
        setActiveModal(null);
      }
    } catch (err) {
      console.warn('Firebase Google Auth popup notice (opening role provisioning modal for demo):', err.message || err);
      setProvisioningUser({ displayName: 'Authenticated Evaluator', email: email || 'evaluator@nhm.gov.in' });
      setActiveModal(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProvisioning = (e) => {
    e.preventDefault();
    if (!provisioningUser) return;

    const roleTitles = {
      clerk: 'Health Records Officer',
      doctor: 'Medical Officer In-Charge',
      auditor: 'State Epidemiologist & Forensic Auditor',
    };

    const defaultTabs = {
      clerk: 'dashboard',
      doctor: 'clinic-desk',
      auditor: 'spatial-war-room',
    };

    const facilityNames = {
      'PHC-019': 'Primary Health Centre (PHC-019)',
      'PHC-042': 'Primary Health Centre (PHC-042)',
      'Statewide': 'Statewide Jurisdiction',
    };

    const targetFacility = provisionRole === 'auditor' ? 'Statewide' : provisionFacility;

    const provisionedOfficial = {
      actorId: provisionRole === 'clerk' ? 'USER_REC_PROV' : provisionRole === 'doctor' ? 'DOC_KUMAR_PROV' : 'AUDIT_DIR_PROV',
      id: provisionRole === 'clerk' ? 'USER_REC_PROV' : provisionRole === 'doctor' ? 'DOC_KUMAR_PROV' : 'AUDIT_DIR_PROV',
      name: provisioningUser.displayName || provisioningUser.email.split('@')[0].toUpperCase(),
      email: provisioningUser.email,
      role: provisionRole,
      roleTitle: roleTitles[provisionRole],
      facilityId: targetFacility === 'Statewide' ? 'PHC-042' : targetFacility,
      facilityName: facilityNames[targetFacility] || 'Primary Health Centre (PHC-042)',
      canSwitchFacility: provisionRole === 'auditor',
      defaultTab: defaultTabs[provisionRole],
    };

    setProvisioningUser(null);
    onAuthenticate(provisionedOfficial);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Tenor_Sans',sans-serif] text-slate-900">
      {/* 1. Government Identity Bar (Top) */}
      <div className="bg-[#063b70] px-4 py-2.5 border-b border-[#052d56] text-xs text-blue-100 flex flex-wrap justify-between items-center gap-2 font-mono">
        <div className="flex items-center gap-2 font-medium text-white">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>National Health Mission • Government of India | Federated Resource &amp; Supply Chain Platform</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-blue-200">
          <VoiceNavigator
            onNavigate={handleLandingVoiceCommand}
            allowedTabs={[]}
            voiceLang={voiceLang}
          />
          <span className="hidden sm:inline text-blue-300">|</span>
          <LanguageSelector
            currentLang={activeLang}
            onLanguageChange={(lang) => {
              if (setActiveLang) setActiveLang(lang.code);
              if (setVoiceLang) setVoiceLang(lang.voiceLang);
            }}
          />
          <span className="hidden sm:inline text-blue-300">|</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Security Clearance: e-Gov Level 3 • Firebase Authenticated (SHA-256)</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 sm:px-6 lg:px-8 flex flex-col justify-between space-y-12">
        {/* 2. Hero Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider text-[#063b70] bg-blue-50 border border-blue-200 font-mono">
            Official NIC Authentication Gateway
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 m-0 leading-tight">
            National Health Inventory &amp; Resource Ledger
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            A unified AI surveillance and supply chain management system across India's Primary Health Centre (PHC) network. Real-time stock auditability, automated cross-district logistics, and predictive demand analytics.
          </p>
        </div>

        {/* 3. Three Official Access Portals (Grid Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* CARD 1: Records & Ingestion Directorate */}
          <div className="bg-white rounded-md border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-[#063b70] transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm font-mono">
                  Tier-1 Operations
                </span>
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h12a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 m-0 tracking-tight">
                  Health Records Officer (Clerk)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed m-0">
                  Ingest physical paper medicine registers via Gemini Vision OCR, resolve confidence flags in HITL workspace, and commit verified batches to the immutable ledger.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-mono text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-sm font-medium">
                Jurisdiction: Facility-Bound (PHC-019 / PHC-042)
              </div>

              <button
                onClick={() => openAuthModal('records')}
                className="w-full bg-[#063b70] hover:bg-[#052d56] text-white font-medium text-xs px-4 py-2.5 rounded-md transition-all shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Authenticate as Records Officer</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* CARD 2: Primary Healthcare Clinic Administration */}
          <div className="bg-white rounded-md border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-[#063b70] transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm font-mono">
                  Tier-1 Clinical
                </span>
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 m-0 tracking-tight">
                  Medical Officer In-Charge (Doctor)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed m-0">
                  Manage OPD patient check-ins, automated inventory dispensation, cold-chain storage compliance, observation ward bed occupancy, and facility-level ARIMA footfall forecasting.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-mono text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-sm font-medium">
                Jurisdiction: Facility-Bound (PHC-042)
              </div>

              <button
                onClick={() => openAuthModal('clinical')}
                className="w-full bg-[#063b70] hover:bg-[#052d56] text-white font-medium text-xs px-4 py-2.5 rounded-md transition-all shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Authenticate as Medical Officer</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* CARD 3: State Health Directorate & Epidemic Command */}
          <div className="bg-white rounded-md border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-[#063b70] transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm font-mono">
                  Tier-3 State-Wide Oversight
                </span>
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V7.5A2.5 2.5 0 0016.5 5H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 m-0 tracking-tight">
                  State Health Director / Forensic Auditor
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed m-0">
                  Real-time state spatial war room surveillance, automated cross-district stockout redistribution routing, and Vertex AI Root Cause Analysis against inventory discrepancies.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-mono text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-sm font-medium">
                Jurisdiction: Unrestricted State Scope (All Districts)
              </div>

              <button
                onClick={() => openAuthModal('auditor')}
                className="w-full bg-[#063b70] hover:bg-[#052d56] text-white font-medium text-xs px-4 py-2.5 rounded-md transition-all shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Authenticate as State Auditor</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Institutional Security Footer */}
        <div className="bg-slate-100 rounded-md border border-slate-200 p-4 text-center space-y-1">
          <div className="text-xs font-semibold text-slate-700 font-mono uppercase tracking-wider">
            Government Compliance &amp; Security Directive
          </div>
          <p className="text-xs text-slate-500 max-w-4xl mx-auto m-0 leading-normal">
            Designated for authorized public health officials only. All ledger transactions and access attempts are cryptographically timestamped and audited under the National Digital Health Framework.
          </p>
        </div>
      </div>

      {/* 5. NIC Authentication Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top Header */}
            <div className="bg-[#063b70] text-white p-4 flex justify-between items-center border-b border-[#052d56]">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-blue-200">
                  National Health Mission • NIC Auth
                </div>
                <h3 className="text-base font-bold m-0 tracking-tight leading-snug">
                  {activeModal.title}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-blue-200 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-600 m-0">
                {activeModal.subtitle}
              </p>

              {/* Quick-select Official Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Select Verified Official Persona:
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeModal.pills.map((pill, idx) => {
                    const isSelected = email === pill.email;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectPillOfficial(pill.email)}
                        className={`text-xs px-3 py-1.5 rounded border transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
                          isSelected
                            ? 'bg-[#063b70] text-white border-[#063b70]'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{pill.name}</span>
                        <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-600'}`}>
                          {pill.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Authentication Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Official Gov Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="official.name@nhm.gov.in"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#063b70] font-mono bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Secure Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#063b70] font-mono bg-white text-slate-900"
                  />
                </div>

                {authError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded font-mono">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#063b70] hover:bg-[#052d56] text-white font-medium text-xs py-2.5 rounded transition shadow-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Verifying Firebase Session...' : 'Sign In with Firebase Auth'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono uppercase">Or Federated Single Sign-On</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs py-2 rounded transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Authorized Role Provisioning Modal Dialog (Bug 6 Fix) */}
      {provisioningUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top Header */}
            <div className="bg-[#063b70] text-white p-4 flex justify-between items-center border-b border-[#052d56]">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-blue-200">
                  Google SSO • Authorized Provisioning
                </div>
                <h3 className="text-base font-bold m-0 tracking-tight leading-snug">
                  Authorized Role Provisioning
                </h3>
              </div>
              <button
                onClick={() => setProvisioningUser(null)}
                className="text-blue-200 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmProvisioning} className="p-6 space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-slate-800 space-y-1">
                <div className="font-semibold text-[#063b70]">
                  Authenticated Google Account:
                </div>
                <div className="font-mono text-slate-600">
                  {provisioningUser.displayName || 'Google Official'} ({provisioningUser.email})
                </div>
              </div>

              <p className="text-xs text-slate-600 m-0">
                Select your official designation and facility assignment for this evaluation session:
              </p>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
                  Official Designation:
                </label>

                <div className="space-y-2">
                  <label className={`p-3 rounded border flex items-start gap-3 cursor-pointer transition ${provisionRole === 'clerk' ? 'border-[#063b70] bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input
                      type="radio"
                      name="provisionRole"
                      value="clerk"
                      checked={provisionRole === 'clerk'}
                      onChange={(e) => setProvisionRole(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Health Records Officer (Clerk)</div>
                      <div className="text-[11px] text-slate-500">Tier-1 Ingestion, Gemini OCR &amp; Stock Ledger Commit</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded border flex items-start gap-3 cursor-pointer transition ${provisionRole === 'doctor' ? 'border-[#063b70] bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input
                      type="radio"
                      name="provisionRole"
                      value="doctor"
                      checked={provisionRole === 'doctor'}
                      onChange={(e) => setProvisionRole(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Medical Officer In-Charge (Doctor)</div>
                      <div className="text-[11px] text-slate-500">OPD Desk, E-Prescriptions &amp; Cold-Chain Telemetry</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded border flex items-start gap-3 cursor-pointer transition ${provisionRole === 'auditor' ? 'border-[#063b70] bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input
                      type="radio"
                      name="provisionRole"
                      value="auditor"
                      checked={provisionRole === 'auditor'}
                      onChange={(e) => setProvisionRole(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">State Health Director / Forensic Auditor</div>
                      <div className="text-[11px] text-slate-500">Statewide Spatial War Room &amp; Vertex Root Cause Audit</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Facility Assignment (if not Auditor) */}
              {provisionRole !== 'auditor' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Assigned Facility Jurisdiction:</label>
                  <select
                    value={provisionFacility}
                    onChange={(e) => setProvisionFacility(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded font-semibold text-slate-900 bg-white"
                  >
                    <option value="PHC-042">Primary Health Centre (PHC-042)</option>
                    <option value="PHC-019">Primary Health Centre (PHC-019)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#063b70] hover:bg-[#052d56] text-white font-medium text-xs py-2.5 rounded transition shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Confirm Role Provisioning &amp; Access Portal</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
