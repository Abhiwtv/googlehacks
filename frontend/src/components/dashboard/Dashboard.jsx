import React, { useState, useEffect } from 'react';
import { getFacilityAudit } from '../../services/api';

export default function Dashboard({ activeFacility, setActiveTab, pendingDocument, loadSampleDocument }) {
  const [facilityEventCount, setFacilityEventCount] = useState(0);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await getFacilityAudit(activeFacility);
        if (isMounted) {
          setFacilityEventCount(res.total_events || 0);
          setRecentEvents((res.events || []).slice(-5).reverse());
        }
      } catch (err) {
        console.warn('Dashboard fetch stats error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStats();
  }, [activeFacility]);

  return (
    <div className="space-y-6 pb-8">
      {/* Banner Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white relative">
          <div className="max-w-3xl space-y-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded border border-emerald-400/30 uppercase tracking-wider">
              National Health Supply Chain Audit Portal
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white m-0">
              Welcome, Health Records Officer
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Digitize paper medicine registers with AI Vision (Gemini Multimodal OCR), audit stock transactions, and ensure 100% traceability for government health facilities.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-2">
          <span className="font-semibold text-slate-700">Current Facility Scope: <strong className="text-blue-800 font-bold">{activeFacility}</strong></span>
          <div className="flex gap-2">
            <button
              onClick={() => loadSampleDocument(activeFacility)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-3 py-1 rounded shadow-xs text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              ⚡ Load Demo Register Sample
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistical Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider m-0">Pending Verification</p>
            <h3 className="text-3xl font-extrabold text-slate-900 m-0 mt-1">
              {pendingDocument ? '1' : '0'}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium m-0 mt-1">
              {pendingDocument ? '⚠️ Requires Human Review' : 'Buffer Clear'}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider m-0">Ledger Events ({activeFacility})</p>
            <h3 className="text-3xl font-extrabold text-blue-900 m-0 mt-1">
              {loading ? '...' : facilityEventCount}
            </h3>
            <p className="text-[11px] text-blue-600 font-medium m-0 mt-1">
              Immutable audit entries
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider m-0">OCR Accuracy Target</p>
            <h3 className="text-3xl font-extrabold text-emerald-800 m-0 mt-1">
              99.2%
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium m-0 mt-1">
              Gemini Vision AI Pipeline
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider m-0">Active Facilities</p>
            <h3 className="text-3xl font-extrabold text-slate-900 m-0 mt-1">
              4
            </h3>
            <p className="text-[11px] text-slate-500 font-medium m-0 mt-1">
              PHC, CHC & District Hospitals
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-4 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Service Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Core Public Service Operations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Action 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-3 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base m-0 mb-1">
                Ingest & OCR Stock Register
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Upload paper stock register photos or capture directly using camera snapshot for Gemini OCR structured field extraction.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ingestion')}
              className="w-full bg-slate-100 hover:bg-blue-700 hover:text-white text-blue-900 font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Scan New Register</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Action 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base m-0 mb-1">
                HITL Verification Workspace
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Split-screen pan & zoom image inspection against OCR extracted JSON. Cross-check medicine counts, fix errors, and commit to ledger.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('hitl')}
              className="w-full bg-slate-100 hover:bg-amber-600 hover:text-white text-amber-900 font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{pendingDocument ? 'Review Active Buffer (1)' : 'Open HITL Workspace'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Action 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base m-0 mb-1">
                Audit Trail & Traceability
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Query facility event timeline, trace specific medicine batch movements (received, dispensed, adjusted), and print compliance reports.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className="w-full bg-slate-100 hover:bg-emerald-700 hover:text-white text-emerald-900 font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore Audit Timeline</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Ledger Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Recent Audit Events for {activeFacility}
          </h3>
          <button
            onClick={() => setActiveTab('audit')}
            className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
          >
            View All Events &rarr;
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 m-0">No committed ledger events found for {activeFacility} yet.</p>
            <p className="text-xs text-slate-400 mt-1">Upload a register photo or click "Load Demo Register Sample" above to test!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentEvents.map((evt) => (
              <div key={evt.event_id || Math.random()} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    evt.event_type === 'DOCUMENT_VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    evt.event_type === 'MEDICINE_RECEIVED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    evt.event_type === 'MEDICINE_DISPENSED' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {evt.event_type}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {evt.data?.medicine ? `${evt.data.medicine} (Batch: ${evt.data.batch || 'N/A'})` : `Document Verified: ${evt.data?.document_type || 'Stock Register'}`}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2">
                  <span>Actor: {evt.actor_id || 'USER_DOC_17'}</span>
                  <span>•</span>
                  <span>{evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
