"use client";

import React, { useState } from "react";
import { X, Clock, Camera } from "lucide-react";

const CalendarDetailsModal = ({
  selectedCell,
  activeUser,
  onClose,
  getStatusColors,
}) => {
  const [expandedPhoto, setExpandedPhoto] = useState(null);

  if (!selectedCell) return null;

  const formatModalDate = (dateObj) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const d = dateObj.getDate();
    const suffix =
      d % 10 === 1 && d !== 11
        ? "st"
        : d % 10 === 2 && d !== 12
          ? "nd"
          : d % 10 === 3 && d !== 13
            ? "rd"
            : "th";
    return `${days[dateObj.getDay()]}, ${months[dateObj.getMonth()]} ${d}${suffix}, ${dateObj.getFullYear()}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-base-content/50 hover:text-base-content bg-base-200 hover:bg-base-300 transition-colors p-1.5 rounded-full z-10"
          >
            <X size={20} strokeWidth={3} />
          </button>

          {/* Header Row */}
          <div className="p-8 pb-4">
            <h2 className="text-2xl font-bold text-base-content mb-6 tracking-tight pr-8">
              {formatModalDate(selectedCell.dateObj)}
            </h2>

            <div className="bg-base-200 rounded-2xl p-4 flex items-center justify-between border border-base-300">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-base-300 shrink-0 border border-base-300">
                  <img
                    src={
                      activeUser?.profile_picture ||
                      "/images/default_profile.jpg"
                    }
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/default_profile.jpg";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base-content font-semibold text-base truncate">
                    {activeUser?.fullname}
                  </h3>
                  <p className="text-base-content/60 text-sm truncate">
                    {activeUser?.position || "Employee"}
                  </p>
                </div>
              </div>

              <div
                className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shrink-0 ${getStatusColors(selectedCell.status).bg} ${getStatusColors(selectedCell.status).text}`}
              >
                {getStatusColors(selectedCell.status).icon &&
                  React.createElement(
                    getStatusColors(selectedCell.status).icon,
                    { size: 16 },
                  )}
                {selectedCell.status}
              </div>
            </div>
          </div>

          {/* Body Area */}
          <div className="px-8 pb-8 pt-2 overflow-y-auto max-h-[60vh] custom-scrollbar animate-in slide-in-from-bottom-2">
            {/* LEAVE UI */}
            {selectedCell.status === "Leave" && selectedCell.leave ? (
              <div
                className={`bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl p-5`}
              >
                <h4 className="text-fuchsia-700 dark:text-fuchsia-400 font-bold text-sm mb-2">
                  Leave Details
                </h4>
                <p className="text-base-content/80 text-sm leading-relaxed font-medium">
                  {selectedCell.leave.reason ||
                    selectedCell.leave.leave_type ||
                    "Approved Time Off."}
                </p>
              </div>
            ) : /* ATTENDANCE / OT UI */
            selectedCell.record ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Time In Card */}
                  <div className="bg-base-200 border border-base-300 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-primary text-sm font-bold mb-3">
                      <Clock size={16} /> Time In
                    </div>
                    {/* Increased mb-2 to mb-4 to make up for removed location text */}
                    <div className="text-3xl font-black text-base-content tabular-nums mb-4 tracking-tight">
                      {formatTime(selectedCell.record.time_in)}
                    </div>
                    <div
                      className="h-[120px] bg-base-300 rounded-xl overflow-hidden relative border border-base-content/10 group cursor-pointer"
                      onClick={() =>
                        selectedCell.record.photo_in &&
                        setExpandedPhoto(selectedCell.record.photo_in)
                      }
                    >
                      {selectedCell.record.photo_in ? (
                        <img
                          src={selectedCell.record.photo_in}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-base-content/30 bg-base-200">
                          <Camera size={24} className="mb-1" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-base-100/90 backdrop-blur px-2.5 py-1 rounded shadow-sm text-[10px] text-base-content flex items-center gap-1.5 font-bold pointer-events-none">
                        <Camera size={12} className="text-base-content/50" />{" "}
                        Photo In
                      </div>
                    </div>
                  </div>

                  {/* Time Out Card */}
                  <div className="bg-base-200 border border-base-300 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-primary text-sm font-bold mb-3">
                      <Clock size={16} /> Time Out
                    </div>
                    {/* Increased mb-2 to mb-4 to make up for removed location text */}
                    <div className="text-3xl font-black text-base-content tabular-nums mb-4 tracking-tight">
                      {formatTime(selectedCell.record.time_out)}
                    </div>
                    <div
                      className="h-[120px] bg-base-300 rounded-xl overflow-hidden relative border border-base-content/10 group cursor-pointer"
                      onClick={() =>
                        selectedCell.record.photo_out &&
                        setExpandedPhoto(selectedCell.record.photo_out)
                      }
                    >
                      {selectedCell.record.photo_out ? (
                        <img
                          src={selectedCell.record.photo_out}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-base-content/30 bg-base-200">
                          <Camera size={24} className="mb-1" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-base-100/90 backdrop-blur px-2.5 py-1 rounded shadow-sm text-[10px] text-base-content flex items-center gap-1.5 font-bold pointer-events-none">
                        <Camera size={12} className="text-base-content/50" />{" "}
                        Photo Out
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Summary Card */}
                <div className="bg-base-200 border border-base-300 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-base-content font-bold text-sm">
                      Work Summary
                    </h4>
                    <span className="text-primary text-sm font-bold tracking-wide">
                      {selectedCell.record.worked_hours || "0.00"} hrs total
                    </span>
                  </div>
                  <p className="text-base-content/80 text-sm leading-relaxed font-medium">
                    {selectedCell.record.work_summary ||
                      "No work summary provided."}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* --- EXPANDED PHOTO VIEWER --- */}
      {expandedPhoto && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setExpandedPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-full z-10"
            onClick={() => setExpandedPhoto(null)}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
          <img
            src={expandedPhoto}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default CalendarDetailsModal;
