"use client";

import React, { useState } from "react";
import Image from "next/image";
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
import { getImageUrl } from "@/utils/getImageUrl";

const formatTime = (timeString) => {
  if (!timeString) return "--:--";
  return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getStatusStyles = (status) => {
  switch (status) {
    case "Verified":
      return "bg-success/10 text-success border-success/20";
    case "Rejected":
      return "bg-error/10 text-error border-error/20";
    default:
      return "bg-warning/10 text-warning border-warning/20";
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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionData, setActionData] = useState({
    type: null,
    targetId: null,
    status: null,
  });

  const checkTimeFlag = (timeString, type) => {
    if (!timeString) return false;
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (type === "in") return totalMinutes > 495; // 8:15 AM
    if (type === "out") return totalMinutes < 1020; // 5:00 PM
    return false;
  };

  const isAllSelected =
    attendances.length > 0 && selectedItems.size === attendances.length;

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
      for (const id of selectedItems) await onVerifyDay(id, actionData.status);
      setSelectedItems(new Set());
    } else if (actionData.type === "single") {
      await onVerifyDay(actionData.targetId, actionData.status);
    }
  };

  if (attendances.length === 0) return null;

  return (
    <div className="space-y-4 antialiased-text">
      <VerifyConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={executeAction}
        statusToApply={actionData.status}
        itemCount={actionData.type === "bulk" ? selectedItems.size : 1}
      />

      {/* --- COMPACT BULK TOOLBAR --- */}
      {canVerify && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-base-200/50 border border-base-300 shadow-sm transition-all overflow-hidden h-12">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="btn btn-ghost btn-sm h-8 min-h-0 px-2 gap-2 hover:bg-base-300/50"
            >
              {isAllSelected ? (
                <CheckSquare size={16} className="text-primary" />
              ) : (
                <Square size={16} className="opacity-40" />
              )}
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {isAllSelected ? "Deselect" : "Select All"}
              </span>
            </button>
            {selectedItems.size > 0 && (
              <div className="text-[10px] font-black bg-primary text-primary-content px-2 py-0.5 rounded uppercase tracking-tighter">
                {selectedItems.size} items
              </div>
            )}
          </div>

          {selectedItems.size > 0 && (
            <div className="flex items-center gap-1.5 animate-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => triggerBulkAction("Rejected")}
                className="btn btn-xs h-8 min-h-0 btn-outline border-base-300 hover:bg-error hover:border-error text-[10px] font-bold px-3 uppercase tracking-widest"
              >
                Reject
              </button>
              <button
                onClick={() => triggerBulkAction("Verified")}
                className="btn btn-xs h-8 min-h-0 btn-primary text-[10px] font-bold px-4 uppercase tracking-widest shadow-sm"
              >
                Verify Selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {attendances.map((record, index) => {
          const isSelected = selectedItems.has(record.id);
          const isLate = checkTimeFlag(record.time_in, "in");
          const isUndertime = checkTimeFlag(record.time_out, "out");

          return (
            <div
              key={record.id}
              className={`group flex flex-col bg-base-100 rounded-xl border transition-all duration-200 overflow-hidden ${
                isSelected
                  ? "border-primary ring-1 ring-primary/20 shadow-md shadow-primary/5"
                  : "border-base-300 hover:border-base-300/80 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Card Header */}
              <div className="p-3 flex items-center justify-between border-b border-base-200 bg-base-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-8 h-8 rounded-full ring-1 ring-base-300 bg-base-200 overflow-hidden shrink-0">
                    {record.profile_picture ? (
                      <Image
                        src={getImageUrl(record.profile_picture)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-30">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-[13px] text-base-content truncate leading-tight">
                      {record.fullname}
                    </h3>
                    <div className="flex items-center gap-1 text-[9px] font-black opacity-40 uppercase tracking-tighter">
                      <Calendar size={10} />
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {canVerify && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(record.id)}
                      className="checkbox checkbox-primary checkbox-xs rounded shadow-sm opacity-60 group-hover:opacity-100 transition-opacity"
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

              {/* Photo Area (h-40 is better for grid density) */}
              <div className="flex h-40 bg-base-200 divide-x divide-base-100/30 relative">
                {[
                  {
                    key: "in",
                    photo: record.photo_in,
                    time: record.time_in,
                    flag: isLate,
                    label: "IN",
                    flagText: "LATE",
                  },
                  {
                    key: "out",
                    photo: record.photo_out,
                    time: record.time_out,
                    flag: isUndertime,
                    label: "OUT",
                    flagText: "UNDER",
                  },
                ].map((p) => (
                  <div
                    key={p.key}
                    className="flex-1 relative overflow-hidden cursor-zoom-in group/img bg-base-300"
                    onClick={() => p.photo && setPreviewImage(p.photo)}
                  >
                    {p.photo ? (
                      <>
                        <Image
                          src={getImageUrl(p.photo)}
                          fill
                          className="object-cover transition-transform duration-700 group-hover/img:scale-110"
                          alt={p.label}
                          sizes="200px"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center">
                          <Maximize2 className="text-white size-5 opacity-0 group-hover/img:opacity-100 transition-all transform scale-75 group-hover/img:scale-100" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
                        <Clock size={20} />
                        <span className="text-[8px] font-bold mt-1">
                          NO DATA
                        </span>
                      </div>
                    )}

                    {/* Time Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end pointer-events-none">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[8px] font-black text-white/50 tracking-[0.2em]">
                          {p.label}
                        </span>
                        {p.flag && (
                          <span
                            className={`px-1 rounded-[2px] text-[8px] font-black text-white ${p.key === "in" ? "bg-error" : "bg-warning text-black"}`}
                          >
                            {p.flagText}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-black text-white tabular-nums tracking-tighter">
                        {formatTime(p.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-base-100 border-t border-base-200 flex-1 min-h-[54px] max-w-full">
                <div className="flex items-center gap-1.5 text-[9px] font-black opacity-30 uppercase tracking-[0.15em] mb-1">
                  <FileText size={10} /> Summary
                </div>

                {/* The scrollable container */}
                <div className="overflow-x-auto overflow-y-hidden custom-scrollbar-xs pb-1">
                  <p className="text-[11px] text-base-content/70 whitespace-nowrap font-medium italic leading-none">
                    {record.work_summary ||
                      "No work summary provided for this shift."}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-3 py-2 bg-base-200/40 border-t border-base-200 flex items-center justify-between h-12">
                <div
                  className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getStatusStyles(record.status_in)}`}
                >
                  {record.status_in}
                </div>

                {canVerify && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerSingleAction(record.id, "Rejected")}
                      className={`btn btn-xs h-7 px-2.5 rounded-md text-[10px] font-bold uppercase tracking-tighter ${record.status_in === "Rejected" ? "btn-error" : "btn-ghost text-error hover:bg-error/10"}`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => triggerSingleAction(record.id, "Verified")}
                      className={`btn btn-xs h-7 px-3 rounded-md text-[10px] font-bold uppercase tracking-tighter ${record.status_in === "Verified" ? "btn-success text-white shadow-sm" : "btn-primary shadow-sm"}`}
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

      {/* Enlarged Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X size={32} />
          </button>
          <div className="relative w-full h-[85vh] max-w-4xl">
            <Image
              src={getImageUrl(previewImage)}
              fill
              className="object-contain"
              alt="Preview"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceGridList;
