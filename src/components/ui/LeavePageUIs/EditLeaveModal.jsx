import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";

// IMPORT CUSTOM DATE PICKER
import CustomDatePicker from "@/components/ui/Selections/CustomDatePicker";

const EditLeaveModal = ({ isOpen, onClose }) => {
  const { 
    leaveTypes, fetchLeaveTypes, 
    updateLeaveRequest, 
    selectedLeave, isCreating 
  } = useLeaveStore();

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) fetchLeaveTypes();
  }, [isOpen, fetchLeaveTypes]);

  useEffect(() => {
    if (isOpen && selectedLeave) {
      let typeId = selectedLeave.leave_type_id;
      
      if (!typeId && leaveTypes.length > 0) {
        const foundType = leaveTypes.find(t => t.name === selectedLeave.leave_type);
        if (foundType) typeId = foundType.id;
      }

      setFormData({
        leaveTypeId: typeId || "", 
        startDate: selectedLeave.start_date ? selectedLeave.start_date.slice(0, 10) : "",
        endDate: selectedLeave.end_date ? selectedLeave.end_date.slice(0, 10) : "",
        reason: selectedLeave.reason || "",
      });
      setErrors({});
    }
  }, [isOpen, selectedLeave, leaveTypes]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Custom handler for DatePickers
  const handleDateChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Validation logic: Ensure end date isn't before start date
      if (name === "startDate" && prev.endDate && new Date(value) > new Date(prev.endDate)) {
        newData.endDate = value;
      }
      
      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveTypeId) newErrors.leaveTypeId = "Please select a leave type.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "End date cannot be before start date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const success = await updateLeaveRequest(selectedLeave.id, formData);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300">
          <div className="text-lg font-bold">Edit Request</div>
          <button onClick={onClose} disabled={isCreating} className="btn btn-ghost btn-sm btn-square hover:text-error">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 px-6 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Leave Type */}
          <fieldset className="fieldset relative z-[30]">
            <legend className="fieldset-legend text-xs font-semibold">Leave Type</legend>
            <select 
              name="leaveTypeId" 
              value={formData.leaveTypeId} 
              onChange={handleChange} 
              className={`select select-bordered w-full text-xs h-10 ${errors.leaveTypeId ? "select-error" : ""}`}
            >
              <option value="" disabled>Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            {errors.leaveTypeId && <span className="text-error text-xs mt-1">{errors.leaveTypeId}</span>}
          </fieldset>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="fieldset relative z-[20]">
              <legend className="fieldset-legend text-xs font-semibold">Start Date</legend>
              <CustomDatePicker 
                value={formData.startDate}
                onChange={(val) => handleDateChange("startDate", val)}
                className={`text-xs ${errors.startDate ? "border-error" : ""}`}
              />
              {errors.startDate && <span className="text-error text-xs mt-1">{errors.startDate}</span>}
            </fieldset>

            <fieldset className="fieldset relative z-[20]">
              <legend className="fieldset-legend text-xs font-semibold">End Date</legend>
              <CustomDatePicker 
                value={formData.endDate}
                onChange={(val) => handleDateChange("endDate", val)}
                className={`text-xs ${errors.endDate ? "border-error" : ""}`}
              />
              {errors.endDate && <span className="text-error text-xs mt-1">{errors.endDate}</span>}
            </fieldset>
          </div>

          {/* Reason */}
          <fieldset className="fieldset relative z-0">
            <legend className="fieldset-legend text-xs font-semibold">Reason</legend>
            <textarea 
              name="reason" 
              value={formData.reason} 
              onChange={handleChange} 
              className={`textarea textarea-bordered text-xs w-full h-24 resize-none ${errors.reason ? "textarea-error" : ""}`}
              placeholder="Update your reason..."
            ></textarea>
            {errors.reason && <span className="text-error text-xs mt-1">{errors.reason}</span>}
          </fieldset>
        </div>

        {/* Footer */}
        <div className="p-4 bg-base-200/50 border-t border-base-300 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost" disabled={isCreating}>Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isCreating} 
            className="btn btn-primary min-w-[140px] shadow-sm"
          >
            {isCreating ? (
              <>
                <Loader2 className="size-5 animate-spin mr-2" />
                Saving...
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

export default EditLeaveModal;