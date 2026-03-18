"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";
import { useUserStore } from "@/stores/useUserStore";

import UserSelectDropdown from "@/components/ui/Selections/UserSelectDropdown";

const AdminCreateOvertimeModal = ({ isOpen, onClose }) => {
  const {
    overtimeTypes,
    fetchOvertimeTypes,
    createAdminOvertimeRequest,
    isCreating,
  } = useOvertimeStore();

  const { users, fetchAllUsers } = useUserStore();

  const [formData, setFormData] = useState({
    targetUserId: "",
    otTypeId: "",
    startAt: "",
    endAt: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (users.length === 0) fetchAllUsers();
      if (overtimeTypes.length === 0) fetchOvertimeTypes();
    }
  }, [
    isOpen,
    users.length,
    fetchAllUsers,
    overtimeTypes.length,
    fetchOvertimeTypes,
  ]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        targetUserId: "",
        otTypeId: "",
        startAt: "",
        endAt: "",
        reason: "",
      });
      setErrors({});
    }
  }, [isOpen]);

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

  const handleUserSelect = (selectedId) => {
    setFormData((prev) => ({
      ...prev,
      targetUserId: selectedId,
    }));

    if (errors.targetUserId) {
      setErrors((prev) => ({
        ...prev,
        targetUserId: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.targetUserId) newErrors.targetUserId = "Required";
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

    const success = await createAdminOvertimeRequest(formData);

    if (success) onClose();
  };

  return (
    <dialog className={`modal modal-middle ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box p-0 bg-base-100 overflow-visible w-11/12 max-w-[420px] border border-base-300 shadow-2xl rounded-xl flex flex-col antialiased-text">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-base-200 bg-base-200/50 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h3 className="font-black text-xs uppercase tracking-wider text-base-content leading-none">
              Assign Overtime
            </h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mt-1">
              Admin Override
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-error"
          >
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar flex-1 bg-base-100">

          {/* INFO BANNER */}
          <div className="flex items-start gap-2 p-2.5 bg-info/10 border border-info/20 rounded-lg text-info">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p className="text-[10px] leading-snug font-medium">
              Requests created here bypass workflow and are{" "}
              <strong className="font-black">automatically approved</strong>.
            </p>
          </div>

          <form
            id="admin-ot-form"
            onSubmit={handleSubmit}
            className="space-y-3"
          >

            {/* EMPLOYEE */}
            <div className="form-control relative z-[60]">
              <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                Employee
                {errors.targetUserId && (
                  <span className="text-error">{errors.targetUserId}</span>
                )}
              </label>

              <UserSelectDropdown
                users={users}
                value={formData.targetUserId}
                onChange={handleUserSelect}
              />
            </div>

            {/* OT TYPE */}
            <div className="form-control relative z-[50]">
              <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                OT Type
                {errors.otTypeId && (
                  <span className="text-error">{errors.otTypeId}</span>
                )}
              </label>

              <div className="relative">
                <select
                  name="otTypeId"
                  value={formData.otTypeId}
                  onChange={handleChange}
                  className={`select select-bordered select-sm h-8 w-full text-[11px] pl-7 ${
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
                <FileText
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40"
                  size={12}
                />
              </div>
            </div>

            {/* START */}
            <div className="form-control">
              <label className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mb-1 flex justify-between">
                Start
                {errors.startAt && (
                  <span className="text-error">{errors.startAt}</span>
                )}
              </label>

              <div className="relative">
                <input
                  type="datetime-local"
                  name="startAt"
                  value={formData.startAt}
                  onChange={handleChange}
                  className="input input-bordered input-sm h-8 w-full pl-6 text-[11px]"
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
                {errors.endAt && (
                  <span className="text-error">{errors.endAt}</span>
                )}
              </label>

              <div className="relative">
                <input
                  type="datetime-local"
                  name="endAt"
                  value={formData.endAt}
                  onChange={handleChange}
                  className="input input-bordered input-sm h-8 w-full pl-6 text-[11px]"
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
                {errors.reason && (
                  <span className="text-error">{errors.reason}</span>
                )}
              </label>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="textarea textarea-bordered text-[11px] h-16 resize-none p-2 w-full"
                placeholder="Brief justification..."
              />
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/30 flex justify-end gap-2 shrink-0">

          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-sm btn-ghost text-[10px] uppercase font-bold"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="admin-ot-form"
            disabled={isCreating}
            className="btn btn-sm btn-secondary text-[10px] uppercase font-bold"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <CheckCircle size={14} />
                Assign OT
              </>
            )}
          </button>

        </div>
      </div>

      <div
        className="modal-backdrop bg-black/60 backdrop-blur-md"
        onClick={() => !isCreating && onClose()}
      />
    </dialog>
  );
};

export default AdminCreateOvertimeModal;