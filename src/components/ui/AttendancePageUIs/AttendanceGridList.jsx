"use client";

import React, { useState, useMemo } from "react";
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
  Users,
  Timer,
  AlertCircle,
} from "lucide-react";

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
      return "bg-success text-success-content border-none";
    case "Rejected":
      return "bg-error text-error-content border-none";
    default:
      return "bg-warning text-warning-content border-none";
  }
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

  // --- 1. TIME CHECK LOGIC ---
  const checkTimeFlag = (timeString, type) => {
    if (!timeString) return false;
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (type === "in") return totalMinutes > 495; // 8:15 AM
    if (type === "out") return totalMinutes < 1020; // 5:00 PM
    return false;
  };

  // --- 2. SUMMARY STATISTICS ---
  const stats = useMemo(() => {
    const total = attendances.length;
    const late = attendances.filter((a) =>
      checkTimeFlag(a.time_in, "in"),
    ).length;
    const undertime = attendances.filter(
      (a) => a.time_out && checkTimeFlag(a.time_out, "out"),
    ).length;
    const onTime = total - late;

    return { total, late, onTime, undertime };
  }, [attendances]);

  // --- 3. SELECTION LOGIC ---
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

  const handleBulkVerify = async (status) => {
    if (!onVerifyDay) return;
    for (const id of selectedItems) {
      await onVerifyDay(id, status);
    }
    setSelectedItems(new Set());
  };

  return (
    <div className="space-y-6">
      {/* --- SECTION 2: BULK ACTION TOOLBAR --- */}
      {canVerify && attendances.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-xl border border-base-300 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="btn btn-ghost btn-sm gap-2 hover:bg-base-200"
            >
              {isAllSelected ? (
                <CheckSquare className="size-5 text-primary" />
              ) : (
                <Square className="size-5 opacity-50" />
              )}
              <span className="font-bold text-sm">
                {isAllSelected ? "Deselect All" : "Select All Visible"}
              </span>
            </button>

            {selectedItems.size > 0 && (
              <div className="badge badge-primary font-bold px-3 py-3">
                {selectedItems.size} Selected
              </div>
            )}
          </div>

          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleBulkVerify("Rejected")}
                className="btn btn-sm btn-error btn-outline flex-1 sm:flex-none gap-2"
              >
                <XCircle className="size-4" /> Reject Selected
              </button>
              <button
                onClick={() => handleBulkVerify("Verified")}
                className="btn btn-sm btn-primary flex-1 sm:flex-none gap-2"
              >
                <CheckCircle className="size-4" /> Verify Selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- SECTION 3: IMAGE PREVIEW MODAL (LIGHTBOX) --- */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-5 right-5 btn btn-circle btn-ghost text-white"
            onClick={() => setPreviewImage(null)}
          >
            <X className="size-8" />
          </button>
          <img
            src={previewImage}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transform scale-x-[-1]"
            alt="Enlarged Proof"
          />
        </div>
      )}

      {/* --- SECTION 4: MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {attendances.map((record) => {
          const isSelected = selectedItems.has(record.id);
          const isLate = checkTimeFlag(record.time_in, "in");
          const isUndertime = checkTimeFlag(record.time_out, "out");

          return (
            <div
              key={record.id}
              className={`group relative flex flex-col bg-base-100 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                isSelected
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-base-300 hover:border-base-content/20"
              }`}
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-base-200 bg-base-100">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full ring-1 ring-base-300 ring-offset-2">
                      <img
                        src={
                          record.profile_picture ||
                          "/images/default_profile.jpg"
                        }
                        alt={record.fullname}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-none mb-1">
                      {record.fullname}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs opacity-50 uppercase font-semibold">
                      <Calendar className="size-3" />
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canVerify && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(record.id)}
                      className="checkbox checkbox-primary checkbox-sm rounded-md"
                    />
                  )}
                  {canManualEntry && (
                    <button
                      onClick={() => onDelete(record.id)}
                      className="btn btn-ghost btn-xs btn-circle text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Side-by-Side Proofs */}
              <div className="flex h-56 bg-neutral divide-x divide-base-100/10">
                {/* Time In Section */}
                <div
                  className="flex-1 relative overflow-hidden cursor-zoom-in group/in"
                  onClick={() =>
                    record.photo_in && setPreviewImage(record.photo_in)
                  }
                >
                  {record.photo_in ? (
                    <>
                      <img
                        src={record.photo_in}
                        className="w-full h-full object-cover transform scale-x-[-1] transition-all group-hover/in:brightness-75"
                        alt="Time In"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/in:opacity-100 transition-opacity z-10">
                        <Maximize2 className="text-white size-8 drop-shadow-lg" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                      <Clock className="size-8 mb-1" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-3 flex flex-col justify-end pointer-events-none z-20">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black text-white/50 tracking-widest uppercase">
                        Check In
                      </span>
                      {isLate && (
                        <span className="bg-error text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ">
                          LATE
                        </span>
                      )}
                    </div>
                    <span className="text-xl font-black text-white">
                      {formatTime(record.time_in)}
                    </span>
                  </div>
                </div>

                {/* Time Out Section */}
                <div
                  className={`flex-1 relative overflow-hidden group/out ${record.photo_out ? "cursor-zoom-in" : ""}`}
                  onClick={() =>
                    record.photo_out && setPreviewImage(record.photo_out)
                  }
                >
                  {record.photo_out ? (
                    <>
                      <img
                        src={record.photo_out}
                        className="w-full h-full object-cover transform scale-x-[-1] transition-all group-hover/out:brightness-75"
                        alt="Time Out"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/out:opacity-100 transition-opacity z-10">
                        <Maximize2 className="text-white size-8 drop-shadow-lg" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-base-300 text-base-content/20 italic text-[10px] p-4 text-center">
                      Shift in progress...
                    </div>
                  )}

                  {record.time_out && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-3 flex flex-col justify-end pointer-events-none z-20">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-black text-white/50 tracking-widest uppercase">
                          Check Out
                        </span>
                        {isUndertime && (
                          <span className="bg-warning text-warning-content text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            UNDERTIME
                          </span>
                        )}
                      </div>
                      <span className="text-xl font-black text-white">
                        {formatTime(record.time_out)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-3 bg-base-100 flex items-center justify-between border-t border-base-200">
                <div
                  className={`badge badge-sm py-3 px-3 font-bold ${getStatusStyles(record.status_in)}`}
                >
                  {record.status_in.toUpperCase()}
                </div>
                {canVerify && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => onVerifyDay(record.id, "Rejected")}
                      className={`btn btn-xs ${record.status_in === "Rejected" ? "btn-error" : "btn-ghost text-error hover:bg-error/10"}`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onVerifyDay(record.id, "Verified")}
                      className={`btn btn-xs px-4 ${record.status_in === "Verified" ? "btn-primary" : "btn-outline btn-primary"}`}
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

      {attendances.length === 0 && (
        <div className="text-center py-20 text-base-content/50">
          No records found.
        </div>
      )}
    </div>
  );
};

export default AttendanceGridList;
