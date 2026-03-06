import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  RefreshCw,
  LogOut,
  X,
  Loader,
  CheckCircle,
} from "lucide-react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";

const ClockOutModal = ({ isOpen, onClose }) => {
  const { clockOut, isClocking } = useAttendanceStore();

  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [workSummary, setWorkSummary] = useState("");
  const webcamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPhoto(null);
      setWorkSummary("");
    }
  }, [isOpen]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setStep(2);
    }
  }, [webcamRef]);

  const retake = () => {
    setPhoto(null);
    setStep(1);
  };

  const handleConfirm = async () => {
    if (!photo || !workSummary.trim()) return;

    const success = await clockOut(photo, null, workSummary);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
      {/* Container: 
        h-[100dvh] forces it to be full screen on mobile (zero space at top).
        sm:h-auto makes it behave like a normal modal on desktop.
      */}
      <div className="bg-base-100 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all">
        {/* HEADER */}
        <div className="p-4 flex justify-between items-center bg-error/10 shrink-0 border-b border-error/20 z-20">
          <h3 className="font-bold text-lg flex items-center gap-2 text-error">
            <LogOut size={20} />
            Clock Out
          </h3>
          <button
            onClick={onClose}
            disabled={isClocking}
            className="btn btn-sm btn-circle btn-ghost text-error hover:bg-error/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 flex flex-col bg-base-200 relative overflow-hidden">
          {/* =========================================
              STEP 1: FULL SCREEN CAMERA (Flex-1)
              ========================================= */}
          {step === 1 && (
            // FIX: Added min-h-[50vh] as a safety net, removed relative/absolute trickery
            <div className="flex-1 w-full bg-black flex flex-col min-h-[50vh] relative">
              <Webcam
                audio={false}
                mirrored={true}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                // FIX: Removed 'absolute inset-0'. Just let it naturally fill the space.
                className="w-full h-full object-cover flex-1"
                videoConstraints={{ facingMode: "user" }}
              />

              {/* Floating Mobile Camera Hint */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center sm:hidden z-10 pointer-events-none">
                <div className="bg-black/60 text-white/90 text-xs px-5 py-2.5 rounded-full backdrop-blur-md shadow-2xl border border-white/10 font-medium tracking-wide">
                  Ensure face is visible
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              STEP 2: FORM & TEXTAREA (Scrollable)
              ========================================= */}
          {step === 2 && (
            <div className="flex-1 flex flex-col w-full h-full bg-base-100 overflow-y-auto custom-scrollbar">
              {/* Photo Preview - Fixed smaller height so textarea is visible */}
              <div className="relative w-full h-[28vh] sm:h-[250px] bg-black shrink-0">
                <img
                  src={photo}
                  alt="Captured Preview"
                  className="w-full h-full object-cover opacity-90"
                />
                <button
                  onClick={retake}
                  className="absolute bottom-3 right-3 btn btn-sm bg-black/60 text-white border-white/20 hover:bg-black/80 backdrop-blur-md shadow-lg"
                >
                  <RefreshCw size={14} className="mr-1" /> Retake
                </button>
              </div>

              {/* Form Section */}
              <div className="p-5 flex flex-col gap-5 shrink-0">
                <div className="flex flex-col items-center">
                  <h4 className="text-4xl font-black text-error tracking-tight leading-none tabular-nums">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </h4>
                  <p className="text-[11px] opacity-50 uppercase tracking-[0.2em] font-bold mt-1.5">
                    {new Date().toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="form-control w-full mt-2">
                  <label className="label pt-0 pb-2 px-1">
                    <span className="label-text text-xs font-bold uppercase tracking-wider opacity-70">
                      Work Summary <span className="text-error ml-1">*</span>
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-32 text-base resize-none focus:border-error focus:ring-1 focus:ring-error/20 bg-base-200/50 shadow-inner"
                    placeholder="Briefly describe the tasks you accomplished today..."
                    value={workSummary}
                    onChange={(e) => setWorkSummary(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-base-200 bg-base-100 shrink-0 z-20 pb-safe">
          {step === 1 ? (
            <button
              onClick={capture}
              className="btn btn-error text-white w-full gap-2 h-14 text-base font-bold shadow-lg shadow-error/20 rounded-xl"
            >
              <Camera size={22} /> Capture Photo
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="btn btn-error text-white w-full gap-2 h-14 text-base font-bold shadow-lg shadow-error/20 rounded-xl disabled:bg-base-300 disabled:text-base-content/30 disabled:border-transparent"
              disabled={isClocking || !workSummary.trim()}
            >
              {isClocking ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Saving Record...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirm Clock Out
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClockOutModal;
