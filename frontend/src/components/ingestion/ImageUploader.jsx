import React, { useRef, useState } from 'react';

export default function ImageUploader({
  selectedFile,
  previewUrl,
  onFileSelect,
  onOpenCamera,
  onSubmit,
  isProcessing,
  loadSampleDocument,
  activeFacility,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file type. Please upload a valid register photo (.jpg, .jpeg, .png).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds 15MB limit.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    onFileSelect(file, objectUrl);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMsg('');
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              OCR Ingestion Pipeline
            </span>
            <h2 className="text-xl font-bold text-slate-900 m-0 mt-1">
              Register Photo Upload & Snapshot Capture
            </h2>
            <p className="text-xs text-slate-600 m-0 mt-1">
              Select or snap a paper stock register / prescription image. Gemini 1.5 Vision AI will automatically extract medicine inventory records.
            </p>
          </div>

          <button
            onClick={() => loadSampleDocument(activeFacility)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <span>✨ Try Sample Register Demo</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <span className="font-medium">⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-900 text-sm font-bold">✕</button>
        </div>
      )}

      {/* Main Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragOver
            ? 'border-blue-600 bg-blue-50/50 scale-[1.005]'
            : selectedFile
            ? 'border-emerald-400 bg-emerald-50/20'
            : 'border-slate-300 hover:border-blue-500 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
          className="hidden"
          id="register-file-input"
        />

        {previewUrl ? (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-md bg-slate-900 group">
              <img
                src={previewUrl}
                alt="Register Preview"
                className="w-full max-h-72 object-contain mx-auto"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs shadow-md hover:bg-slate-100 cursor-pointer"
                >
                  Change Image
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span className="truncate max-w-[240px]">{selectedFile?.name || 'Captured Snapshot'}</span>
                <span>{(selectedFile?.size ? (selectedFile.size / 1024).toFixed(1) + ' KB' : 'Image Ready')}</span>
              </div>
              <p className="text-[11px] text-slate-500 m-0">Format: JPG/PNG • Scope: {activeFacility}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-800 rounded-2xl border border-blue-200 flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div>
              <p className="text-base font-bold text-slate-800 m-0">
                Drag & Drop paper register photo here
              </p>
              <p className="text-xs text-slate-500 mt-1 m-0">
                Supports image formats: .jpg, .jpeg, .png (Max 15MB)
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Browse File System
              </button>

              <button
                type="button"
                onClick={onOpenCamera}
                className="bg-slate-800 hover:bg-slate-900 text-amber-300 font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Live Camera Capture
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submission CTA */}
      <div className="flex justify-end gap-3">
        {selectedFile && (
          <button
            type="button"
            onClick={() => onFileSelect(null, null)}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            Clear Selection
          </button>
        )}

        <button
          type="button"
          disabled={!selectedFile || isProcessing}
          onClick={onSubmit}
          className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
            !selectedFile || isProcessing
              ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Running Gemini Vision AI OCR...</span>
            </>
          ) : (
            <>
              <span>Execute OCR & Open HITL Review &rarr;</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
