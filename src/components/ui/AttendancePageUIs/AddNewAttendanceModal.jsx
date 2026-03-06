"use client";

import { useState, useEffect } from "react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  X,
  Calendar,
  Clock,
  Activity,
  CheckCircle,
  Type,
  Image as ImageIcon,
} from "lucide-react";

import UserSelectDropdown from "../Selections/UserSelectDropdown";
// --- ADDED IMPORT ---
import CustomDatePicker from "../Selections/CustomDatePicker";

const AddNewAttendanceModal = ({ isOpen, onClose, users }) => {
  const { authUser } = useAuthStore();
  const {
    createManualEntry,
    adminClockOverride,
    isAddingAttendance,
    isCreating,
    fetchAllAttendances,
  } = useAttendanceStore();

  const isSuperAdmin = authUser?.role_id === 3;

  const [formData, setFormData] = useState({
    userId: "",
    date: new Date().toLocaleDateString("en-CA"),
    timeIn: "08:00",
    timeOut: "17:00",
    status: "Present",
    type: "in",
    overrideTime: "",
    photo: null,
    workSummary: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        userId: "",
        date: new Date().toLocaleDateString("en-CA"),
        timeIn: "08:00",
        timeOut: "17:00",
        status: "Present",
        type: "in",
        overrideTime: "",
        photo: null,
        workSummary: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId) {
      alert("Please select an employee first.");
      return;
    }

    if (isSuperAdmin) {
      const payload = {
        targetUserId: formData.userId,
        type: formData.type,
        date: formData.date,
        overrideTime: formData.overrideTime,
        photo: formData.photo,
        workSummary: formData.type === "out" ? formData.workSummary : undefined,
      };
      await adminClockOverride(payload);
    } else {
      const payload = {
        userId: formData.userId,
        date: formData.date,
        timeIn: formData.timeIn,
        timeOut: formData.timeOut,
        status: formData.status,
        workSummary: formData.status !== "Absent" ? formData.workSummary : undefined,
      };
      await createManualEntry(payload);
    }

    fetchAllAttendances();
    onClose();
  };

  const isAbsent = formData.status === "Absent";
  const isProcessing = isAddingAttendance || isCreating;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh]">
        {/* --- HEADER --- */}
        <div
          className={`flex items-center justify-between py-4 px-6 border-b border-base-300 ${isSuperAdmin ? "bg-primary/10 text-primary" : "bg-base-200"}`}
        >
          <div>
            <div className="text-lg font-bold flex items-center gap-2">
              {isSuperAdmin ? (
                <>
                  <Clock size={20} /> Admin Clock Override
                </>
              ) : (
                "Add Manual Record"
              )}
            </div>
            <p
              className={`text-xs mt-0.5 ${isSuperAdmin ? "opacity-80" : "text-base-content/60"}`}
            >
              {isSuperAdmin
                ? "Force a live clock-in/out for an employee."
                : "Create a new past attendance entry."}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`btn btn-ghost btn-sm btn-square hover:text-error ${isSuperAdmin ? "text-primary" : "text-base-content/50"}`}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <div className="py-4 px-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <form
            id="attendance-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* 1. SHARED: Employee Selection */}
            <fieldset className="fieldset relative z-50">
              <legend className="fieldset-legend text-xs font-semibold uppercase opacity-60">
                Employee
              </legend>
              <UserSelectDropdown
                users={users}
                value={formData.userId}
                onChange={(selectedId) =>
                  setFormData({ ...formData, userId: selectedId })
                }
              />
            </fieldset>

            {/* SUPER ADMIN VIEW */}
            {isSuperAdmin ? (
              <>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold uppercase opacity-60">
                    Entry Type
                  </legend>
                  <div className="flex bg-base-200 p-1 rounded-lg gap-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "in" })}
                      className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${formData.type === "in" ? "bg-base-100 shadow-sm text-primary" : "text-base-content/50 hover:text-base-content"}`}
                    >
                      Time In
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "out" })}
                      className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${formData.type === "out" ? "bg-base-100 shadow-sm text-error" : "text-base-content/50 hover:text-base-content"}`}
                    >
                      Time Out
                    </button>
                  </div>
                </fieldset>

                <div className="grid grid-cols-2 gap-4">
                  {/* --- UPDATED: CUSTOM DATE PICKER (SUPER ADMIN) --- */}
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs font-semibold uppercase opacity-60 flex items-center gap-1.5">
                      <Calendar size={14} /> Date
                    </legend>
                    <CustomDatePicker 
                      value={formData.date}
                      onChange={(newDate) => setFormData({ ...formData, date: newDate })}
                      className="text-sm"
                    />
                  </fieldset>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs font-semibold uppercase opacity-60 flex items-center gap-1.5">
                      <Clock size={14} /> Exact Time
                    </legend>
                    <input
                      required
                      type="time"
                      className="input input-bordered w-full text-sm h-10"
                      value={formData.overrideTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overrideTime: e.target.value,
                        })
                      }
                    />
                  </fieldset>
                </div>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold uppercase opacity-60 flex items-center gap-1.5">
                    <ImageIcon size={14} /> Photo Evidence (Optional)
                  </legend>

                  {!formData.photo ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="file-input file-input-bordered file-input-primary w-full text-sm"
                    />
                  ) : (
                    <div className="relative w-full h-40 bg-base-200 rounded-xl overflow-hidden border border-base-300 group">
                      <img
                        src={formData.photo}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="btn btn-error btn-sm shadow-xl"
                        >
                          <X size={16} className="mr-1" /> Remove Photo
                        </button>
                      </div>
                    </div>
                  )}
                </fieldset>

                {formData.type === "out" && (
                  <fieldset className="fieldset animate-in slide-in-from-top-2 duration-300">
                    <legend className="fieldset-legend text-xs font-semibold uppercase opacity-60 flex items-center gap-1.5">
                      <Type size={14} /> Work Summary
                    </legend>
                    <textarea
                      required
                      placeholder="What did they work on today?"
                      className="textarea textarea-bordered w-full text-sm"
                      rows={2}
                      value={formData.workSummary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workSummary: e.target.value,
                        })
                      }
                    />
                  </fieldset>
                )}
              </>
            ) : (
              /* STANDARD ADMIN VIEW */
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* --- UPDATED: CUSTOM DATE PICKER (STANDARD ADMIN) --- */}
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs font-semibold uppercase opacity-60">
                      Date
                    </legend>
                    <CustomDatePicker 
                      value={formData.date}
                      onChange={(newDate) => setFormData({ ...formData, date: newDate })}
                      className="text-sm"
                    />
                  </fieldset>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs font-semibold uppercase opacity-60">
                      Status
                    </legend>
                    <div className="relative">
                      <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none z-10" />
                      <select
                        className="select select-bordered w-full pl-10 text-sm h-10"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Half Day">Half Day</option>
                      </select>
                    </div>
                  </fieldset>
                </div>

                <div
                  className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${isAbsent ? "opacity-50 pointer-events-none" : "opacity-100"}`}
                >
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs font-semibold uppercase text-success">
                      Time In
                    </legend>
                    <div className="relative">
                      <input
                        type="time"
                        className="input input-bordered w-full pl-10 text-sm h-10"
                        value={formData.timeIn}
                        onChange={(e) =>
                          setFormData({ ...formData, timeIn: e.target.value })
                        }
                        disabled={isAbsent}
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-success pointer-events-none" />
                    </div>
                  </fieldset>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend text-xs font-semibold uppercase text-error">
                      Time Out
                    </legend>
                    <div className="relative">
                      <input
                        type="time"
                        className="input input-bordered w-full pl-10 text-sm h-10"
                        value={formData.timeOut}
                        onChange={(e) =>
                          setFormData({ ...formData, timeOut: e.target.value })
                        }
                        disabled={isAbsent}
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-error pointer-events-none" />
                    </div>
                  </fieldset>
                </div>

                {!isAbsent && (
                  <fieldset className="fieldset animate-in slide-in-from-top-2 duration-300">
                    <legend className="fieldset-legend text-xs font-semibold uppercase opacity-60 flex items-center gap-1.5">
                      <Type size={14} /> Work Summary
                    </legend>
                    <textarea
                      placeholder="What did they work on? (Optional)"
                      className="textarea textarea-bordered w-full text-sm"
                      rows={2}
                      value={formData.workSummary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workSummary: e.target.value,
                        })
                      }
                    />
                  </fieldset>
                )}

                {isAbsent && (
                  <div className="flex items-center gap-2 text-warning bg-warning/10 p-2 rounded-lg text-xs">
                    <Activity className="size-4" />
                    <span>Time records are ignored for Absent status.</span>
                  </div>
                )}
              </>
            )}

            {/* --- FOOTER BUTTONS --- */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-base-300 relative z-0">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-sm w-32 ${isSuperAdmin ? (formData.type === "in" ? "btn-primary" : "btn-error text-white") : "btn-primary"}`}
                disabled={isProcessing || !formData.userId}
              >
                {isProcessing ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : isSuperAdmin ? (
                  `Override ${formData.type === "in" ? "In" : "Out"}`
                ) : (
                  "Save Record"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewAttendanceModal;