import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw, CheckCircle, X, Loader } from "lucide-react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";

const ClockInModal = ({ isOpen, onClose }) => {
  const { clockIn, isClocking } = useAttendanceStore();
  
  // State: 1 = Photo, 2 = Confirm
  const [step, setStep] = useState(1); 
  const [photo, setPhoto] = useState(null);
  const webcamRef = useRef(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPhoto(null);
    }
  }, [isOpen]);

  // --- STEP 1: CAPTURE PHOTO ---
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

  // --- STEP 2: CONFIRM & SUBMIT ---
  const handleConfirm = async () => {
    if (!photo) return;
    const success = await clockIn(photo, null);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    // WRAPPER: Full screen on mobile (items-end), Centered on desktop (items-center)
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* MODAL CARD: Full viewport height on mobile (h-[100dvh]), Standard Card on desktop */}
      <div className="bg-base-100 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all">
        
        {/* HEADER */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50 shrink-0 z-10 relative">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            Clock In
          </h3>
          <button onClick={onClose} disabled={isClocking} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* BODY - Flex-1 makes it fill the available mobile screen space */}
        {/* p-0 on mobile to let camera touch edges, p-6 on desktop for card feel */}
        <div className="flex-1 overflow-hidden flex flex-col bg-black relative">
          
          {/* STEP 1: CAMERA */}
          {step === 1 && (
            <div className="flex flex-col w-full h-full relative">
              {/* Webcam Container: Fills height on mobile, 4/3 Aspect on Desktop */}
              <div className="relative w-full flex-1 sm:flex-none sm:aspect-[4/3] bg-black overflow-hidden">
                <Webcam
                  audio={false}
                  mirrored={true}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="absolute inset-0 w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }}
                />
                
                {/* Mobile Overlay Text */}
                <div className="absolute bottom-4 left-0 right-0 text-center sm:hidden">
                   <p className="text-white/80 text-xs bg-black/40 inline-block px-3 py-1 rounded-full backdrop-blur-md">
                     Ensure face is visible
                   </p>
                </div>
              </div>
              
              {/* Desktop Instruction (Hidden on mobile) */}
              <div className="hidden sm:block p-4 bg-base-100 text-center">
                <p className="text-sm opacity-60">
                  Please ensure your face is clearly visible.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIRMATION PREVIEW */}
          {step === 2 && (
            <div className="flex flex-col w-full h-full bg-base-100">
              
              {/* Photo Container: Fills space on mobile, 4/3 on desktop */}
              <div className="relative w-full flex-1 sm:flex-none sm:aspect-[4/3] bg-black">
                <img 
                  src={photo} 
                  alt="Captured" 
                  className="w-full h-full object-cover" 
                />
                
                {/* Retake Button (Floating) */}
                <button 
                  onClick={retake}
                  className="absolute top-4 right-4 btn btn-sm btn-circle btn-neutral opacity-90 hover:opacity-100 shadow-lg z-20"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* Time Details */}
              <div className="p-6 text-center bg-base-100 shrink-0">
                <h4 className="text-3xl font-black text-primary tracking-tight">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h4>
                <p className="text-sm opacity-50 uppercase tracking-widest font-bold mt-1">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTION AREA (White background ensures contrast) */}
        <div className="p-4 border-t border-base-200 bg-base-100 mt-auto shrink-0 z-20">
          {step === 1 ? (
             <button onClick={capture} className="btn btn-primary w-full gap-2 h-12 text-lg shadow-lg shadow-primary/20">
                <Camera size={20} /> Capture Photo
             </button>
          ) : (
             <button
              onClick={handleConfirm}
              className="btn btn-primary w-full gap-2 h-12 text-lg shadow-lg shadow-primary/20"
              disabled={isClocking} 
            >
              {isClocking ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Clocking In...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirm Clock In
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClockInModal;