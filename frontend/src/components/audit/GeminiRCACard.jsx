import React, { useState, useEffect, useMemo } from 'react';
import { fetchRCAAnalysis } from '../../services/api';

export default function GeminiRCACard({ selectedFacility = 'PHC-042', events = [] }) {
  const [selectedMedicine, setSelectedMedicine] = useState('Paracetamol 500mg Tablets');
  const [rcaData, setRcaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRunInitial, setHasRunInitial] = useState(false);

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
    setHasRunInitial(true);
    try {
      const data = await fetchRCAAnalysis(selectedFacility, med);
      setRcaData(data);
    } catch (err) {
      console.error('RCA Analysis fetch error:', err);
      setError('Failed to complete Gemini forensic cross-audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunRca(selectedMedicine);
  }, [selectedFacility]);

  // Color helper for Verdict banner & badges (Light Theme)
  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'LEGITIMATE_SURGE':
        return {
          cardBg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: '✓',
          label: 'LEGITIMATE SURGE',
        };
      case 'SUSPECTED_PHANTOM_LEAKAGE':
        return {
          cardBg: 'bg-rose-50/90 border-rose-200 text-rose-950',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
          icon: '🚨',
          label: 'SUSPECTED PHANTOM LEAKAGE',
        };
      case 'OFF_HOURS_TAMPERING':
        return {
          cardBg: 'bg-purple-50/80 border-purple-200 text-purple-900',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: '⚠️',
          label: 'OFF-HOURS TAMPERING DETECTED',
        };
      case 'OVER_DISPENSING':
      default:
        return {
          cardBg: 'bg-amber-50/80 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: '⚠️',
          label: 'CLINICAL OVER-DISPENSING',
        };
    }
  };

  const verdictInfo = getVerdictStyle(rcaData?.verdict);
  const fraudRiskPct = Math.round((rcaData?.fraud_risk_score || 0) * 100);
  const confidencePct = Math.round((rcaData?.confidence_score || 0.95) * 100);
  const unaccountedUnits = rcaData?.discrepancy_delta?.unaccounted_units || 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-800 space-y-4 transition-all duration-300 ease-in-out">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-900 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono border border-blue-800">
              ⚡ Gemini 2.5 Flash Grounded
            </span>
            <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
              Scope: {selectedFacility}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 m-0 tracking-tight flex items-center gap-2">
            <span>✨</span> AI Grounded Root Cause Analysis &amp; Forensic Cross-Audit
          </h3>
        </div>

        {/* Medicine Selector & Action Button */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedMedicine}
            onChange={(e) => {
              setSelectedMedicine(e.target.value);
              handleRunRca(e.target.value);
            }}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
          >
            {availableMedicines.map((med) => (
              <option key={med} value={med}>{med}</option>
            ))}
          </select>

          <button
            onClick={() => handleRunRca(selectedMedicine)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
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
              <span>🔍 Run Forensic Cross-Audit</span>
            )}
          </button>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-pulse">
          <div className="h-14 bg-slate-200/70 rounded-lg w-full"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-slate-200/70 rounded-lg"></div>
            <div className="h-16 bg-slate-200/70 rounded-lg"></div>
            <div className="h-16 bg-slate-200/70 rounded-lg"></div>
          </div>
          <div className="h-20 bg-slate-200/70 rounded-lg w-full"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
          ❌ {error}
        </div>
      ) : rcaData ? (
        <div className="space-y-4 transition-all duration-300">
          {/* Verdict Banner & Fraud Risk Bar */}
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${verdictInfo.cardBg}`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${verdictInfo.badgeBg}`}>
                  {verdictInfo.icon} {verdictInfo.label}
                </span>
                <span className="text-xs font-mono text-slate-600">
                  Confidence: <strong className="text-slate-900">{confidencePct}%</strong>
                </span>
              </div>
              <p className="text-xs text-slate-700 m-0 mt-1">
                Target Audit Item: <strong className="text-slate-900">{rcaData.medicine}</strong> at <strong className="text-slate-900">{rcaData.facility_id}</strong>
              </p>
            </div>

            {/* Fraud Risk Index Badge */}
            <div className="bg-white/90 border border-slate-200 p-2.5 rounded-xl flex items-center gap-3 shadow-2xs shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-mono block font-bold">FRAUD RISK INDEX</span>
                <span className={`text-sm font-extrabold font-mono ${fraudRiskPct > 35 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {fraudRiskPct}% {fraudRiskPct > 35 ? 'HIGH RISK' : 'LOW RISK'}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold ${
                fraudRiskPct > 35 ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-emerald-300 bg-emerald-50 text-emerald-800'
              }`}>
                {fraudRiskPct}%
              </div>
            </div>
          </div>

          {/* Metric Boxes (Discrepancy Delta Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-center">
              <span className="text-slate-500 text-[11px] font-semibold block mb-0.5">TOTAL OUTFLOWS</span>
              <strong className="text-xl font-bold text-slate-900">
                {rcaData.discrepancy_delta?.total_units_depleted || 0}
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Logged Register Units</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-center">
              <span className="text-blue-900 text-[11px] font-semibold block mb-0.5">CLINICALLY JUSTIFIED</span>
              <strong className="text-xl font-bold text-blue-900">
                {rcaData.discrepancy_delta?.clinically_justified_units || 0}
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">OPD Symptom Standard Dosing</span>
            </div>

            <div className={`border rounded-lg p-3 text-center transition-all ${
              unaccountedUnits > 0
                ? 'bg-rose-50/80 border-rose-200 text-rose-800'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
            }`}>
              <span className="text-[11px] font-bold block mb-0.5">UNACCOUNTED DELTA</span>
              <strong className="text-xl font-bold">
                {unaccountedUnits}
              </strong>
              <span className="text-[10px] opacity-80 block mt-0.5">Variance Margin</span>
            </div>
          </div>

          {/* Executive Summary Callout Box */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider m-0 flex items-center gap-2">
              <span>📝</span> Gemini Executive Forensic Summary
            </h4>
            <p className="text-xs text-slate-700 m-0 leading-relaxed font-sans pt-1">
              {rcaData.executive_summary}
            </p>
          </div>

          {/* Two-Column Grid: Forensic Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <h5 className="font-bold text-slate-900 m-0 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <span>🩺</span> OPD Symptom &amp; Dosage Plausibility
              </h5>
              <div className="space-y-2 text-[11px] text-slate-700 pt-1">
                <div>
                  <strong className="text-blue-900 block font-semibold">Symptom Correlation:</strong>
                  <span>{rcaData.forensic_breakdown?.symptom_correlation}</span>
                </div>
                <div>
                  <strong className="text-blue-900 block font-semibold">Clinical Dosage Plausibility:</strong>
                  <span>{rcaData.forensic_breakdown?.dosage_plausibility}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <h5 className="font-bold text-slate-900 m-0 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <span>🌡️</span> Environmental &amp; Seasonal Factor Plausibility
              </h5>
              <div className="space-y-2 text-[11px] text-slate-700 pt-1">
                <div>
                  <strong className="text-blue-900 block font-semibold">Environmental Vector Influence:</strong>
                  <span>{rcaData.forensic_breakdown?.environmental_plausibility}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Vigilance Protocols Checklist */}
          {rcaData.actionable_protocols && rcaData.actionable_protocols.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <h5 className="font-bold text-amber-900 text-xs m-0 uppercase tracking-wider flex items-center gap-2">
                <span>🛡️</span> Actionable Vigilance Protocols
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700 m-0 pl-4 list-disc font-sans">
                {rcaData.actionable_protocols.map((proto, idx) => (
                  <li key={idx} className="leading-snug">
                    {proto}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
