import React, { useState, useEffect } from 'react';
import PanZoomViewer from './PanZoomViewer';
import ConfidenceBadge from './ConfidenceBadge';
import { verifyDocument } from '../../services/api';

export default function HitlWorkspace({
  documentData,
  previewUrl,
  activeFacility,
  onCommitSuccess,
  onViewAuditTrail,
  onLoadSample,
}) {
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (documentData) {
      // Clone extracted document data so modifications are local
      setFormData(JSON.parse(JSON.stringify(documentData)));
      setCommitResult(null);
      setErrorMsg('');
    }
  }, [documentData]);

  if (!formData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto my-8 shadow-xs">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 m-0 mb-2">
          HITL Review Buffer Empty
        </h3>
        <p className="text-xs text-slate-600 mb-6 max-w-md mx-auto">
          No stock register document is currently loaded in the human review stage. Upload a register photo or load a sample demo record.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onLoadSample(activeFacility)}
            className="bg-[#063b70] hover:bg-[#052d56] text-white px-4 py-2 rounded-md font-medium text-sm transition-all shadow-none flex items-center gap-2 cursor-pointer"
          >
            <span>Load Demo Register Sample ({activeFacility})</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate if low confidence overall
  const isLowConfidence = formData.requires_human_review || (formData.confidence_score || 1) < 0.90;

  // Check client-side discrepancy (dispensed > received)
  const discrepancies = (formData.records || []).filter(
    (rec) => Number(rec.quantity_dispensed || 0) > Number(rec.quantity_received || 0)
  );

  const handleRecordChange = (index, field, value) => {
    setFormData((prev) => {
      const newRecords = [...prev.records];
      newRecords[index] = {
        ...newRecords[index],
        [field]: field.startsWith('quantity') ? Math.max(0, parseInt(value, 10) || 0) : value,
      };
      return { ...prev, records: newRecords };
    });
  };

  const handleAddField = () => {
    setFormData((prev) => ({
      ...prev,
      records: [
        ...prev.records,
        {
          medicine: 'ORS Packets 21.8g',
          batch: 'B-' + Math.floor(100 + Math.random() * 900),
          quantity_received: 50,
          quantity_dispensed: 0,
        },
      ],
    }));
  };

  const handleRemoveField = (index) => {
    setFormData((prev) => ({
      ...prev,
      records: prev.records.filter((_, i) => i !== index),
    }));
  };

  const handleHeaderChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitVerification = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await verifyDocument(formData);
      setCommitResult(res);
      if (onCommitSuccess) onCommitSuccess(res);
    } catch (err) {
      console.error('Verification commit error:', err);
      setErrorMsg(err.message || 'Failed to verify and commit document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 bg-white">
      {/* Workspace Sub-header */}
      <div className="bg-white border-b border-slate-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm font-mono">
              Split-Screen Review Workspace
            </span>
            <span className="text-xs text-slate-500 font-mono">Doc ID: {formData.document_id}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 m-0 tracking-tight">
            Human-in-the-Loop Field Verification
          </h2>
        </div>

        <ConfidenceBadge
          confidenceScore={formData.confidence_score}
          requiresHumanReview={formData.requires_human_review}
        />
      </div>

      {/* Discrepancy Warning Banner (if dispensed > received) */}
      {discrepancies.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Warning</span>
            <span>Discrepancy Warning Detected</span>
          </div>
          <p className="m-0 leading-relaxed text-slate-700">
            The following medicine records specify <strong>Quantity Dispensed</strong> greater than <strong>Quantity Received</strong> in this transaction. Please cross-check against the register photo on the left:
          </p>
          <ul className="list-disc pl-5 font-semibold text-amber-900 m-0 mt-1 space-y-0.5">
            {discrepancies.map((d, i) => (
              <li key={i}>
                {d.medicine} (Batch: {d.batch}): Received {d.quantity_received} vs Dispensed {d.quantity_dispensed}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Commitment Banner with 1-Click CTA to Audit Trail */}
      {commitResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-6 text-emerald-950 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#063b70] text-white flex items-center justify-center font-bold text-xs shrink-0">
              OK
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900 m-0 tracking-tight">
                Document Verified &amp; Immutable Ledger Updated!
              </h3>
              <p className="text-xs text-emerald-800 m-0 mt-0.5">
                {commitResult.message} ({commitResult.details?.events_created || 0} events created)
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200">
            <span className="text-xs text-emerald-900 font-medium">
              Audit events recorded under Facility: <strong>{formData.facility_id}</strong>
            </span>
            {/* 1-Click CTA button requested by user! */}
            <button
              onClick={() => onViewAuditTrail(formData.facility_id)}
              className="bg-[#063b70] hover:bg-[#052d56] text-white font-medium text-xs px-4 py-2 rounded-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>View Ledger Audit Trail for {formData.facility_id} &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-md text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main Split-Screen View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Pan-and-Zoom Register Viewer */}
        <div className="lg:col-span-5 space-y-2">
          <PanZoomViewer imageUrl={previewUrl} documentId={formData.document_id} />
        </div>

        {/* Right Pane: Editable OCR Data Form */}
        <div className="lg:col-span-7 bg-white rounded-md border border-slate-200 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Document Header Fields */}
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                Document Metadata
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Facility ID:
                  </label>
                  <input
                    type="text"
                    value={formData.facility_id}
                    onChange={(e) => handleHeaderChange('facility_id', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Date:
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => handleHeaderChange('date', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Document Type:
                  </label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => handleHeaderChange('document_type', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="stock_register">Stock Register</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Records Table Header & Actions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                  <span>Medicine Inventory Records</span>
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-sm text-[10px] font-mono">
                    {formData.records?.length || 0} items
                  </span>
                </h4>
                <button
                  onClick={handleAddField}
                  className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs px-3 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Add Row</span>
                </button>
              </div>

              {/* Records List / Table */}
              <div className="space-y-3">
                {(formData.records || []).map((rec, idx) => {
                  const hasDiscrepancy = Number(rec.quantity_dispensed || 0) > Number(rec.quantity_received || 0);

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-md border transition-all ${
                        isLowConfidence
                          ? 'border-amber-300 bg-amber-50/40'
                          : hasDiscrepancy
                          ? 'border-amber-300 bg-amber-50/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Item Index / Low confidence badge */}
                        <div className="sm:col-span-1 text-center">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center border border-slate-200 font-mono">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Medicine Name */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            Medicine Name
                          </label>
                          <input
                            type="text"
                            value={rec.medicine}
                            onChange={(e) => handleRecordChange(idx, 'medicine', e.target.value)}
                            className="w-full bg-white rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>

                        {/* Batch Number */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            Batch No
                          </label>
                          <input
                            type="text"
                            value={rec.batch}
                            onChange={(e) => handleRecordChange(idx, 'batch', e.target.value)}
                            className="w-full bg-white rounded-md px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-900 border border-slate-300 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>

                        {/* Qty Received */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-slate-600 mb-0.5">
                            Qty Recv
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={rec.quantity_received}
                            onChange={(e) => handleRecordChange(idx, 'quantity_received', e.target.value)}
                            className="w-full bg-white rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>

                        {/* Qty Dispensed */}
                        <div className="sm:col-span-2">
                          <label className={`block text-[10px] uppercase font-bold mb-0.5 ${hasDiscrepancy ? 'text-amber-900 font-extrabold' : 'text-slate-600'}`}>
                            Qty Disp
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={rec.quantity_dispensed}
                              onChange={(e) => handleRecordChange(idx, 'quantity_dispensed', e.target.value)}
                              className={`w-full bg-white rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 border focus:ring-1 focus:ring-slate-900 focus:outline-none ${
                                hasDiscrepancy ? 'border-amber-400 bg-amber-50' : 'border-slate-300'
                              }`}
                            />
                            {hasDiscrepancy && (
                              <span title="Quantity Dispensed exceeds Received" className="absolute -top-2 -right-1 text-[9px] font-extrabold text-amber-700 bg-amber-100 border border-amber-300 px-1 rounded-sm uppercase">
                                Alert
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Row Actions */}
                      <div className="flex justify-end pt-1 text-[11px]">
                        <button
                          onClick={() => handleRemoveField(idx)}
                          className="text-slate-500 hover:text-rose-700 font-medium hover:underline cursor-pointer"
                        >
                          Remove item
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Health Worker Verification:</span> Cross-check against left image before committing.
            </div>

            <button
              onClick={handleSubmitVerification}
              disabled={isSubmitting || !!commitResult}
              className={`w-full sm:w-auto px-4 py-2 rounded-md font-medium text-sm transition shadow-none cursor-pointer flex items-center justify-center gap-2 ${
                commitResult
                  ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-[#052d56] text-white cursor-wait'
                  : 'bg-[#063b70] hover:bg-[#052d56] text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Committing to Ledger...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Commit to Ledger</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
