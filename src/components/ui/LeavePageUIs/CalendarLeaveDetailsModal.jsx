"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";
import { useLeaveStore } from "@/stores/useLeaveStore";

// --- HELPERS ---
const formatFriendlyDate = (dateString) => {
  if (!dateString) return 'N/A';
  const safeDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  return new Date(safeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const getLeaveDetails = (leaveName, dbColorCode) => {
  const name = (leaveName || "").toLowerCase();
  let icon = "📅"; 
  if (name.includes("sick")) icon = "🤒";
  else if (name.includes("paid") || name.includes("vacation")) icon = "🌴";
  else if (name.includes("casual")) icon = "🏄";

  return { icon, color: dbColorCode || "#094C8A" };
};

const CalendarLeaveDetailsModal = ({ isOpen, onClose, selectedLeave, canApprove }) => {
  const { updateLeaveStatus } = useLeaveStore();
  
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset internal states whenever the modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsRejectMode(false);
        setRejectReason("");
      }, 200);
    }
  }, [isOpen]);

  if (!selectedLeave) return null;

  const details = getLeaveDetails(selectedLeave.leave_type, selectedLeave.color_code);

  // --- HANDLERS ---
  const handleApprove = async () => {
    setIsProcessing(true);
    await updateLeaveStatus(selectedLeave.id, "Approved");
    setIsProcessing(false);
    onClose();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    await updateLeaveStatus(selectedLeave.id, "Rejected", rejectReason);
    setIsProcessing(false);
    onClose();
  };

  return (
    // Pure CSS DaisyUI Modal to prevent native dialog stacking bugs
    <div className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[360px] border border-base-300 shadow-2xl rounded-xl antialiased-text flex flex-col">
        
        {/* TOP BANNER WITH EMOJI (Height reduced) */}
        <div 
          className="h-16 sm:h-20 flex items-center justify-center relative shrink-0"
          style={{ backgroundColor: `${details.color}1a` }} 
        >
          <button 
            onClick={onClose} 
            className="btn btn-xs h-6 w-6 min-h-0 btn-circle absolute top-2 right-2 bg-black/10 hover:bg-black/20 text-black/50 hover:text-black border-none transition-colors"
          >
            <X size={14} strokeWidth={3} />
          </button>
          <span className="text-3xl sm:text-4xl drop-shadow-sm">{details.icon}</span>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 space-y-4">
          
          {/* PROFILE SECTION */}
          <div className="flex items-center gap-3">
            <div className="avatar shrink-0">
              <div className="w-10 h-10 rounded-full ring-1 ring-base-300 ring-offset-1 bg-base-200 relative overflow-hidden flex items-center justify-center shadow-sm">
                {selectedLeave.profile_picture ? (
                  <Image 
                    src={getImageUrl(selectedLeave.profile_picture)} 
                    alt={selectedLeave.fullname} 
                    fill 
                    sizes="40px" 
                    className="object-cover" 
                  />
                ) : (
                  <span className="text-xs font-black text-base-content/50">{selectedLeave.initials}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-[13px] font-black text-base-content leading-tight truncate">
                {selectedLeave.fullname}
              </h3>
              <p className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mt-0.5 truncate">
                {selectedLeave.position || "Staff"}
              </p>
            </div>
          </div>

          {/* DATES SECTION */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-base-200/50 p-2.5 rounded-lg border border-base-200">
              <span className="text-[8px] font-black text-base-content/40 uppercase tracking-widest block mb-0.5">Start Date</span>
              <span className="text-[11px] font-bold text-base-content leading-none tabular-nums">{formatFriendlyDate(selectedLeave.start_date)}</span>
            </div>
            <div className="bg-base-200/50 p-2.5 rounded-lg border border-base-200">
              <span className="text-[8px] font-black text-base-content/40 uppercase tracking-widest block mb-0.5">End Date</span>
              <span className="text-[11px] font-bold text-base-content leading-none tabular-nums">{formatFriendlyDate(selectedLeave.end_date)}</span>
            </div>
          </div>

          {/* LEAVE TYPE SECTION */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest">Leave Type</span>
            <div 
              className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border"
              style={{ borderColor: `${details.color}40`, color: details.color, backgroundColor: `${details.color}10` }}
            >
              {selectedLeave.leave_type}
            </div>
          </div>

          {/* NOTE SECTION */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest">Note</span>
            <div className="bg-base-200/30 p-2.5 rounded-lg text-[11px] font-medium text-base-content/80 min-h-[50px] border border-base-300 leading-relaxed">
              {selectedLeave.reason ? `"${selectedLeave.reason}"` : <span className="opacity-40 italic">No reason provided.</span>}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          {canApprove && selectedLeave.status === "Pending" && (
            <div className="pt-4 border-t border-base-200 mt-2">
              {!isRejectMode ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsRejectMode(true)}
                    className="btn btn-sm h-8 min-h-0 btn-outline border-error text-error hover:bg-error hover:text-white flex-1 text-[10px] font-bold uppercase tracking-widest"
                    disabled={isProcessing}
                  >
                    Reject
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="btn btn-sm h-8 min-h-0 btn-success text-white flex-1 shadow-sm text-[10px] font-bold uppercase tracking-widest"
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="animate-spin size-4" /> : "Approve"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <label className="text-[9px] font-bold text-error block uppercase tracking-widest">
                    Rejection Reason:
                  </label>
                  <textarea 
                    className="textarea textarea-bordered w-full border-error/50 focus:border-error bg-base-100 rounded-md text-[11px] p-2 leading-snug h-16 resize-none" 
                    placeholder="Why is this leave being rejected?"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    disabled={isProcessing}
                  ></textarea>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsRejectMode(false)}
                      className="btn btn-sm h-8 min-h-0 btn-ghost flex-1 text-[10px] font-bold uppercase tracking-widest"
                      disabled={isProcessing}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReject}
                      className="btn btn-sm h-8 min-h-0 btn-error text-white flex-1 shadow-sm text-[10px] font-bold uppercase tracking-widest"
                      disabled={isProcessing || !rejectReason.trim()}
                    >
                      {isProcessing ? <Loader2 className="animate-spin size-4" /> : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      {/* CLICKABLE BACKDROP */}
      <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => { if(!isProcessing) onClose(); }}></div>
    </div>
  );
};

export default CalendarLeaveDetailsModal;