import { useEffect, useState } from "react";
import { X, Loader2, Clock, Calendar, Layers, FileText } from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";

const EditOvertimeModal = ({ isOpen, onClose, request }) => {
  const {
    updateOvertimeRequest,
    isCreating, // reusing the loading state
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

  const [errors, setErrors] = useState({});

  // 1. Fetch Types & Populate Data
  useEffect(() => {
    if (isOpen && request) {
      fetchOvertimeTypes();

      // Format Date for Input (YYYY-MM-DD)
      const formattedDate = request.ot_date
        ? new Date(request.ot_date).toISOString().split("T")[0]
        : "";

      setFormData({
        otTypeId: request.ot_type_id || "",
        date: formattedDate,
        startTime: request.start_time || "",
        endTime: request.end_time || "",
        reason: request.reason || "",
      });
      setErrors({});
    }
  }, [isOpen, request, fetchOvertimeTypes]);

  // 2. Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 3. Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.otTypeId)
      newErrors.otTypeId = "Please select an overtime type.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.startTime) newErrors.startTime = "Start time is required.";
    if (!formData.endTime) newErrors.endTime = "End time is required.";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";

    if (formData.startTime && formData.endTime) {
      if (formData.endTime <= formData.startTime) {
        newErrors.endTime = "End time must be after start time.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Call Update Action with ID
    const success = await updateOvertimeRequest(request.id, formData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden scale-in-95 duration-200">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300">
          <div>
            <div className="text-lg font-bold flex items-center gap-2">
              Edit Overtime Request
            </div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Update details for this request.
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
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="edit-overtime-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5"
            noValidate
          >
            {/* 1. Overtime Type */}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Overtime Type
              </legend>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none z-10" />
                <select
                  name="otTypeId"
                  value={formData.otTypeId}
                  onChange={handleChange}
                  className={`select select-bordered w-full pl-10 text-sm ${
                    errors.otTypeId ? "select-error" : ""
                  }`}
                >
                  <option value="" disabled>
                    Select Type...
                  </option>
                  {overtimeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.otTypeId && (
                <span className="text-error text-xs mt-1">
                  {errors.otTypeId}
                </span>
              )}
            </fieldset>

            {/* 2. Date */}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Date
              </legend>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-10 text-sm ${
                    errors.date ? "input-error" : ""
                  }`}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
              </div>
              {errors.date && (
                <span className="text-error text-xs mt-1">{errors.date}</span>
              )}
            </fieldset>

            {/* 3. Time Grid */}
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="fieldset w-full">
                <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                  Start Time
                </legend>
                <div className="relative">
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-10 text-sm ${
                      errors.startTime ? "input-error" : ""
                    }`}
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
                </div>
                {errors.startTime && (
                  <span className="text-error text-xs mt-1">
                    {errors.startTime}
                  </span>
                )}
              </fieldset>

              <fieldset className="fieldset w-full">
                <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                  End Time
                </legend>
                <div className="relative">
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-10 text-sm ${
                      errors.endTime ? "input-error" : ""
                    }`}
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
                </div>
                {errors.endTime && (
                  <span className="text-error text-xs mt-1">
                    {errors.endTime}
                  </span>
                )}
              </fieldset>
            </div>

            {/* 4. Reason */}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Reason / Task
              </legend>
              <div className="relative">
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Describe the task..."
                  className={`textarea textarea-bordered w-full h-24 pl-10 resize-none text-sm pt-3 ${
                    errors.reason ? "textarea-error" : ""
                  }`}
                ></textarea>
                <FileText className="absolute left-3 top-3 size-4 text-base-content/50 pointer-events-none" />
              </div>
              {errors.reason && (
                <span className="text-error text-xs mt-1">{errors.reason}</span>
              )}
            </fieldset>
          </form>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 border-t border-base-300 flex justify-end gap-3 bg-base-100 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-overtime-form"
            disabled={isCreating}
            className="btn btn-primary px-8"
          >
            {isCreating ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOvertimeModal;
