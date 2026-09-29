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
      <div className="bg-white rounded-md border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm font-mono">
              OCR Ingestion Pipeline
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 m-0 tracking-tight">
              Register Photo Upload &amp; Snapshot Capture
            </h2>
            <p className="text-xs text-slate-500 m-0">
              Select or snap a paper stock register / prescription image. Gemini 1.5 Vision AI will automatically extract medicine inventory records.
            </p>
          </div>

          <button
            onClick={() => loadSampleDocument(activeFacility)}
            className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium px-4 py-2 rounded-md text-sm transition-all shrink-0 cursor-pointer"
          >
            Try Sample Register Demo
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-md text-xs flex items-center justify-between font-semibold">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-900 text-sm font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg bg-slate-50/50 p-8 text-center transition-all ${
          isDragOver
            ? 'border-[#063b70] bg-blue-50/40'
            : selectedFile
            ? 'border-emerald-500 bg-emerald-50/20'
            : 'border-slate-300 hover:border-slate-400'
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
            <div className="relative rounded-md overflow-hidden border border-slate-300 bg-slate-900 group">
              <img
                src={previewUrl}
                alt="Register Preview"
                className="w-full max-h-72 object-contain mx-auto"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-slate-800 font-semibold px-3 py-1.5 rounded-md text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Change Image
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-md border border-slate-200 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-800 font-semibold">
                <span className="truncate max-w-[240px]">{selectedFile?.name || 'Captured Snapshot'}</span>
                <span>{(selectedFile?.size ? (selectedFile.size / 1024).toFixed(1) + ' KB' : 'Image Ready')}</span>
              </div>
              <p className="text-[11px] text-slate-500 m-0 font-mono">Format: JPG/PNG • Scope: {activeFacility}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-[#063b70] rounded-md border border-slate-200 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div>
              <p className="text-base font-bold text-slate-900 m-0">
                Drag &amp; Drop paper register photo here
              </p>
              <p className="text-xs text-slate-500 mt-1 m-0">
                Supports image formats: .jpg, .jpeg, .png (Max 15MB)
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#063b70] hover:bg-[#052d56] text-white font-medium px-4 py-2 rounded-md text-sm transition-all shadow-none flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Browse File System</span>
              </button>

              <button
                type="button"
                onClick={onOpenCamera}
                className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium px-4 py-2 rounded-md text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span>Live Camera Capture</span>
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
            className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2 rounded-md font-medium text-sm transition-all cursor-pointer"
          >
            Clear Selection
          </button>
        )}

        <button
          type="button"
          disabled={!selectedFile || isProcessing}
          onClick={onSubmit}
          className={`px-5 py-2.5 rounded-md font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
            !selectedFile || isProcessing
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-[#063b70] hover:bg-[#052d56] text-white shadow-none'
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
              <span>Execute OCR &amp; Open HITL Review &rarr;</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
