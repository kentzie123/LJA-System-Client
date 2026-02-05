import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw, LogOut, X, Loader } from "lucide-react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";

const ClockOutModal = ({ isOpen, onClose }) => {
  const { clockOut, isClocking } = useAttendanceStore();

  // State: 1 = Photo, 2 = Confirm
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const webcamRef = useRef(null);

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

  const retake = () => {
    setPhoto(null);
    setStep(1);
  };

  const handleConfirm = async () => {
    if (!photo) return;
    const success = await clockOut(photo, null);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    // WRAPPER: Full screen on mobile (items-end), Centered on desktop (items-center)
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* MODAL CARD: Full viewport height on mobile, Card on desktop */}
      <div className="bg-base-100 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all">
        
        {/* HEADER - RED THEME */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-error/5 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2 text-error">
            <div className="w-2 h-6 bg-error rounded-full"></div>
            Clock Out
          </h3>
          <button
            onClick={onClose}
            disabled={isClocking}
            className="btn btn-sm btn-circle btn-ghost text-error"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-center">
          
          {/* STEP 1: CAMERA */}
          {step === 1 && (
            <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
              <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden shadow-inner ring-2 ring-error/20">
                <Webcam
                  audio={false}
                  mirrored={true} 
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }}
                />
              </div>
              
              <div className="w-full mt-auto sm:mt-0">
                <p className="text-sm opacity-60 text-center mb-4">
                  Capture your photo to clock out.
                </p>
                <button
                  onClick={capture}
                  className="btn btn-error text-white w-full gap-2"
                >
                  <Camera size={18} /> Capture Photo
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIRM */}
          {step === 2 && (
            <div className="flex flex-col gap-6 text-center h-full justify-center">
              {/* Photo Preview */}
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative shadow-md mx-auto bg-black">
                <img
                  src={photo}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={retake}
                  className="absolute top-2 right-2 btn btn-xs btn-circle btn-neutral opacity-80 hover:opacity-100"
                >
                  <RefreshCw size={12} />
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-error">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </h4>
                <p className="text-sm opacity-50 uppercase tracking-widest font-bold">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {step === 2 && (
          <div className="p-4 border-t border-base-200 bg-base-100 mt-auto shrink-0">
            <button
              onClick={handleConfirm}
              className="btn btn-error text-white w-full gap-2 shadow-lg shadow-error/20"
              disabled={isClocking} 
            >
              {isClocking ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Clocking Out...
                </>
              ) : (
                <>
                  <LogOut size={18} />
                  Confirm Clock Out
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockOutModal;