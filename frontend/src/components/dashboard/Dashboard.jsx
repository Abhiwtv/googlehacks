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
    <div className="space-y-8 pb-12">
      {/* Flattened Enterprise Hero Banner */}
      <div className="pb-8 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm">
              National Health Supply Chain Audit Portal
            </span>
            <span className="text-xs text-slate-500 font-mono">Scope: <strong className="text-slate-900 font-bold">{activeFacility}</strong></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 m-0">
            Welcome, Health Records Officer
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed m-0 pt-1">
            Digitize paper medicine registers with AI Vision (Gemini Multimodal OCR), audit stock transactions, and ensure 100% traceability for government health facilities.
          </p>
        </div>

        {/* Secondary Action Button */}
        <button
          onClick={() => loadSampleDocument(activeFacility)}
          className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer shrink-0"
        >
          ⚡ Load Demo Register Sample
        </button>
      </div>

      {/* 4 KPI Metrics - De-boxed Inline Grid */}
      <div className="py-6 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
        {/* Metric 1 */}
        <div className="px-4 first:pl-0 last:pr-0 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Pending Verification</p>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {pendingDocument ? '1' : '0'}
          </div>
          <p className="text-xs text-slate-500 font-medium m-0">
            {pendingDocument ? '⚠️ Requires Human Review' : '✓ Buffer Clear'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="px-4 first:pl-0 last:pr-0 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Ledger Events ({activeFacility})</p>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {loading ? '...' : facilityEventCount}
          </div>
          <p className="text-xs text-slate-500 font-medium m-0">
            Immutable audit entries
          </p>
        </div>

        {/* Metric 3 */}
        <div className="px-4 first:pl-0 last:pr-0 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">OCR Accuracy Target</p>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            99.2%
          </div>
          <p className="text-xs text-slate-500 font-medium m-0">
            Gemini Vision AI Pipeline
          </p>
        </div>

        {/* Metric 4 */}
        <div className="px-4 first:pl-0 last:pr-0 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Active Facilities</p>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            4
          </div>
          <p className="text-xs text-slate-500 font-medium m-0">
            PHC, CHC &amp; District Hospitals
          </p>
        </div>
      </div>

      {/* Core Public Service Operations Section */}
      <div className="py-4 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight m-0">
          Core Public Service Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          {/* Action 1 */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm inline-block">
                01
              </span>
              <h3 className="font-bold text-slate-900 text-base tracking-tight m-0">
                Ingest &amp; OCR Stock Register
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed m-0">
                Upload paper stock register photos or capture directly using camera snapshot for Gemini OCR structured field extraction.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ingestion')}
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer w-full text-center flex items-center justify-center gap-1.5"
            >
              <span>Scan New Register</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Action 2 */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm inline-block">
                02
              </span>
              <h3 className="font-bold text-slate-900 text-base tracking-tight m-0">
                HITL Verification Workspace
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed m-0">
                Split-screen pan &amp; zoom image inspection against OCR extracted JSON. Cross-check medicine counts, fix errors, and commit to ledger.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('hitl')}
              className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer w-full text-center flex items-center justify-center gap-1.5"
            >
              <span>{pendingDocument ? 'Review Active Buffer (1)' : 'Open HITL Workspace'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Action 3 */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm inline-block">
                03
              </span>
              <h3 className="font-bold text-slate-900 text-base tracking-tight m-0">
                Audit Trail &amp; Traceability
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed m-0">
                Query facility event timeline, trace specific medicine batch movements (received, dispensed, adjusted), and print compliance reports.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer w-full text-center flex items-center justify-center gap-1.5"
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
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight m-0">
            Recent Audit Events for {activeFacility}
          </h2>
          <button
            onClick={() => setActiveTab('audit')}
            className="text-sm font-semibold text-slate-900 hover:text-slate-700 cursor-pointer"
          >
            View All Events &rarr;
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-md border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 m-0 font-medium">No committed ledger events found for {activeFacility} yet.</p>
            <p className="text-xs text-slate-400 mt-1">Upload a register photo or click "Load Demo Register Sample" above to test!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border-t border-slate-200">
            {recentEvents.map((evt) => (
              <div key={evt.event_id || Math.random()} className="py-3.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm font-mono">
                    {evt.event_type}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {evt.data?.medicine ? `${evt.data.medicine} (Batch: ${evt.data.batch || 'N/A'})` : `Document Verified: ${evt.data?.document_type || 'Stock Register'}`}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-xs flex items-center gap-2">
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
