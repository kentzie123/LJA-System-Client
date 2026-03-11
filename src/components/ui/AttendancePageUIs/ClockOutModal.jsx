import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw, LogOut, X, Loader, CheckCircle, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";

const ClockOutModal = ({ isOpen, onClose }) => {
  const { clockOut, isClocking } = useAttendanceStore();
  
  // Steps: 1 = Camera, 2 = Photo Review, 3 = Summary Report
  const [step, setStep] = useState(1); 
  const [photo, setPhoto] = useState(null);
  const [workSummary, setWorkSummary] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const webcamRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleConfirm = async () => {
    if (!photo || !workSummary.trim()) return;
    const success = await clockOut(photo, null, workSummary);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/90 backdrop-blur-md animate-in fade-in duration-300 p-4">
      
      <div className="bg-base-100 w-full max-w-[400px] rounded-xl border border-base-300 shadow-2xl overflow-hidden flex flex-col transition-all antialiased-text">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-error/10 flex justify-between items-center bg-error/5 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && !isClocking && (
               <button onClick={() => setStep(step - 1)} className="btn btn-xs btn-circle btn-ghost text-error">
                 <ArrowLeft size={14} />
               </button>
            )}
            <div className="flex flex-col">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-error flex items-center gap-2">
                Step {step} of 3
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-tight">
                {step === 1 && "Identity Verification"}
                {step === 2 && "Time Confirmation"}
                {step === 3 && "Work Summary"}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isClocking} className="btn btn-xs btn-circle btn-ghost text-error/50">
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col bg-base-100 min-h-[320px]">
          
          {/* STEP 1: CAMERA */}
          {step === 1 && (
            <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 animate-in fade-in zoom-in-95">
              <Webcam
                audio={false}
                mirrored={true}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
                videoConstraints={{ facingMode: "user" }}
              />
              <div className="absolute inset-0 border-[24px] border-black/20 pointer-events-none" />
              <div className="absolute bottom-4 left-4 text-white drop-shadow-lg font-black text-lg tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}

          {/* STEP 2: PHOTO REVIEW */}
          {step === 2 && (
            <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
              <div className="relative aspect-square w-full bg-black overflow-hidden border-b border-base-200">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button 
                  onClick={() => setStep(1)}
                  className="absolute top-4 right-4 btn btn-xs h-8 bg-black/50 text-white border-white/10 rounded-lg backdrop-blur-md"
                >
                  <RefreshCw size={12} className="mr-1" /> Retake
                </button>
              </div>
              <div className="p-6 text-center">
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Clock Out Time</p>
                <h2 className="text-4xl font-black text-error tabular-nums tracking-tighter">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </h2>
                <p className="text-xs font-bold opacity-50 mt-1 uppercase tracking-widest">
                  {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: WORK SUMMARY */}
          {step === 3 && (
            <div className="p-5 space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg border border-base-300/50">
                 <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-base-300">
                    <img src={photo} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">Session Verified</span>
                    <span className="text-xs font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Log</span>
                 </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.15em] flex items-center gap-2">
                  <FileText size={12} className="text-error" /> Final Accomplishments
                </label>
                <textarea
                  autoFocus
                  className="textarea textarea-bordered w-full h-40 text-sm focus:border-error focus:ring-1 focus:ring-error/20 bg-base-200/30 shadow-inner rounded-xl leading-relaxed p-4"
                  placeholder="What did you achieve today?..."
                  value={workSummary}
                  onChange={(e) => setWorkSummary(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-base-100 border-t border-base-200">
          {step === 1 && (
            <button onClick={capture} className="btn btn-error w-full h-12 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-error/20 rounded-lg">
              Capture Identity
            </button>
          )}
          {step === 2 && (
            <button onClick={() => setStep(3)} className="btn btn-error w-full h-12 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-error/20 rounded-lg gap-2">
              Next: Summary <ChevronRight size={16} />
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleConfirm}
              disabled={isClocking || !workSummary.trim()}
              className="btn btn-error w-full h-12 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-error/20 rounded-lg"
            >
              {isClocking ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              {isClocking ? 'Finalizing...' : 'Complete Clock Out'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClockOutModal;