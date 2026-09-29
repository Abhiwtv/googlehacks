import React, { useRef, useState, useEffect } from 'react';

export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fallbackInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access webcam. Please use mobile camera fallback or check browser permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `register_camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        setCapturedImage({ file, previewUrl });
      }
    }, 'image/jpeg', 0.92);
  };

  const handleFallbackFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCapturedImage({ file, previewUrl });
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage.file, capturedImage.previewUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#063b70] text-white px-6 py-4 flex justify-between items-center border-b border-[#052d56]">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <h3 className="font-bold text-base m-0">Camera Snapshot Capture (Paper Register)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {capturedImage ? (
            <div className="space-y-4 text-center">
              <div className="relative border border-slate-300 rounded-md overflow-hidden bg-black max-h-[400px] flex items-center justify-center">
                <img src={capturedImage.previewUrl} alt="Captured Register" className="max-h-[380px] w-auto object-contain" />
                <span className="absolute top-3 left-3 bg-[#063b70] text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm font-mono">
                  Snapshot Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Review your register snapshot. Ensure document text and batch numbers are clear and legible.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cameraError ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-md text-xs space-y-3">
                  <p className="font-bold text-amber-900 m-0">
                    {cameraError}
                  </p>
                  <p className="text-slate-600 m-0">
                    You can capture directly using your mobile phone camera or choose an existing photo below:
                  </p>
                  {/* Mobile Camera Fallback Input */}
                  <div className="pt-1">
                    <input
                      ref={fallbackInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFallbackFile}
                      className="hidden"
                      id="mobile-camera-input"
                    />
                    <label
                      htmlFor="mobile-camera-input"
                      className="inline-flex items-center gap-2 bg-[#063b70] hover:bg-[#052d56] text-white font-medium px-4 py-2 rounded-md cursor-pointer text-xs transition-all shadow-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      Open Mobile Camera / Choose Photo
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-md overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-300">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-[11px] px-3 py-1 rounded-sm">
                    Align paper register flat within frame
                  </div>
                </div>
              )}

              {/* Mobile Fallback always available at bottom of live view */}
              <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-200">
                <span className="text-slate-500 font-medium">Device Fallback Mode:</span>
                <div>
                  <input
                    ref={fallbackInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFallbackFile}
                    className="hidden"
                    id="mobile-camera-input-direct"
                  />
                  <label
                    htmlFor="mobile-camera-input-direct"
                    className="text-[#063b70] font-semibold hover:underline cursor-pointer"
                  >
                    Use Device Native Camera App
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas element for snapshot rendering */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2 rounded-md font-medium text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>

          {capturedImage ? (
            <div className="flex gap-2">
              <button
                onClick={() => setCapturedImage(null)}
                className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2 rounded-md font-medium text-xs transition-all cursor-pointer"
              >
                Retake Photo
              </button>
              <button
                onClick={confirmCapture}
                className="bg-[#063b70] hover:bg-[#052d56] text-white px-4 py-2 rounded-md font-medium text-xs transition-all cursor-pointer shadow-none"
              >
                Use Captured Photo &rarr;
              </button>
            </div>
          ) : (
            !cameraError && (
              <button
                onClick={takeSnapshot}
                className="bg-[#063b70] hover:bg-[#052d56] text-white px-4 py-2 rounded-md font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-none"
              >
                <span>Capture Snapshot</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
