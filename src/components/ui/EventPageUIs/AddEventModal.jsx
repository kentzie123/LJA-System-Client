"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Calendar,
  Type,
  AlignLeft,
  ShieldCheck,
} from "lucide-react";
import { useEventStore } from "@/stores/useEventStore";

const AddEventModal = ({ isOpen, onClose, selectedDate }) => {
  const { addEvent, isOperating } = useEventStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    event_type: "Regular Holiday",
    is_payroll_holiday: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const formattedDate = selectedDate
        ? new Date(selectedDate).toLocaleDateString("en-CA")
        : new Date().toLocaleDateString("en-CA");

      setFormData({
        title: "",
        description: "",
        start_date: formattedDate,
        end_date: formattedDate,
        event_type: "Regular Holiday",
        is_payroll_holiday: false,
      });
      setErrors({});
    }
  }, [isOpen, selectedDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newData = { ...prev, [name]: val };
      if (name === "start_date" && newData.end_date < value) {
        newData.end_date = value;
      }
      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Required";
    if (!formData.start_date) newErrors.start_date = "Required";
    if (!formData.end_date) newErrors.end_date = "Required";
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = "Invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await addEvent(formData);
    if (success) onClose();
  };

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box p-0 bg-base-100 w-11/12 max-w-[380px] border border-base-300 shadow-2xl rounded-xl flex flex-col">
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-base-200 bg-base-200/50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight">
            <Calendar size={16} className="text-primary" />
            Add Calendar Event
          </div>
          <button
            onClick={onClose}
            disabled={isOperating}
            className="btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-error"
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar">
          {/* TITLE */}
          <div className="form-control">
            <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 flex justify-between items-center h-3">
              Event Title
              {errors.title && (
                <span className="text-error lowercase italic font-medium">
                  Required
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Independence Day"
                className={`input input-bordered input-sm h-8 min-h-0 w-full pl-7 text-[11px] font-bold ${errors.title ? "input-error" : ""}`}
              />
              <Type
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40"
              />
            </div>
          </div>

          {/* DATES GRID - FIXED LAYOUT */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 h-3 flex items-center">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="input input-bordered input-sm h-8 min-h-0 w-full text-[11px] font-bold"
              />
            </div>
            <div className="form-control">
              <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 h-3 flex justify-between items-center">
                End Date
                {errors.end_date && (
                  <span className="text-error lowercase italic font-medium">
                    {errors.end_date}
                  </span>
                )}
              </label>
              <input
                type="date"
                name="end_date"
                min={formData.start_date}
                value={formData.end_date}
                onChange={handleChange}
                className={`input input-bordered input-sm h-8 min-h-0 w-full text-[11px] font-bold ${errors.end_date ? "input-error" : ""}`}
              />
            </div>
          </div>

          {/* EVENT TYPE */}
          <div className="form-control">
            <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 h-3 flex items-center">
              Type
            </label>
            <select
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              className="select select-bordered select-sm h-8 min-h-0 w-full text-[11px] font-bold"
            >
              <option value="Regular Holiday">Regular Holiday</option>
              <option value="Special Non-Working">Special Holiday</option>
              <option value="Company Event">Company Event</option>
              <option value="Meeting">Meeting</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="form-control">
            <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 h-3 flex items-center">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional details..."
              className="textarea textarea-bordered text-[11px] w-full h-16 resize-none p-2 font-medium"
            ></textarea>
          </div>

          {/* PAYROLL TOGGLE */}
          <div className="bg-base-200/50 p-3 rounded-lg border border-base-300 flex items-start justify-between gap-4">
            <div className="flex gap-2">
              <ShieldCheck
                size={16}
                className={`mt-0.5 ${formData.is_payroll_holiday ? "text-primary" : "text-base-content/20"}`}
              />
              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Apply Holiday Pay Rules
                </p>

                {/* DYNAMIC HELPER TEXT */}
                <p className="text-[9px] leading-tight text-base-content/60 mt-1.5 max-w-[200px]">
                  {formData.event_type === "Regular Holiday" ? (
                    <>
                      <span className="font-bold text-primary">Regular:</span>{" "}
                      All employees (Fixed & Daily) are paid 100% even if not
                      working.
                    </>
                  ) : formData.event_type === "Special Non-Working" ? (
                    <>
                      <span className="font-bold text-warning-content">
                        Special:
                      </span>{" "}
                      Paid only to <span className="underline">Fixed Rate</span>
                      . Daily Rate is "No Work, No Pay."
                    </>
                  ) : (
                    "Standard rules for company events/meetings."
                  )}
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              name="is_payroll_holiday"
              className="toggle toggle-primary toggle-sm"
              checked={formData.is_payroll_holiday}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] uppercase font-bold px-4"
            disabled={isOperating}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isOperating}
            className="btn btn-sm h-8 min-h-0 btn-primary text-[10px] uppercase font-bold px-4"
          >
            {isOperating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save Event"
            )}
          </button>
        </div>
      </div>

      <div
        className="modal-backdrop bg-black/60 backdrop-blur-md"
        onClick={() => !isOperating && onClose()}
      />
    </dialog>
  );
};

export default AddEventModal;
