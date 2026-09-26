import React, { useState, useRef } from 'react';

export default function PanZoomViewer({ imageUrl, documentId }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1 && rotation === 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className={`bg-slate-900 rounded-md border border-slate-800 flex flex-col overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[620px]'}`}>
      {/* Control Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap justify-between items-center text-xs text-slate-300 gap-2 select-none">
        <div className="flex items-center gap-2 font-mono">
          <span className="bg-[#063b70] text-white px-2 py-0.5 rounded-sm text-[11px] font-bold">
            ORIGINAL REGISTER IMAGE
          </span>
          {documentId && (
            <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
              ID: {documentId}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded border border-slate-800 font-mono">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-white rounded transition-colors cursor-pointer font-bold"
          >
            &minus;
          </button>
          <span className="text-[11px] text-white px-1 font-bold min-w-[45px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-white rounded transition-colors cursor-pointer font-bold"
          >
            &#43;
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={handleRotate}
            title="Rotate 90°"
            className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-white rounded transition-colors cursor-pointer text-xs"
          >
            Rotate {rotation}&deg;
          </button>
          <button
            onClick={handleReset}
            title="Reset View"
            className="px-2 py-1 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
          >
            Reset
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-white rounded transition-colors cursor-pointer text-xs"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Interactive Image Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center p-4 cursor-${isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default'}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Uploaded Register"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
            className="max-h-full max-w-full object-contain pointer-events-none select-none"
          />
        ) : (
          <div className="text-center text-slate-500 space-y-2">
            <svg className="w-12 h-12 mx-auto text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">No Register Photo Selected</p>
            <p className="text-[11px] text-slate-600">Upload or capture a photo in the Register Ingestion tab</p>
          </div>
        )}

        {/* Pan Helper Hint */}
        {zoom > 1 && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] px-2.5 py-1 rounded-sm font-mono pointer-events-none">
            Drag image to pan &amp; examine handwriting
          </div>
        )}
      </div>
    </div>
  );
}
