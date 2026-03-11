import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  RefreshCw,
  CheckCircle,
  X,
  Loader,
  ShieldCheck,
} from "lucide-react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";

const ClockInModal = ({ isOpen, onClose }) => {
  const { clockIn, isClocking } = useAttendanceStore();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const webcamRef = useRef(null);

  // Update clock every second for the "Live" feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPhoto(null);
    }
  }, [isOpen]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setStep(2);
    }
  }, [webcamRef]);

  const handleConfirm = async () => {
    if (!photo) return;
    const success = await clockIn(photo, null);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/80 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-base-100 w-full max-w-[400px] rounded-xl border border-base-300 shadow-2xl overflow-hidden flex flex-col transition-all antialiased-text">
        {/* HEADER: Ultra-Compact */}
        <div className="px-4 py-3 border-b border-base-200 flex justify-between items-center bg-base-100 shrink-0">
          <div className="flex flex-col">
            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <ShieldCheck size={14} /> Biometric Verify
            </h3>
            <p className="text-[10px] opacity-40 font-bold uppercase">
              Attendance Terminal
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isClocking}
            className="btn btn-xs btn-circle btn-ghost opacity-50 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY: The "Camera Lens" View */}
        <div className="relative bg-black flex flex-col">
          {/* CAMERA/PREVIEW CONTAINER */}
          <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
            {step === 1 ? (
              <>
                <Webcam
                  audio={false}
                  mirrored={true}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
                  videoConstraints={{ facingMode: "user" }}
                />
              </>
            ) : (
              <img
                src={photo}
                alt="Captured"
                className="w-full h-full object-cover animate-in zoom-in-105 duration-500"
              />
            )}

            {/* LIVE TIMESTAMP OVERLAY */}
            <div className="absolute top-4 left-4 flex flex-col z-20 pointer-events-none">
              <span className="text-[10px] font-black text-white drop-shadow-md tracking-widest uppercase opacity-80">
                {currentTime.toLocaleDateString(undefined, {
                  month: "short",
                  day: "2-digit",
                })}
              </span>
              <span className="text-xl font-black text-white drop-shadow-md tabular-nums leading-none">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>

          {/* STATUS SECTION (Only Step 2) */}
          {step === 2 && (
            <div className="p-4 text-center bg-base-100 border-t border-base-200 animate-in slide-in-from-bottom-2">
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">
                Status Preview
              </p>
              <h4 className="text-lg font-black text-base-content tracking-tight">
                Ready for Submission
              </h4>
            </div>
          )}
        </div>

        {/* FOOTER: Action Area */}
        <div className="p-4 bg-base-100 shrink-0 border-t border-base-200">
          {step === 1 ? (
            <button
              onClick={capture}
              className="group btn btn-primary w-full h-12 rounded-lg gap-3 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Camera size={18} />
              </div>
              Capture & Verify
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirm}
                disabled={isClocking}
                className="btn btn-primary w-full h-12 rounded-lg gap-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              >
                {isClocking ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}
                Confirm Arrival
              </button>

              {!isClocking && (
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-ghost btn-sm text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100"
                >
                  <RefreshCw size={12} className="mr-2" /> Retake Photo
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClockInModal;
