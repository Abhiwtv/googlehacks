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
    <div className="space-y-8 pb-8 bg-white">
      {/* View Header & Anti-Fraud Audit Badge */}
      <div className="bg-white border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm font-mono">
              FEATURE 5 FRONTLINE OPS
            </span>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-sm">
              Scope: <strong className="text-slate-900">{activeFacility}</strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 m-0 tracking-tight">
            Facility Readiness, Bed Monitoring &amp; Frontline Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 m-0">
            Daily clinical readiness, cold-chain vaccine storage compliance, observation ward bed tracking, and staff presence audit.
          </p>
        </div>

        {/* Anti-Fraud Audit Status Badge */}
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-sm font-mono flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-sm bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
            SEC
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900"></span>
              <span className="text-xs font-mono font-bold text-slate-900">
                Anti-Fraud Audit Status: ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 m-0 font-sans normal-case">
              Dispensing cross-verified against active staff presence
            </p>
          </div>
        </div>
      </div>

      {isReadinessSubmitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span>Morning Readiness Log Submitted &amp; Verified for {activeFacility}! Cold-chain compliance recorded.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-800">Timestamp: {new Date().toLocaleTimeString()}</span>
        </div>
      )}

      {/* Main Grid: Checklist + Bed Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daily Operational Checklist */}
        <div className="lg:col-span-5 bg-white rounded-md border border-slate-200 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="pb-3 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                Morning Operational Readiness Log
              </h3>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-sm border border-slate-200 uppercase font-mono">
                Daily Mandate
              </span>
            </div>

            {/* Cold-Chain Refrigerator Temperature Gauge */}
            <div className="bg-slate-50 rounded-md border border-slate-200 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Vaccine Cold-Chain Refrigerator Temp:
                </span>
                <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase font-mono">
                  Safe / Compliant (2°C – 8°C)
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
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
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Sanitization &amp; Hygiene Clearance:
              </span>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-md border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={isSterilized}
                  onChange={(e) => setIsSterilized(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Morning Sterilization Complete
                  </span>
                  <span className="text-[11px] text-slate-500">
                    OPD desk, clinical counters, and injection equipment disinfected.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-md border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={isBiowasteCleared}
                  onChange={(e) => setIsBiowasteCleared(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
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
            className="w-full bg-[#063b70] hover:bg-[#052d56] text-white font-medium text-sm px-4 py-2 rounded-md transition-all shadow-none cursor-pointer"
          >
            <span>Submit Morning Readiness Log</span>
          </button>
        </div>

        {/* Right Column: Observation Bed Occupancy Tracker & Staff Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bed Occupancy Grid */}
          <div className="bg-white rounded-md border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                  Observation Ward Bed Occupancy
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Real-time bed availability for emergency triage and short-stay observation.
                </p>
              </div>

              {/* Occupancy Summary Pill */}
              <div className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-sm text-xs font-bold text-slate-800 flex items-center gap-2 font-mono">
                <span>Occupancy:</span>
                <span className="text-slate-900 font-extrabold">{occupiedCount} / {beds.length} Beds ({occupancyPercent}%)</span>
              </div>
            </div>

            {/* Bed Grid Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {beds.map((bed) => (
                <div
                  key={bed.id}
                  className={`rounded-md border p-4 flex flex-col justify-between space-y-3 transition ${
                    bed.status === 'Available'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : bed.status === 'Critical'
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {bed.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm font-mono border ${
                        bed.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : bed.status === 'Critical'
                          ? 'bg-rose-50 text-rose-900 border-rose-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
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
                    className={`w-full text-xs font-medium py-1.5 rounded-md border transition cursor-pointer ${
                      bed.status === 'Available'
                        ? 'bg-[#063b70] hover:bg-[#052d56] text-white border-[#063b70]'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    {bed.status === 'Available' ? '+ Admit Patient' : 'Discharge Bed'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active On-Duty Personnel Panel */}
          <div className="bg-white rounded-md border border-slate-200 p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Verified Active On-Duty Personnel ({activeFacility})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Medical Officer In-Charge</span>
                <span className="text-xs font-bold text-slate-900 block">Dr. Rajesh Kumar</span>
                <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Verified Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Station Pharmacist</span>
                <span className="text-xs font-bold text-slate-900 block">Dr. R. Sharma</span>
                <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Verified Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Staff Nurse (Triage)</span>
                <span className="text-xs font-bold text-slate-900 block">Sister Anitha</span>
                <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Verified Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
