import React, { useState, useEffect } from 'react';
import { checkApiHealth } from '../../services/api';

export default function Header({ activeFacility, setActiveFacility }) {
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

  return (
    <header className="bg-white border-b border-slate-200">
      {/* Institutional Top Bar */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs text-slate-400 flex flex-wrap justify-between items-center gap-2 font-mono">
        <div className="flex items-center gap-3 font-medium text-slate-300">
          <span>National Medical Stock Traceability &amp; Ledger System</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="hidden md:inline">Actor ID: <strong className="text-slate-200">USER_DOC_17</strong></span>
          <span className="hidden sm:inline">|</span>
          <span>{currentTime.toLocaleTimeString('en-IN', { hour12: false })} IST</span>
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <span className={`h-2 w-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-300">
              {apiOnline ? 'Backend Online' : 'Backend Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Portal Header */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          {/* Emblem Icon / Logo */}
          <div className="h-10 w-10 rounded-md bg-slate-900 text-white flex items-center justify-center p-2 shadow-xs shrink-0 font-bold">
            <svg className="w-6 h-6 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.076C3.11 8.574 3 10.273 3 12c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.727-.11-3.426-.382-5.032z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 m-0 leading-tight">
              National Health Inventory Ledger
            </h1>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              OCR Inventory Ingestion, Human-in-the-Loop Review Buffer &amp; Immutable Audit Traceability
            </p>
          </div>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-2.5 self-stretch md:self-auto bg-slate-50 p-2 rounded-md border border-slate-200">
          <label htmlFor="header-facility-select" className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1 whitespace-nowrap">
            Active Facility:
          </label>
          <select
            id="header-facility-select"
            value={activeFacility}
            onChange={(e) => setActiveFacility(e.target.value)}
            className="bg-white text-slate-900 text-xs font-semibold rounded-md px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-2xs"
          >
            <option value="PHC-042">Primary Health Centre (PHC-042)</option>
            <option value="CHC-101">Community Health Centre (CHC-101)</option>
            <option value="DH-88">District Hospital (DH-88)</option>
            <option value="PHC-019">Primary Health Centre (PHC-019)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
