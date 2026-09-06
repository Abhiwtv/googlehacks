import React from 'react';

export default function ConfidenceBadge({ confidenceScore = 0.95, requiresHumanReview = false }) {
  const percent = Math.round(confidenceScore * 100);
  const isHigh = percent >= 90 && !requiresHumanReview;
  const isMedium = percent >= 75 && percent < 90;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Confidence Score Pill */}
      <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border shadow-2xs ${
        isHigh
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
          : isMedium
          ? 'bg-amber-50 text-amber-900 border-amber-300'
          : 'bg-rose-50 text-rose-900 border-rose-300'
      }`}>
        <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}></span>
        <span>OCR Confidence: <strong>{percent}%</strong></span>
      </div>

      {/* Review Required Pill */}
      {requiresHumanReview ? (
        <span className="bg-amber-500 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs animate-bounce">
          ⚠️ Human Verification Required
        </span>
      ) : (
        <span className="bg-blue-50 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-200">
          ✓ Automated Pass
        </span>
      )}
    </div>
  );
}
