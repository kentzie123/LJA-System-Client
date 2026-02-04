"use client";

import React, { useState, useMemo } from "react";
import {
  ImageIcon,
  Pencil,
  Trash,
  AlertCircle,
  AlertTriangle,
  CheckSquare,
  Square,
  CheckCircle,
  XCircle,
} from "lucide-react";
import AttendanceVerificationModal from "./AttendanceVerificationModal";

const AttendanceTableList = ({
  attendances = [],
  isFetchingAttendances,
  onEdit,
  onDelete,
  onVerifyDay, // Updated to unified prop
  canManualEntry = false,
  canVerify = false,
}) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [modalData, setModalData] = useState({
    isOpen: false,
    recordId: null,
    type: null,
    photo: null,
    time: null,
    currentStatus: null,
    employeeName: null,
  });

  // --- 1. SELECTION LOGIC ---
  const isAllSelected = attendances.length > 0 && selectedItems.size === attendances.length;

  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedItems(new Set());
    else setSelectedItems(new Set(attendances.map((r) => r.id)));
  };

  const toggleSelection = (id) => {
    if (!canVerify) return;
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  const handleBulkVerify = async (status) => {
    if (!onVerifyDay) return;
    for (const id of selectedItems) {
      await onVerifyDay(id, status);
    }
    setSelectedItems(new Set());
  };

  // --- 2. HELPERS ---
  const formatTime = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case "Verified": return "badge-success text-white border-none";
      case "Rejected": return "badge-error text-white border-none";
      default: return "badge-warning text-warning-content";
    }
  };

  const checkTimeFlag = (timeString, type) => {
    if (!timeString) return false;
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (type === "in") return totalMinutes > 495; // 8:15 AM
    if (type === "out") return totalMinutes < 1020; // 5:00 PM
    return false;
  };

  // --- 3. MODAL ACTIONS ---
  const openVerificationModal = (record, type) => {
    if (!canVerify) return; 
    const isTimeIn = type === "in";
    setModalData({
      isOpen: true,
      recordId: record.id,
      type: type,
      photo: isTimeIn ? record.photo_in : record.photo_out,
      time: isTimeIn ? record.time_in : record.time_out,
      currentStatus: isTimeIn ? record.status_in : record.status_out,
      employeeName: record.fullname,
    });
  };

  const closeModal = () => setModalData({ ...modalData, isOpen: false });

  // Use onVerifyDay even for granular modal actions to keep status in sync
  const handleVerificationAction = (id, type, status) => {
    if (onVerifyDay) onVerifyDay(id, status);
    closeModal();
  };

  // --- 4. SUB-COMPONENT: TIME CELL ---
  const TimeCell = ({ record, type }) => {
    const isTimeIn = type === "in";
    const time = isTimeIn ? record.time_in : record.time_out;
    const status = isTimeIn ? record.status_in : record.status_out;
    const photo = isTimeIn ? record.photo_in : record.photo_out;
    const isFlagged = checkTimeFlag(time, type);
    const flagLabel = type === "in" ? "LATE" : "UNDERTIME";

    if (!time) return <span className="text-base-content/30 italic text-xs">-- : --</span>;

    return (
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs tabular-nums">{formatTime(time)}</span>
          {isFlagged && (
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${type === 'in' ? 'bg-error text-white animate-pulse' : 'bg-warning text-warning-content'}`}>
              {flagLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {photo ? (
            <button
              onClick={() => openVerificationModal(record, type)}
              disabled={!canVerify} 
              className={`btn btn-xs btn-square h-6 w-6 min-h-0 rounded-md transition-colors ${
                status === "Pending" ? "btn-warning text-warning-content animate-pulse" : "btn-ghost bg-base-200 text-base-content/60"
              }`}
            >
              <ImageIcon className="size-3.5" />
            </button>
          ) : (
            <span className="text-[10px] text-error font-bold opacity-70">NO PHOTO</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* --- BULK ACTION TOOLBAR --- */}
      {canVerify && attendances.length > 0 && selectedItems.size > 0 && (
        <div className="flex items-center justify-between bg-primary text-primary-content p-3 rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <span className="text-sm font-bold ml-2">{selectedItems.size} Workdays Selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkVerify("Rejected")} className="btn btn-sm btn-ghost bg-white/10 border-none text-white hover:bg-white/20">Reject All</button>
            <button onClick={() => handleBulkVerify("Verified")} className="btn btn-sm bg-white text-primary border-none hover:bg-white/90">Approve All</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-base-300 rounded-xl bg-base-100 shadow-sm">
        <table className="table w-full border-separate border-spacing-0 min-w-[1000px]">
          <thead>
            <tr className="bg-base-200 text-base-content/60 uppercase text-[10px] tracking-wider font-bold">
              {canVerify && (
                <th className="py-4 pl-6 border-b border-base-300 w-10">
                  <button onClick={toggleSelectAll} className="btn btn-ghost btn-xs p-0 h-auto min-h-0">
                    {isAllSelected ? <CheckSquare className="size-4 text-primary" /> : <Square className="size-4 opacity-50" />}
                  </button>
                </th>
              )}
              <th className="py-4 border-b border-base-300">Employee</th>
              <th className="py-4 border-b border-base-300">Date</th>
              <th className="py-4 border-b border-base-300">Clock In</th>
              <th className="py-4 border-b border-base-300">Clock Out</th>
              <th className="py-4 border-b border-base-300 text-center">Day Verification</th>
              {canManualEntry && <th className="py-4 pr-6 border-b border-base-300 text-center">Manage</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300">
            {isFetchingAttendances ? (
              <tr><td colSpan={7} className="py-16 text-center"><span className="loading loading-spinner loading-md"></span></td></tr>
            ) : attendances.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center opacity-50">No records found.</td></tr>
            ) : (
              attendances.map((record) => {
                const isSelected = selectedItems.has(record.id);
                return (
                  <tr key={record.id} className={`hover:bg-base-200/40 transition-colors group ${isSelected ? "bg-primary/5" : ""}`}>
                    {canVerify && (
                      <td className="pl-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleSelection(record.id)} 
                          className="checkbox checkbox-primary checkbox-sm rounded" 
                        />
                      </td>
                    )}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-9 h-9 rounded-full border border-base-300">
                            <img src={record.profile_picture || "/images/default_profile.jpg"} alt="" className="object-cover" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-base-content">{record.fullname}</span>
                          <span className="text-[10px] opacity-50 truncate max-w-[120px]">{record.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-medium tabular-nums">{formatDate(record.date)}</td>
                    <td className="py-4"><TimeCell record={record} type="in" /></td>
                    <td className="py-4"><TimeCell record={record} type="out" /></td>
                    <td className="py-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`badge badge-sm font-bold uppercase ${getVerificationBadge(record.status_in)}`}>
                          {record.status_in}
                        </span>
                        {canVerify && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onVerifyDay(record.id, "Rejected")} className={`btn btn-xs btn-square ${record.status_in === 'Rejected' ? 'btn-error' : 'btn-ghost text-error'}`}><XCircle className="size-4" /></button>
                            <button onClick={() => onVerifyDay(record.id, "Verified")} className={`btn btn-xs btn-square ${record.status_in === 'Verified' ? 'btn-primary' : 'btn-ghost text-primary'}`}><CheckCircle className="size-4" /></button>
                          </div>
                        )}
                      </div>
                    </td>
                    {canManualEntry && (
                      <td className="py-4 pr-6">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => onEdit(record)} className="btn btn-ghost btn-square btn-sm hover:text-primary"><Pencil className="size-4" /></button>
                          <button onClick={() => onDelete(record.id)} className="btn btn-ghost btn-square btn-sm hover:text-error"><Trash className="size-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AttendanceVerificationModal
        isOpen={modalData.isOpen}
        data={modalData}
        onClose={closeModal}
        onVerify={handleVerificationAction}
      />
    </div>
  );
};

export default AttendanceTableList;