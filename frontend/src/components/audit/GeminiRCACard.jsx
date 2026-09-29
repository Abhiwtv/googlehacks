import React, { useState, useMemo } from 'react';
import { fetchRCAAnalysis } from '../../services/api';

export default function GeminiRCACard({ selectedFacility = 'PHC-042', events = [] }) {
  const [selectedMedicine, setSelectedMedicine] = useState('Paracetamol 500mg Tablets');
  const [rcaData, setRcaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rcaResult = rcaData;

  const availableMedicines = useMemo(() => {
    // Comprehensive fallback list including all standard stock catalog items
    const fallbackMeds = [
      "Paracetamol 500mg Tablets",
      "ORS Oral Rehydration Salts 21.8g",
      "Amoxicillin 250mg Capsules",
      "Azithromycin 500mg Tablets",
      "Cetirizine 10mg Syrup 60ml"
    ];

    // Dynamically gather medicine names present in the current ledger events
    const eventMeds = (events || [])
      .map(evt => evt.medicine_name || evt.medicine || evt.data?.medicine)
      .filter(Boolean);

    // Deduplicate and preserve order
    return Array.from(new Set([...eventMeds, ...fallbackMeds]));
  }, [events]);

  const handleRunRca = async (med = selectedMedicine) => {
    setLoading(true);
    setError('');
    setRcaData(null); // Clear previous results while analyzing
    try {
      const data = await fetchRCAAnalysis(selectedFacility, med);
      setRcaData(data);
    } catch (err) {
      console.error('RCA Analysis fetch error:', err);
      setError(err.message || 'Failed to complete Gemini forensic cross-audit');
    } finally {
      setLoading(false);
    }
  };

  const fraudRiskPct = rcaResult?.fraud_risk_score !== undefined
    ? Math.round(rcaResult.fraud_risk_score * 100)
    : (rcaResult?.verdict === "SUSPECTED_PHANTOM_LEAKAGE" || rcaResult?.verdict === "UNEXPLAINED_LOSS" ? 88 : 0);

  const confidencePct = Math.round((rcaResult?.confidence_score ?? 0.95) * 100);

  return (
    <div className="bg-white border-t border-slate-200 pt-6 text-slate-900 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm font-mono">
              Gemini 2.5 Flash Grounded
            </span>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-sm">
              Scope: {selectedFacility}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 m-0">
            AI Grounded Root Cause Analysis &amp; Forensic Cross-Audit
          </h3>
        </div>

        {/* Medicine Selector & Action Button */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedMedicine}
            onChange={(e) => {
              setSelectedMedicine(e.target.value);
            }}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md px-3 py-2 font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none cursor-pointer"
          >
            {availableMedicines.map((med) => (
              <option key={med} value={med}>{med}</option>
            ))}
          </select>

          <button
            onClick={() => handleRunRca(selectedMedicine)}
            disabled={loading}
            className="bg-[#063b70] hover:bg-[#052d56] text-white px-4 py-2 rounded-md font-medium text-sm transition-all shadow-none cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Auditing...</span>
              </>
            ) : (
              <span>Run Forensic Cross-Audit</span>
            )}
          </button>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-5 space-y-4 animate-pulse">
          <div className="h-14 bg-slate-200/70 rounded-md w-full"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-slate-200/70 rounded-md"></div>
            <div className="h-16 bg-slate-200/70 rounded-md"></div>
            <div className="h-16 bg-slate-200/70 rounded-md"></div>
          </div>
          <div className="h-20 bg-slate-200/70 rounded-md w-full"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs font-semibold">
          {error}
        </div>
      ) : (
        <div className="space-y-6 transition-all duration-300">
          {/* Verdict Banner & Fraud Risk Bar */}
          <div className={`p-4 rounded-md border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
            rcaResult?.verdict === 'SUSPECTED_PHANTOM_LEAKAGE' || rcaResult?.verdict === 'UNEXPLAINED_LOSS'
              ? 'bg-rose-50/90 border-rose-200 text-rose-950'
              : rcaResult?.verdict === 'NORMAL_OPERATION' || rcaResult?.verdict === 'LEGITIMATE_SURGE'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-slate-50/80 border-slate-200 text-slate-900'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-sm border ${
                  rcaResult?.verdict === 'SUSPECTED_PHANTOM_LEAKAGE' || rcaResult?.verdict === 'UNEXPLAINED_LOSS'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : rcaResult?.verdict === 'NORMAL_OPERATION' || rcaResult?.verdict === 'LEGITIMATE_SURGE'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  <div className={`font-bold ${rcaResult?.verdict === 'SUSPECTED_PHANTOM_LEAKAGE' || rcaResult?.verdict === 'UNEXPLAINED_LOSS' ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {rcaResult?.verdict ? rcaResult.verdict.replace(/_/g, ' ') : "AWAITING AUDIT"}
                  </div>
                </span>
                {rcaResult && (
                  <span className="text-xs font-mono text-slate-600">
                    Confidence: <strong className="text-slate-900">{confidencePct}%</strong>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 m-0 mt-1">
                Target Audit Item: <strong className="text-slate-900">{rcaResult?.medicine || selectedMedicine}</strong> at <strong className="text-slate-900">{rcaResult?.facility_id || selectedFacility}</strong>
              </p>
            </div>

            {/* Fraud Risk Index Badge */}
            <div className="bg-white border border-slate-200 p-2.5 rounded-md flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-mono block font-bold uppercase tracking-wider">FRAUD RISK INDEX</span>
                <span className={`text-sm font-extrabold font-mono ${fraudRiskPct > 35 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {fraudRiskPct}% {fraudRiskPct > 35 ? 'HIGH RISK' : 'LOW RISK'}
                </span>
              </div>
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-mono text-xs font-bold ${
                fraudRiskPct > 35 ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-emerald-300 bg-emerald-50 text-emerald-800'
              }`}>
                {fraudRiskPct}%
              </div>
            </div>
          </div>

          {/* Metric Cards Grid - Enterprise Flat Inline Grid with Dividers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-md bg-white">
            {/* CARD 1: Total Outflows */}
            <div className="p-4 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Outflows</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {rcaResult?.ledger_metrics?.total_dispensed || rcaResult?.audit_evidence?.total_dispensed || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Logged Register Units</div>
            </div>

            {/* CARD 2: Clinically Justified */}
            <div className="p-4 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Clinically Justified</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {rcaResult 
                  ? (rcaResult.verdict === "NORMAL_OPERATION" || rcaResult.verdict === "LEGITIMATE_SURGE" 
                      ? (rcaResult.ledger_metrics?.total_dispensed || rcaResult.audit_evidence?.total_dispensed || 0) 
                      : 0)
                  : 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">OPD Symptom Standard Dosing</div>
            </div>

            {/* CARD 3: Unaccounted Delta */}
            <div className="p-4 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unaccounted Delta</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {rcaResult?.verdict === "SUSPECTED_PHANTOM_LEAKAGE" || rcaResult?.verdict === "UNEXPLAINED_LOSS"
                  ? (rcaResult.ledger_metrics?.total_dispensed || rcaResult.audit_evidence?.total_dispensed || 0) 
                  : 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Variance Margin</div>
            </div>
          </div>

          {/* Executive Summary Callout Box */}
          <div className="border border-slate-200 p-4 rounded-md bg-white space-y-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
              Gemini Executive Forensic Summary
            </h4>
            <div className="text-sm text-slate-700 mt-2">
              {rcaResult?.reasoning || rcaResult?.executive_summary || "Click 'Run Forensic Cross-Audit' to generate AI forensic summary."}
            </div>
          </div>

          {/* Two-Column Grid: Forensic Breakdown (if available) */}
          {rcaResult?.forensic_breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 p-4 rounded-md bg-white space-y-2">
                <h5 className="font-bold text-slate-900 m-0 flex items-center gap-1.5 border-b border-slate-200 pb-2 uppercase tracking-wider text-xs">
                  OPD Symptom &amp; Dosage Plausibility
                </h5>
                <div className="space-y-2 text-xs text-slate-700 pt-1">
                  {rcaResult.forensic_breakdown.symptom_correlation && (
                    <div>
                      <strong className="text-slate-900 block font-semibold">Symptom Correlation:</strong>
                      <span>{rcaResult.forensic_breakdown.symptom_correlation}</span>
                    </div>
                  )}
                  {rcaResult.forensic_breakdown.dosage_plausibility && (
                    <div>
                      <strong className="text-slate-900 block font-semibold">Clinical Dosage Plausibility:</strong>
                      <span>{rcaResult.forensic_breakdown.dosage_plausibility}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 p-4 rounded-md bg-white space-y-2">
                <h5 className="font-bold text-slate-900 m-0 flex items-center gap-1.5 border-b border-slate-200 pb-2 uppercase tracking-wider text-xs">
                  Environmental &amp; Seasonal Factor Plausibility
                </h5>
                <div className="space-y-2 text-xs text-slate-700 pt-1">
                  {rcaResult.forensic_breakdown.environmental_plausibility && (
                    <div>
                      <strong className="text-slate-900 block font-semibold">Environmental Vector Influence:</strong>
                      <span>{rcaResult.forensic_breakdown.environmental_plausibility}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actionable Vigilance Protocols Checklist (if available) */}
          {rcaResult?.actionable_protocols && rcaResult.actionable_protocols.length > 0 && (
            <div className="border border-slate-200 p-4 rounded-md bg-white space-y-2">
              <h5 className="font-bold text-amber-900 text-xs m-0 uppercase tracking-wider flex items-center gap-2">
                Actionable Vigilance Protocols
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700 m-0 pl-4 list-disc font-sans">
                {rcaResult.actionable_protocols.map((proto, idx) => (
                  <li key={idx} className="leading-snug">
                    {proto}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
