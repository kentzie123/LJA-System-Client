"use client";

import { useState, useEffect } from "react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";
import { X, Save, Calendar, Clock, User } from "lucide-react";

const EditAttendanceModal = ({ isOpen, onClose, users, record }) => {
  const { updateAttendance, isEditingAttendance, fetchAllAttendances } =
    useAttendanceStore();

  const [formData, setFormData] = useState({
    userId: "",
    date: "",
    timeIn: "",
    timeOut: "",
  });

  // Populate form when modal opens or record changes
  useEffect(() => {
    if (isOpen && record) {
      setFormData({
        userId: record.user_id || "",
        // Ensure date is YYYY-MM-DD
        date: record.date
          ? new Date(record.date).toISOString().split("T")[0]
          : "",
        // Ensure time is HH:MM (Postgres often returns HH:MM:SS)
        timeIn: record.time_in ? record.time_in.slice(0, 5) : "",
        timeOut: record.time_out ? record.time_out.slice(0, 5) : "",
      });
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. Call update with ID and Data
    await updateAttendance(record.id, formData);
    // 2. Refresh list
    await fetchAllAttendances();
    // 3. Close
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300">
          <div>
            <div className="text-lg font-bold">Edit Attendance</div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Update details for{" "}
              <span className="font-semibold text-base-content">
                {record?.fullname}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <div className="py-4 px-6 space-y-1 overflow-y-auto custom-scrollbar">
          <form id="edit-attendance-form" onSubmit={handleSubmit}>
            {/* 1. Employee Selection */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">
                Employee
              </legend>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none z-10" />
                <select
                  required
                  className="select select-bordered w-full pl-10 text-xs"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                >
                  <option value="">Select Employee</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullname}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            {/* 2. Date Selection */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">
                Date
              </legend>
              <div className="relative">
                <input
                  type="date"
                  required
                  className="input input-bordered w-full pl-10 text-xs"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
              </div>
            </fieldset>

            {/* GRID: Time In & Out */}
            <div className="grid grid-cols-2 gap-4 mt-1">
              {/* 3. Time In */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs font-semibold text-success">
                  Time In
                </legend>
                <div className="relative">
                  <input
                    type="time"
                    className="input input-bordered w-full pl-10 text-xs"
                    value={formData.timeIn}
                    onChange={(e) =>
                      setFormData({ ...formData, timeIn: e.target.value })
                    }
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-success pointer-events-none" />
                </div>
              </fieldset>

              {/* 4. Time Out */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs font-semibold text-error">
                  Time Out
                </legend>
                <div className="relative">
                  <input
                    type="time"
                    className="input input-bordered w-full pl-10 text-xs"
                    value={formData.timeOut}
                    onChange={(e) =>
                      setFormData({ ...formData, timeOut: e.target.value })
                    }
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-error pointer-events-none" />
                </div>
              </fieldset>
            </div>

            {/* --- FOOTER BUTTONS --- */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn text-xs"
                disabled={isEditingAttendance}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs"
                disabled={isEditingAttendance}
              >
                {isEditingAttendance ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Save className="size-4 mr-1" />
                    Update Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
