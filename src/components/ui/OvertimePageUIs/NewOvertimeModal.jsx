import { useEffect, useState } from "react";
import { X, Loader2, Clock } from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";

const NewOvertimeModal = ({ isOpen, onClose }) => {
  const {
    createOvertimeRequest,
    isCreating,
    overtimeTypes,
    fetchOvertimeTypes,
  } = useOvertimeStore();

  const [formData, setFormData] = useState({
    otTypeId: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  // New State for Errors (Matching your requested design)
  const [errors, setErrors] = useState({});

  // Fetch Types on mount
  useEffect(() => {
    fetchOvertimeTypes();
  }, [fetchOvertimeTypes]);

  // Reset form AND errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        otTypeId: "",
        date: "",
        startTime: "",
        endTime: "",
        reason: "",
      });
      setErrors({}); // Clear errors
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this specific field as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Check Required Fields
    if (!formData.otTypeId)
      newErrors.otTypeId = "Please select an overtime type.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.startTime) newErrors.startTime = "Start time is required.";
    if (!formData.endTime) newErrors.endTime = "End time is required.";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";

    // 2. Logical Check: End Time vs Start Time
    if (formData.startTime && formData.endTime) {
      if (formData.endTime <= formData.startTime) {
        newErrors.endTime = "End time must be after start time.";
      }
    }

    setErrors(newErrors);
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Run validation before submitting
    if (!validateForm()) return;

    const success = await createOvertimeRequest(formData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden scale-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6">
          <div className="text-lg font-bold flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            Apply for Overtime
          </div>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 px-6 space-y-4 overflow-y-auto">
          {/* Overtime Type Dropdown */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">
              Overtime Type
            </legend>
            <select
              name="otTypeId"
              value={formData.otTypeId}
              onChange={handleChange}
              // Add select-error class if error exists
              className={`select w-full text-xs ${
                errors.otTypeId ? "select-error" : ""
              }`}
            >
              <option value="" disabled>
                Select overtime type
              </option>
              {overtimeTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {/* Show Error Message */}
            {errors.otTypeId && (
              <span className="text-error text-xs mt-1">{errors.otTypeId}</span>
            )}
          </fieldset>

          {/* Date Picker */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">
              Overtime Date
            </legend>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              // Add input-error class
              className={`input text-xs w-full ${
                errors.date ? "input-error" : ""
              }`}
            />
            {errors.date && (
              <span className="text-error text-xs mt-1">{errors.date}</span>
            )}
          </fieldset>

          {/* Time Pickers (Start & End) */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">
                Start Time
              </legend>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`input text-xs w-full ${
                  errors.startTime ? "input-error" : ""
                }`}
              />
              {errors.startTime && (
                <span className="text-error text-xs mt-1">
                  {errors.startTime}
                </span>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">
                End Time
              </legend>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`input text-xs w-full ${
                  errors.endTime ? "input-error" : ""
                }`}
              />
              {errors.endTime && (
                <span className="text-error text-xs mt-1">
                  {errors.endTime}
                </span>
              )}
            </fieldset>
          </div>

          {/* Reason Textarea */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">
              Task / Reason
            </legend>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              // Add textarea-error class
              className={`textarea text-xs w-full h-24 resize-none ${
                errors.reason ? "textarea-error" : ""
              }`}
              placeholder="Describe the task or reason for overtime..."
            ></textarea>
            {errors.reason && (
              <span className="text-error text-xs mt-1">{errors.reason}</span>
            )}
          </fieldset>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-4 pt-2">
            <button onClick={onClose} className="btn" disabled={isCreating}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="btn btn-primary min-w-[140px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOvertimeModal;
