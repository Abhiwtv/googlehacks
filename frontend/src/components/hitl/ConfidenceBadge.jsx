import React from 'react';

export default function ConfidenceBadge({ confidenceScore = 0.95, requiresHumanReview = false }) {
  const percent = Math.round(confidenceScore * 100);
  const isHigh = percent >= 90 && !requiresHumanReview;
  const isMedium = percent >= 75 && percent < 90;

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono">
      {/* Confidence Score Pill */}
      <div className={`px-2.5 py-1 rounded-sm text-xs font-bold flex items-center gap-1.5 border ${
        isHigh
          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
          : isMedium
          ? 'bg-amber-50 text-amber-900 border-amber-200'
          : 'bg-rose-50 text-rose-900 border-rose-200'
      }`}>
        <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-emerald-600' : isMedium ? 'bg-amber-600' : 'bg-rose-600'}`}></span>
        <span>OCR Confidence: <strong>{percent}%</strong></span>
      </div>

      {/* Review Required Pill */}
      {requiresHumanReview ? (
        <span className="bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs px-2.5 py-1 rounded-sm uppercase tracking-wider">
          Human Verification Required
        </span>
      ) : (
        <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
          Automated Pass
        </span>
      )}
    </div>
  );
}
