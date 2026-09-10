import React, { useState } from 'react';

export default function FacilityOpsView({ activeFacility = 'PHC-042' }) {
  // Cold chain temp state
  const [fridgeTemp, setFridgeTemp] = useState(4.2);
  const [isSterilized, setIsSterilized] = useState(true);
  const [isBiowasteCleared, setIsBiowasteCleared] = useState(true);
  const [isReadinessSubmitted, setIsReadinessSubmitted] = useState(false);

  // Observation Beds State (6 beds for PHC-042)
  const [beds, setBeds] = useState([
    { id: 'Bed-01', patient: 'Ramesh Kumar (Observation)', status: 'Occupied', color: 'amber' },
    { id: 'Bed-02', patient: 'Priya Sharma (Acute Dehydration)', status: 'Critical', color: 'red' },
    { id: 'Bed-03', patient: 'Available', status: 'Available', color: 'green' },
    { id: 'Bed-04', patient: 'Suresh Patel (Post-OPD)', status: 'Occupied', color: 'amber' },
    { id: 'Bed-05', patient: 'Lakshmi Bai (Fever Monitor)', status: 'Occupied', color: 'amber' },
    { id: 'Bed-06', patient: 'Available', status: 'Available', color: 'green' },
  ]);

  const occupiedCount = beds.filter((b) => b.status !== 'Available').length;
  const occupancyPercent = Math.round((occupiedCount / beds.length) * 100);

  const toggleBedStatus = (bedId) => {
    setBeds((prevBeds) =>
      prevBeds.map((bed) => {
        if (bed.id === bedId) {
          if (bed.status === 'Available') {
            return { ...bed, patient: 'New Patient (Observation)', status: 'Occupied', color: 'amber' };
          } else {
            return { ...bed, patient: 'Available', status: 'Available', color: 'green' };
          }
        }
        return bed;
      })
    );
  };

  const handleSubmitReadiness = () => {
    setIsReadinessSubmitted(true);
    setTimeout(() => setIsReadinessSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* View Header & Anti-Fraud Audit Badge */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-900 text-emerald-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
              FEATURE 5 FRONTLINE OPS
            </span>
            <span className="text-xs text-slate-500 font-mono">Scope: <strong className="text-blue-900">{activeFacility}</strong></span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 m-0 tracking-tight mt-1">
            Facility Readiness, Bed Monitoring &amp; Frontline Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 m-0">
            Daily clinical readiness, cold-chain vaccine storage compliance, observation ward bed tracking, and staff presence audit.
          </p>
        </div>

        {/* Anti-Fraud Audit Status Badge */}
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-base">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                Anti-Fraud Audit Status: ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 m-0">
              Dispensing cross-verified against active staff presence
            </p>
          </div>
        </div>
      </div>

      {isReadinessSubmitted && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 text-emerald-950 shadow-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-base">✓</span>
            <span>Morning Readiness Log Submitted &amp; Verified for {activeFacility}! Cold-chain compliance recorded.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-800">Timestamp: {new Date().toLocaleTimeString()}</span>
        </div>
      )}

      {/* Main Grid: Checklist + Bed Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daily Operational Checklist */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                <span>📋 Morning Operational Readiness Log</span>
              </h3>
              <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                Daily Mandate
              </span>
            </div>

            {/* Cold-Chain Refrigerator Temperature Gauge */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  🧊 Vaccine Cold-Chain Refrigerator Temp:
                </span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  Safe / Compliant (2°C – 8°C)
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-blue-900 font-mono">
                  {fridgeTemp.toFixed(1)}°C
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="2.0"
                    max="8.0"
                    step="0.1"
                    value={fridgeTemp}
                    onChange={(e) => setFridgeTemp(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>2.0°C (Min)</span>
                    <span>5.0°C (Target)</span>
                    <span>8.0°C (Max)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sanitization & Bio-Waste Checkbox Items */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Sanitization &amp; Hygiene Clearance:
              </span>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={isSterilized}
                  onChange={(e) => setIsSterilized(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-blue-700 rounded border-slate-300 focus:ring-blue-600 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Morning Sterilization Complete
                  </span>
                  <span className="text-[11px] text-slate-500">
                    OPD desk, clinical counters, and injection equipment disinfected.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={isBiowasteCleared}
                  onChange={(e) => setIsBiowasteCleared(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-blue-700 rounded border-slate-300 focus:ring-blue-600 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Color-Coded Bio-Medical Waste Cleared
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Yellow, Red, and Black bins emptied &amp; sealed per national guidelines.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            onClick={handleSubmitReadiness}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>✓ Submit Morning Readiness Log</span>
          </button>
        </div>

        {/* Right Column: Observation Bed Occupancy Tracker & Staff Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bed Occupancy Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                  <span>🛌 Observation Ward Bed Occupancy</span>
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Real-time bed availability for emergency triage and short-stay observation.
                </p>
              </div>

              {/* Occupancy Summary Pill */}
              <div className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Occupancy:</span>
                <span className="text-blue-900 font-mono">{occupiedCount} / {beds.length} Beds ({occupancyPercent}%)</span>
              </div>
            </div>

            {/* Bed Grid Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {beds.map((bed) => (
                <div
                  key={bed.id}
                  className={`rounded-xl border p-4 shadow-2xs flex flex-col justify-between space-y-3 transition-all ${
                    bed.status === 'Available'
                      ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
                      : bed.status === 'Critical'
                      ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
                      : 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-extrabold text-xs text-slate-800">
                      {bed.id}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        bed.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : bed.status === 'Critical'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Patient / Note:
                    </span>
                    <span className="text-xs font-semibold text-slate-900 block truncate">
                      {bed.patient}
                    </span>
                  </div>

                  {/* Toggle Action */}
                  <button
                    onClick={() => toggleBedStatus(bed.id)}
                    className={`w-full text-xs font-bold py-1.5 rounded-lg border transition-all cursor-pointer ${
                      bed.status === 'Available'
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {bed.status === 'Available' ? '+ Admit Patient' : 'Discharge Bed'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active On-Duty Personnel Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider m-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Verified Active On-Duty Personnel ({activeFacility})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Medical Officer In-Charge</span>
                <span className="text-xs font-bold text-slate-900 block">Dr. Rajesh Kumar</span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Station Pharmacist</span>
                <span className="text-xs font-bold text-slate-900 block">Dr. R. Sharma</span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Staff Nurse (Triage)</span>
                <span className="text-xs font-bold text-slate-900 block">Sister Anitha</span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
