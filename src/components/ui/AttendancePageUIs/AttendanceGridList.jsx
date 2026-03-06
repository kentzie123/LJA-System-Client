"use client";

import React, { useState } from "react";
import Image from "next/image"; // <-- IMPORT NEXT IMAGE
import {
  Trash,
  Clock,
  Calendar,
  X,
  Maximize2,
  CheckSquare,
  Square,
  CheckCircle,
  XCircle,
  FileText,
  User,
} from "lucide-react";

import VerifyConfirmModal from "./VerifyConfirmModal";

/**
 * HELPER: Format time to 12-hour format
 */
const formatTime = (timeString) => {
  if (!timeString) return "--:--";
  return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * HELPER: Status Badge Styles
 */
const getStatusStyles = (status) => {
  switch (status) {
    case "Verified":
      return "bg-success/10 text-success border-success/20";
    case "Rejected":
      return "bg-error/10 text-error border-error/20";
    default:
      return "bg-warning/80 text-black border-warning/30";
  }
};

/**
 * HELPER: Smart Image URL Builder
 * Handles old Base64 images, external URLs, and our new local Uploads
 */
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("data:image") || path.startsWith("http")) return path;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return `${backendUrl}${path}`;
};

const AttendanceGridList = ({
  attendances = [],
  onVerifyDay,
  onDelete,
  canManualEntry = false,
  canVerify = false,
}) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [previewImage, setPreviewImage] = useState(null);

  // Modal States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionData, setActionData] = useState({
    type: null,
    targetId: null,
    status: null,
  });

  // --- 1. TIME CHECK LOGIC ---
  const checkTimeFlag = (timeString, type) => {
    if (!timeString) return false;
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (type === "in") return totalMinutes > 495; // 8:15 AM
    if (type === "out") return totalMinutes < 1020; // 5:00 PM
    return false;
  };

  // --- 2. SELECTION LOGIC ---
  const isAllSelected =
    attendances.length > 0 && selectedItems.size === attendances.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems(new Set());
    } else {
      const allIds = attendances.map((r) => r.id);
      setSelectedItems(new Set(allIds));
    }
  };

  const toggleSelection = (id) => {
    if (!canVerify) return;
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  // --- 3. VERIFICATION HANDLERS ---
  const triggerBulkAction = (status) => {
    setActionData({ type: "bulk", status, targetId: null });
    setConfirmModalOpen(true);
  };

  const triggerSingleAction = (id, status) => {
    setActionData({ type: "single", status, targetId: id });
    setConfirmModalOpen(true);
  };

  const executeAction = async () => {
    if (!onVerifyDay) return;

    if (actionData.type === "bulk") {
      for (const id of selectedItems) {
        await onVerifyDay(id, actionData.status);
      }
      setSelectedItems(new Set());
    } else if (actionData.type === "single") {
      await onVerifyDay(actionData.targetId, actionData.status);
    }
  };

  if (attendances.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* --- CONFIRMATION MODAL --- */}
      <VerifyConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={executeAction}
        statusToApply={actionData.status}
        itemCount={actionData.type === "bulk" ? selectedItems.size : 1}
      />

      {/* --- BULK ACTION TOOLBAR --- */}
      {canVerify && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-base-100 border border-base-300 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={toggleSelectAll}
              className="btn btn-ghost btn-sm gap-2 hover:bg-base-200/50"
            >
              {isAllSelected ? (
                <CheckSquare className="size-5 text-primary" />
              ) : (
                <Square className="size-5 text-base-content/40" />
              )}
              <span className="font-bold text-sm">
                {isAllSelected ? "Deselect All" : "Select All"}
              </span>
            </button>
            {selectedItems.size > 0 && (
              <div className="badge badge-primary badge-sm py-2.5 px-3 font-bold shadow-sm">
                {selectedItems.size} Selected
              </div>
            )}
          </div>

          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in">
              <button
                onClick={() => triggerBulkAction("Rejected")}
                className="btn btn-sm btn-outline border-base-300 hover:bg-error hover:border-error hover:text-white flex-1 sm:flex-none gap-1.5 shadow-sm"
              >
                <XCircle className="size-4" /> Reject
              </button>
              <button
                onClick={() => triggerBulkAction("Verified")}
                className="btn btn-sm btn-primary flex-1 sm:flex-none gap-1.5 shadow-sm shadow-primary/20"
              >
                <CheckCircle className="size-4" /> Verify
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- IMAGE PREVIEW MODAL --- */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-neutral-900/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-6 right-6 btn btn-circle btn-ghost text-white bg-black/20 hover:bg-black/40 z-10"
            onClick={() => setPreviewImage(null)}
          >
            <X className="size-6" />
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <Image
              src={getImageUrl(previewImage)}
              fill
              className="object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
              alt="Enlarged Proof"
              sizes="100vw"
            />
          </div>
        </div>
      )}

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {attendances.map((record, index) => {
          const isSelected = selectedItems.has(record.id);
          const isLate = checkTimeFlag(record.time_in, "in");
          const isUndertime = checkTimeFlag(record.time_out, "out");

          return (
            <div
              key={record.id}
              className={`group relative flex flex-col bg-base-100 rounded-2xl border transition-all duration-300 overflow-hidden ${
                isSelected
                  ? "border-primary ring-1 ring-primary/30 shadow-md shadow-primary/5"
                  : "border-base-300 hover:shadow-lg hover:border-base-300/80 shadow-sm"
              }`}
            >
              {/* Header: Employee Info */}
              <div className="p-4 flex items-center justify-between border-b border-base-200/60 bg-base-100/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="avatar shrink-0">
                    <div className="relative w-10 h-10 rounded-full ring-1 ring-base-300 bg-base-200 flex items-center justify-center overflow-hidden">
                      {record.profile_picture ? (
                        <Image
                          src={getImageUrl(record.profile_picture)}
                          alt={record.fullname}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <User className="size-5 text-base-content/30" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-sm text-base-content truncate">
                      {record.fullname}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-50 uppercase tracking-widest mt-0.5">
                      <Calendar className="size-3" />
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions (Checkbox / Delete) */}
                <div className="flex items-center gap-2 shrink-0">
                  {canVerify && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(record.id)}
                      className="checkbox checkbox-primary checkbox-sm rounded-md shadow-sm"
                    />
                  )}
                  {canManualEntry && (
                    <button
                      onClick={() => onDelete(record.id)}
                      className="btn btn-ghost btn-xs btn-square text-error"
                    >
                      <Trash className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Middle: Side-by-Side Proofs */}
              <div className="flex h-48 bg-base-200/50 divide-x divide-base-100 shrink-0">
                {/* Time In */}
                <div
                  className="flex-1 relative overflow-hidden group/in cursor-zoom-in"
                  onClick={() =>
                    record.photo_in && setPreviewImage(record.photo_in)
                  }
                >
                  {record.photo_in ? (
                    <>
                      <Image
                        src={getImageUrl(record.photo_in)}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover/in:scale-105"
                        alt="Time In"
                        priority={index < 4}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/in:bg-black/20 transition-colors flex items-center justify-center z-10">
                        <Maximize2 className="text-white size-6 opacity-0 group-hover/in:opacity-100 transition-opacity drop-shadow-md" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-base-content/20 bg-base-200">
                      <Clock className="size-6 mb-1 opacity-50" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        No Photo
                      </span>
                    </div>
                  )}

                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent p-3 flex flex-col justify-end pointer-events-none z-20">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-black text-white/70 tracking-widest uppercase">
                        Check In
                      </span>
                      {isLate && (
                        <span className="bg-error/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest shadow-sm">
                          Late
                        </span>
                      )}
                    </div>
                    <span className="text-xl font-black tabular-nums text-white leading-none tracking-tight">
                      {formatTime(record.time_in)}
                    </span>
                  </div>
                </div>

                {/* Time Out */}
                <div
                  className={`flex-1 relative overflow-hidden group/out ${record.photo_out ? "cursor-zoom-in" : ""}`}
                  onClick={() =>
                    record.photo_out && setPreviewImage(record.photo_out)
                  }
                >
                  {record.photo_out ? (
                    <>
                      <Image
                        src={getImageUrl(record.photo_out)}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover/out:scale-105"
                        alt="Time Out"
                        priority={index < 4}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/out:bg-black/20 transition-colors flex items-center justify-center z-10">
                        <Maximize2 className="text-white size-6 opacity-0 group-hover/out:opacity-100 transition-opacity drop-shadow-md" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-base-200/80 text-base-content/30 italic text-[10px] p-4 text-center">
                      Shift active...
                    </div>
                  )}

                  {record.time_out && (
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent p-3 flex flex-col justify-end pointer-events-none z-20">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-black text-white/70 tracking-widest uppercase">
                          Check Out
                        </span>
                        {isUndertime && (
                          <span className="bg-warning/90 text-warning-content text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest shadow-sm">
                            Undertime
                          </span>
                        )}
                      </div>
                      <span className="text-xl font-black tabular-nums text-white leading-none tracking-tight">
                        {formatTime(record.time_out)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Summary (Collapsible/Scrollable Area) */}
              {record.work_summary && (
                <div className="p-4 bg-base-100/50 border-t border-base-200/60 flex flex-col min-h-[80px] max-h-[120px] overflow-hidden">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-40 uppercase mb-1.5 tracking-widest">
                    <FileText className="size-3.5" /> Work Summary
                  </div>
                  <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                    <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                      {record.work_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer: Status & Verification Actions */}
              <div className="p-3 bg-base-200/30 flex items-center justify-between border-t border-base-200 mt-auto shrink-0">
                <div
                  className={`badge badge-sm py-3 px-3 font-bold border ${getStatusStyles(record.status_in)}`}
                >
                  {record.status_in.toUpperCase()}
                </div>

                {canVerify && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => triggerSingleAction(record.id, "Rejected")}
                      className={`btn btn-xs h-8 px-3 rounded-lg ${record.status_in === "Rejected" ? "btn-error" : "btn-ghost text-error hover:bg-error/10 border border-transparent hover:border-error/20"}`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => triggerSingleAction(record.id, "Verified")}
                      className={`btn btn-xs h-8 px-4 rounded-lg shadow-sm ${record.status_in === "Verified" ? "btn-success text-white" : "btn-primary"}`}
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceGridList;
