"use client";

import React, { useState } from "react";
import { Download, X, Loader2, FileSpreadsheet } from "lucide-react";
import { downloadDTRExcel } from "@/utils/generateDTR";
import CustomDatePicker from "../Selections/CustomDatePicker";

// IMPORT ZUSTAND STORES
import { useAttendanceStore } from "@/stores/useAttendanceStore";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useOvertimeStore } from "@/stores/useOvertimeStore";

const ExportDtrModal = ({ 
  isOpen, 
  onClose, 
  authUser, 
  users, 
  canVerify, 
  selectedEmployees 
}) => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); 
    return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  });
  const [endDate, setEndDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [isGeneratingDTR, setIsGeneratingDTR] = useState(false);

const handleGenerateDTR = async () => {
  if (!startDate || !endDate) return;
  setIsGeneratingDTR(true);

  try {
    let targetEmployee = authUser; 
    if (canVerify && selectedEmployees.length === 1) {
      targetEmployee = users.find(u => String(u.id) === String(selectedEmployees[0])) || authUser;
    }

    const apiEndDate = `${endDate} 23:59:59`;
    
    const [freshAttendances, freshLeaves, freshOvertime] = await Promise.all([
      useAttendanceStore.getState().fetchAttendancesForExport({ 
        startDate, 
        endDate: apiEndDate, // Send the full day timestamp
        userId: targetEmployee.id 
      }),
      useLeaveStore.getState().fetchLeavesForExport({ 
        startDate, 
        endDate: apiEndDate, 
        targetUserId: targetEmployee.id 
      }),
      useOvertimeStore.getState().fetchOvertimeForExport({ 
        startDate, 
        endDate: apiEndDate, // Send the full day timestamp
        targetUserId: targetEmployee.id 
      })
    ]);

    // 2. Filter local data (Using en-CA to prevent timezone shifting bugs)
    const dtrAttendance = (freshAttendances || []).filter(record => {
      const recordDateStr = new Date(record.date).toLocaleDateString("en-CA"); 
      return recordDateStr >= startDate && recordDateStr <= endDate;
    });

    const dtrLeaves = (freshLeaves || []).filter(l => l.status === "Approved");
    
    const dtrOvertime = (freshOvertime || []).filter(o => {
      if (o.status !== "Approved") return false;
      
      const otDateSource = o.start_datetime;
      if (!otDateSource) return false;
      
      const otDateStr = new Date(otDateSource).toLocaleDateString("en-CA");
      return otDateStr >= startDate && otDateStr <= endDate;
    });

    // 3. Call utility
    await downloadDTRExcel(targetEmployee, dtrAttendance, dtrLeaves, dtrOvertime, startDate, endDate);
    
    onClose();
  } catch (error) {
    console.error("Failed to generate DTR:", error);
  } finally {
    setIsGeneratingDTR(false);
  }
};

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box p-0 bg-base-100 overflow-visible w-11/12 max-w-[360px] border border-success/30 shadow-2xl rounded-xl flex flex-col antialiased-text">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-success/20 bg-success/10 flex justify-between items-start shrink-0 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-success/20 rounded-md text-success shadow-sm">
              <FileSpreadsheet size={16} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-black text-success uppercase tracking-widest leading-none">
                Export DTR
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-success/70 mt-1">
                Full Report Generation
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-xs btn-circle btn-ghost text-success/50 hover:text-success hover:bg-success/20"
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 bg-base-100">
          <p className="text-[10px] text-base-content/60 font-medium mb-4 leading-snug">
            This operation compiles <strong className="text-base-content">Attendance</strong>, <strong className="text-base-content">Approved Leaves</strong>, and <strong className="text-base-content">Overtime</strong> into a unified Excel spreadsheet.
          </p>
          
          <div className="space-y-3">
            {/* START DATE */}
            <div className="form-control relative z-[40]">
              <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 ml-0.5">
                Start Date
              </label>
              <CustomDatePicker 
                value={startDate}
                onChange={setStartDate}
              />
            </div>
            
            {/* END DATE */}
            <div className="form-control relative z-[30]">
              <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 ml-0.5">
                End Date
              </label>
              <CustomDatePicker 
                value={endDate}
                onChange={setEndDate}
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2 shrink-0 rounded-b-xl relative z-0">
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] font-bold uppercase tracking-widest px-4"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleGenerateDTR} 
            disabled={isGeneratingDTR || !startDate || !endDate}
            className="btn btn-sm h-8 min-h-0 btn-success text-white text-[10px] font-bold uppercase tracking-widest px-5 shadow-sm border-none w-[140px]"
          >
            {isGeneratingDTR ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              <>
                <Download size={14} className="mr-1" /> Download
              </>
            )}
          </button>
        </div>

      </div>

      <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => !isGeneratingDTR && onClose()}></div>
    </dialog>
  );
};

export default ExportDtrModal;