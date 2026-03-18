"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Clock } from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";

const EditOvertimeModal = ({ isOpen, onClose, request }) => {
  const {
    updateOvertimeRequest,
    isCreating,
    overtimeTypes,
    fetchOvertimeTypes,
  } = useOvertimeStore();

  const [formData, setFormData] = useState({
    otTypeId: "",
    startAt: "",
    endAt: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch OT Types
  useEffect(() => {
    if (isOpen) fetchOvertimeTypes();
  }, [isOpen, fetchOvertimeTypes]);

  // Populate request data
  useEffect(() => {
    if (isOpen && request) {
      const startAt = request.start_datetime
        ? new Date(request.start_datetime).toISOString().slice(0, 16)
        : "";

      const endAt = request.end_datetime
        ? new Date(request.end_datetime).toISOString().slice(0, 16)
        : "";

      setFormData({
        otTypeId: request.ot_type_id || "",
        startAt,
        endAt,
        reason: request.reason || "",
      });

      setErrors({});
    }
  }, [isOpen, request]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.otTypeId) newErrors.otTypeId = "Required";
    if (!formData.startAt) newErrors.startAt = "Required";
    if (!formData.endAt) newErrors.endAt = "Required";
    if (!formData.reason.trim()) newErrors.reason = "Required";

    if (
      formData.startAt &&
      formData.endAt &&
      new Date(formData.endAt) <= new Date(formData.startAt)
    ) {
      newErrors.endAt = "Must be after start";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await updateOvertimeRequest(request.id, formData);

    if (success) onClose();
  };

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box p-0 bg-base-100 w-11/12 max-w-[380px] border border-base-300 shadow-2xl rounded-xl flex flex-col">

        {/* HEADER */}
        <div className="px-4 py-3 border-b border-base-200 bg-base-200/50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Clock size={16} className="text-primary" />
            Edit Overtime
          </div>

          <button
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-error"
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar">

          {/* OT TYPE */}
          <div className="form-control">
            <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 flex justify-between">
              OT Type
              {errors.otTypeId && <span className="text-error">Required</span>}
            </label>

            <select
              name="otTypeId"
              value={formData.otTypeId}
              onChange={handleChange}
              className={`select select-bordered select-sm h-8 min-h-0 w-full text-[11px] ${
                errors.otTypeId ? "select-error" : ""
              }`}
            >
              <option value="">Select type...</option>

              {overtimeTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* START */}
          <div className="form-control">
            <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 flex justify-between">
              Start
              {errors.startAt && <span className="text-error">*</span>}
            </label>

            <div className="relative">
              <input
                type="datetime-local"
                name="startAt"
                value={formData.startAt}
                onChange={handleChange}
                className={`input input-bordered input-sm h-8 min-h-0 w-full pl-6 text-[11px] ${
                  errors.startAt ? "input-error" : ""
                }`}
              />

              <Clock
                size={12}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-base-content/40"
              />
            </div>
          </div>

          {/* END */}
          <div className="form-control">
            <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 flex justify-between">
              End
              {errors.endAt && <span className="text-error">*</span>}
            </label>

            <div className="relative">
              <input
                type="datetime-local"
                name="endAt"
                value={formData.endAt}
                onChange={handleChange}
                className={`input input-bordered input-sm h-8 min-h-0 w-full pl-6 text-[11px] ${
                  errors.endAt ? "input-error" : ""
                }`}
              />

              <Clock
                size={12}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-base-content/40"
              />
            </div>
          </div>

          {/* REASON */}
          <div className="form-control">
            <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 flex justify-between">
              Task / Reason
              {errors.reason && <span className="text-error">Required</span>}
            </label>

            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`textarea textarea-bordered text-[11px] w-full h-16 resize-none p-2 ${
                errors.reason ? "textarea-error" : ""
              }`}
              placeholder="Brief explanation..."
            ></textarea>
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] uppercase font-bold px-4"
            disabled={isCreating}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="btn btn-sm h-8 min-h-0 btn-primary text-[10px] uppercase font-bold px-4"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save"
            )}
          </button>
        </div>

      </div>

      {/* BACKDROP */}
      <div
        className="modal-backdrop bg-black/60 backdrop-blur-md"
        onClick={() => !isCreating && onClose()}
      />
    </dialog>
  );
};

export default EditOvertimeModal;