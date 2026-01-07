"use client";

import { useState, useEffect } from "react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";
import {
  X,
  Save,
  Calendar,
  Clock,
  User,
  Activity, // Added for Status icon
} from "lucide-react";

const AddNewAttendanceModal = ({ isOpen, onClose, users }) => {
  const { createManualEntry, fetchAllAttendances } = useAttendanceStore();

  const [formData, setFormData] = useState({
    userId: "",
    date: new Date().toISOString().split("T")[0],
    timeIn: "08:00",
    timeOut: "17:00",
    status: "Present",
    photoIn: "",
    photoOut: "",
  });

  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        userId: "",
        date: new Date().toISOString().split("T")[0],
        timeIn: "08:00",
        timeOut: "17:00",
        status: "Present",
        photoIn: "",
        photoOut: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        // Ensure seconds are included if your backend requires HH:mm:ss
        timeIn: formData.status === "Absent" ? null : `${formData.timeIn}:00`,
        timeOut: formData.status === "Absent" ? null : `${formData.timeOut}:00`,
      };

      await createManualEntry(payload);
      await fetchAllAttendances();
      onClose(); // Close using prop function
    } catch (error) {
      console.error("Manual Entry Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAbsent = formData.status === "Absent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Add Manual Record
            </h2>
            <p className="text-sm text-base-content/60">
              Create a new attendance entry for an employee.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="attendance-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5"
          >
            {/* Employee Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Employee</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none z-10" />
                <select
                  required
                  className="select select-bordered w-full pl-10"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Date</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Calendar className="size-4 text-base-content/50" />
                  <input
                    type="date"
                    required
                    className="grow"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </label>
              </div>

              {/* Status Dropdown */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Status</span>
                </label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none z-10" />
                  <select
                    className="select select-bordered w-full pl-10"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Undertime">Undertime</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Time In & Out Grid */}
            <div
              className={`grid grid-cols-2 gap-4 transition-all duration-300 ${
                isAbsent ? "opacity-50 grayscale" : "opacity-100"
              }`}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Time In</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Clock className="size-4 text-success" />
                  <input
                    type="time"
                    className="grow"
                    value={formData.timeIn}
                    onChange={(e) =>
                      setFormData({ ...formData, timeIn: e.target.value })
                    }
                    disabled={isAbsent}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Time Out</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Clock className="size-4 text-error" />
                  <input
                    type="time"
                    className="grow"
                    value={formData.timeOut}
                    onChange={(e) =>
                      setFormData({ ...formData, timeOut: e.target.value })
                    }
                    disabled={isAbsent}
                  />
                </label>
              </div>
            </div>

            {isAbsent && (
              <div className="alert alert-warning text-sm py-2 rounded-lg">
                <Activity className="size-4" />
                <span>Times are ignored for Absent status.</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-base-300 flex justify-end gap-3 bg-base-100 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="attendance-form"
            className="btn btn-primary px-6"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <Save className="size-4 mr-1" />
                Save Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewAttendanceModal;
