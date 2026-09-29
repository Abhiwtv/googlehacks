import React, { useState, useEffect, useMemo } from 'react';
import { getFacilityAudit, getMedicineAudit } from '../../services/api';
import GeminiRCACard from './GeminiRCACard';

const DEFAULT_SEED_EVENTS = [
  {
    event_id: 'EVT-001-PCM-INTAKE',
    event_type: 'MEDICINE_RECEIVED',
    facility_id: 'PHC-042',
    timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    actor_id: 'OCR_INGEST_AI',
    source_document_id: 'DOC-OCR-PCM-500',
    data: { medicine: 'Paracetamol 500mg Tablets', batch: 'PCM-2026-B1', quantity: 500, verification_status: 'VERIFIED_OCR' }
  },
  {
    event_id: 'EVT-002-AMX-INTAKE',
    event_type: 'MEDICINE_RECEIVED',
    facility_id: 'PHC-042',
    timestamp: new Date(Date.now() - 27 * 3600 * 1000).toISOString(),
    actor_id: 'OCR_INGEST_AI',
    source_document_id: 'DOC-OCR-AMX-300',
    data: { medicine: 'Amoxicillin 250mg Capsules', batch: 'AMX-774B', quantity: 300, verification_status: 'VERIFIED_OCR' }
  },
  {
    event_id: 'EVT-003-ORS-INTAKE',
    event_type: 'MEDICINE_RECEIVED',
    facility_id: 'PHC-042',
    timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    actor_id: 'OCR_INGEST_AI',
    source_document_id: 'DOC-OCR-ORS-200',
    data: { medicine: 'ORS Oral Rehydration Salts 21.8g', batch: 'ORS-991A', quantity: 200, verification_status: 'VERIFIED_OCR' }
  },
  {
    event_id: 'EVT-004-PCM-DISP-1',
    event_type: 'MEDICINE_DISPENSED',
    facility_id: 'PHC-042',
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    actor_id: 'Pharmacist A. Verma',
    source_document_id: 'RX-99201',
    data: { medicine: 'Paracetamol 500mg Tablets', batch: 'PCM-2026-B1', quantity: 45, verification_status: 'RX_LINKED' }
  },
  {
    event_id: 'EVT-005-PCM-DISP-2',
    event_type: 'MEDICINE_DISPENSED',
    facility_id: 'PHC-042',
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    actor_id: 'Pharmacist A. Verma',
    source_document_id: 'RX-99208',
    data: { medicine: 'Paracetamol 500mg Tablets', batch: 'PCM-2026-B1', quantity: 45, verification_status: 'RX_LINKED' }
  },
  {
    event_id: 'EVT-006-PCM-DISP-3',
    event_type: 'MEDICINE_DISPENSED',
    facility_id: 'PHC-042',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    actor_id: 'NIGHT_SHIFT_DISPENSE',
    source_document_id: 'RX-OFF-994',
    data: { medicine: 'Paracetamol 500mg Tablets', batch: 'PCM-2026-B1', quantity: 50, note: 'Night Shift / Off-hours deduction', verification_status: 'OFF_HOURS_LOGGED' }
  }
];

export default function AuditView({ activeFacility, setActiveFacility }) {
  const [selectedFacility, setSelectedFacility] = useState(activeFacility || 'PHC-042');
  const [medicineFilter, setMedicineFilter] = useState('');
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    setSelectedFacility(activeFacility || 'PHC-042');
  }, [activeFacility]);

  const fetchAuditTrail = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let res;
      if (medicineFilter.trim()) {
        res = await getMedicineAudit(selectedFacility, medicineFilter.trim());
      } else {
        res = await getFacilityAudit(selectedFacility);
      }
      setAuditData(res);
    } catch (err) {
      console.error('Audit fetch error:', err);
      setErrorMsg(err.message || 'Failed to retrieve audit ledger records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditTrail();
  }, [selectedFacility]);

  const handleFacilityChange = (fac) => {
    setSelectedFacility(fac);
    setActiveFacility(fac);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuditTrail();
  };

  const toggleEventDetail = (id) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine active events (using backend data or fallback seed)
  const rawEvents = (auditData?.events && auditData.events.length > 0)
    ? auditData.events
    : (selectedFacility === 'PHC-042' ? DEFAULT_SEED_EVENTS : []);

  const availableMedicines = useMemo(() => {
    const fallbackMeds = [
      "Paracetamol 500mg Tablets",
      "ORS Oral Rehydration Salts 21.8g",
      "Amoxicillin 250mg Capsules",
      "Azithromycin 500mg Tablets",
      "Cetirizine 10mg Syrup 60ml"
    ];
    const eventMeds = (rawEvents || [])
      .map(evt => evt.medicine_name || evt.medicine || evt.data?.medicine)
      .filter(Boolean);
    return Array.from(new Set([...eventMeds, ...fallbackMeds]));
  }, [rawEvents]);

  const filteredEvents = medicineFilter.trim()
    ? rawEvents.filter(e => {
        const med = (e.data?.medicine || '').toLowerCase();
        const batch = (e.data?.batch || '').toLowerCase();
        const query = medicineFilter.toLowerCase();
        return med.includes(query) || batch.includes(query);
      })
    : rawEvents;

  // Calculate running balance
  const runningBalances = {};
  const eventsWithBalance = filteredEvents.map((evt) => {
    const med = evt.data?.medicine || 'General';
    const batch = evt.data?.batch || 'B1';
    const key = `${med}-${batch}`;
    
    if (!(key in runningBalances)) {
      runningBalances[key] = 0;
    }

    const qty = evt.data?.quantity || 0;
    const isReceived = evt.event_type === 'MEDICINE_RECEIVED' || evt.event_type === 'STOCK_INGESTED_OCR';
    
    if (isReceived) {
      runningBalances[key] += qty;
    } else {
      runningBalances[key] = Math.max(0, runningBalances[key] - qty);
    }

    return {
      ...evt,
      computedBalance: runningBalances[key]
    };
  });

  return (
    <div className="space-y-8 pb-8 bg-white">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm font-mono">
            National Health Ledger Timeline
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight">
            Immutable Audit Trail &amp; Stock Traceability
          </h2>
          <p className="text-xs text-slate-500 m-0">
            Verifiable chronological timeline of stock register ingestion, verification, received medicine batches, and pharmacy dispatches.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="no-print border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs px-4 py-2 rounded-md flex items-center gap-1.5 cursor-pointer shrink-0 transition"
        >
          <span>Print Audit Report</span>
        </button>
      </div>

      {/* Feature 3: Grounded AI Root Cause Analysis (RCA) Engine Card */}
      <GeminiRCACard selectedFacility={selectedFacility} events={rawEvents} />

      {/* Filter Bar */}
      <div className="no-print bg-white rounded-md border border-slate-200 p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Facility Selector */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Health Facility:
            </label>
            <select
              value={selectedFacility}
              onChange={(e) => handleFacilityChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="PHC-042">Primary Health Centre (PHC-042)</option>
              <option value="CHC-101">Community Health Centre (CHC-101)</option>
              <option value="DH-88">District Hospital (DH-88)</option>
              <option value="PHC-019">Primary Health Centre (PHC-019)</option>
            </select>
          </div>

          {/* Medicine Search Input */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Filter by Medicine Name / Batch:
            </label>
            <input
              type="text"
              placeholder="e.g. Paracetamol 500mg, ORS, Amoxicillin..."
              value={medicineFilter}
              onChange={(e) => setMedicineFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              list="audit-medicine-options"
            />
            <datalist id="audit-medicine-options">
              {availableMedicines.map((med) => (
                <option key={med} value={med} />
              ))}
            </datalist>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              className="w-full bg-[#063b70] hover:bg-[#052d56] text-white font-medium text-xs py-2 rounded-md transition shadow-none cursor-pointer"
            >
              Search
            </button>
            {medicineFilter && (
              <button
                type="button"
                onClick={() => {
                  setMedicineFilter('');
                  fetchAuditTrail();
                }}
                className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs px-3 py-2 rounded-md cursor-pointer"
                title="Clear Filter"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-md text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Ledger Audit Events Structured Table View */}
      <div className="bg-white border-t border-slate-200 pt-6 space-y-4">
        <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-200 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0 uppercase tracking-wider flex items-center gap-2">
              Audit Event Ledger: <span className="text-slate-900 font-extrabold">{selectedFacility}</span>
            </h3>
            {medicineFilter && (
              <span className="text-[11px] text-amber-900 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-sm border border-amber-200 inline-block mt-1">
                Filtered by Medicine: "{medicineFilter}"
              </span>
            )}
          </div>

          <span className="bg-slate-100 text-slate-700 font-mono text-xs px-3 py-1 rounded-sm border border-slate-200 font-semibold">
            Total Ledger Events: <strong>{eventsWithBalance.length}</strong>
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <svg className="animate-spin h-8 w-8 text-[#063b70] mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs text-slate-500 font-medium">Fetching cryptographic audit entries from backend...</p>
          </div>
        ) : eventsWithBalance.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-md border border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-700 m-0">No Audit Events Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No verified stock register events have been committed for <strong>{selectedFacility}</strong> {medicineFilter ? `matching "${medicineFilter}"` : ''}.
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-36 font-mono">Timestamp</th>
                  <th className="p-3 w-36">Action / Event Type</th>
                  <th className="p-3">Medicine &amp; Batch</th>
                  <th className="p-3 w-28 text-right font-mono">Qty Delta</th>
                  <th className="p-3 w-28 text-right font-mono">Balance</th>
                  <th className="p-3 w-36">Logged By</th>
                  <th className="p-3 w-40 text-center font-mono">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {eventsWithBalance.slice().reverse().map((evt, idx) => {
                  const isReceived = evt.event_type === 'MEDICINE_RECEIVED' || evt.event_type === 'STOCK_INGESTED_OCR';
                  const isOffHours = evt.data?.verification_status === 'OFF_HOURS_LOGGED' || (evt.data?.note || '').includes('Night Shift');
                  const isExpanded = expandedEventId === (evt.event_id || idx);

                  return (
                    <React.Fragment key={evt.event_id || idx}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        {/* Timestamp */}
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {evt.timestamp ? new Date(evt.timestamp).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          }) : 'Recent'}
                        </td>

                        {/* Action / Event Type */}
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-mono border ${
                              isReceived
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : isOffHours
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {isReceived ? 'STOCK INTAKE' : isOffHours ? 'NIGHT DISPENSE' : 'DISPENSED OUT'}
                          </span>
                        </td>

                        {/* Medicine & Batch */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{evt.data?.medicine || 'General Medicine'}</div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Batch: <strong className="text-slate-700">{evt.data?.batch || 'PCM-2026-B1'}</strong>
                          </span>
                        </td>

                        {/* Quantity Delta */}
                        <td className="p-3 text-right font-mono font-bold text-xs">
                          <span className={isReceived ? 'text-slate-900' : isOffHours ? 'text-amber-900' : 'text-slate-700'}>
                            {isReceived ? `+${evt.data?.quantity || 0}` : `-${evt.data?.quantity || 0}`}
                          </span>
                        </td>

                        {/* Running Balance */}
                        <td className="p-3 text-right font-mono font-bold text-slate-900 text-xs">
                          {evt.computedBalance} units
                        </td>

                        {/* Logged By */}
                        <td className="p-3 text-xs text-slate-700">
                          <span className="font-semibold">{evt.actor_id || 'Pharmacist A. Verma'}</span>
                        </td>

                        {/* Verification Status Badge & Inspect Toggle */}
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono border ${
                                isOffHours
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : isReceived
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              {evt.data?.verification_status || (isReceived ? 'VERIFIED_OCR' : 'RX_LINKED')}
                            </span>

                            <button
                              onClick={() => toggleEventDetail(evt.event_id || idx)}
                              className="text-[10px] text-slate-600 hover:text-slate-900 underline cursor-pointer font-semibold"
                            >
                              {isExpanded ? 'Hide Payload ▲' : 'Raw JSON ▼'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Raw JSON Inspector Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px]">
                            <pre className="m-0 overflow-x-auto">{JSON.stringify(evt, null, 2)}</pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

