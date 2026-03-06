import React, { useState } from "react";
import { Download, X, Loader } from "lucide-react";
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
    return d.toLocaleDateString("en-CA");
  });
  const [endDate, setEndDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [isGeneratingDTR, setIsGeneratingDTR] = useState(false);

  if (!isOpen) return null;

  const handleGenerateDTR = async () => {
    if (!startDate || !endDate) return;
    setIsGeneratingDTR(true);

    try {
      let targetEmployee = authUser; 
      if (canVerify && selectedEmployees.length === 1) {
        targetEmployee = users.find(u => String(u.id) === String(selectedEmployees[0])) || authUser;
      }

      // 1. SILENT FETCH: Call the dedicated export functions from the Zustand stores.
      // These return the data directly without updating the global state arrays.
      const [freshAttendances, freshLeaves, freshOvertime] = await Promise.all([
        useAttendanceStore.getState().fetchAttendancesForExport({ startDate, endDate, userId: targetEmployee.id }),
        useLeaveStore.getState().fetchLeavesForExport({ startDate, endDate, targetUserId: targetEmployee.id }),
        useOvertimeStore.getState().fetchOvertimeForExport({ startDate, endDate, targetUserId: targetEmployee.id })
      ]);

      // 2. Filter local data (just as a safety net)
      const dtrAttendance = (freshAttendances || []).filter(record => {
        const recordDate = new Date(record.date).toLocaleDateString("en-CA");
        return recordDate >= startDate && recordDate <= endDate;
      });

      const dtrLeaves = (freshLeaves || []).filter(l => l.status === "Approved");
      const dtrOvertime = (freshOvertime || []).filter(o => o.status === "Approved");

      // 3. Call utility with all datasets
      await downloadDTRExcel(targetEmployee, dtrAttendance, dtrLeaves, dtrOvertime, startDate, endDate);
      
      onClose();
    } catch (error) {
      console.error("Failed to generate DTR:", error);
    } finally {
      setIsGeneratingDTR(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl border border-base-300 flex flex-col overflow-visible scale-in-95 duration-200">
        <div className="bg-success/10 border-b border-success/20 p-4 flex justify-between items-center text-success rounded-t-2xl">
          <h3 className="font-bold flex items-center gap-2">
            <Download size={18} /> Export DTR (Full Report)
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle text-success hover:bg-success/20">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <p className="text-xs text-base-content/70">
            This report includes Attendance, Approved Leaves, and Overtime.
          </p>
          
          <div className="space-y-4">
            <div className="relative z-[40]">
              <CustomDatePicker 
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />
            </div>
            <div className="relative z-[30]">
              <CustomDatePicker 
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
            </div>
          </div>
        </div>

        <div className="bg-base-200/50 p-4 border-t border-base-300 flex justify-end gap-2 rounded-b-2xl relative z-0">
          <button onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
          <button 
            onClick={handleGenerateDTR} 
            disabled={isGeneratingDTR || !startDate || !endDate}
            className="btn btn-success btn-sm text-success-content w-32"
          >
            {isGeneratingDTR ? <Loader className="animate-spin size-4" /> : "Download Excel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDtrModal;