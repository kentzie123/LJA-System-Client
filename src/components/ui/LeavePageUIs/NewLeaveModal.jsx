import { useEffect, useState } from "react";
import { X, CircleAlert, Loader2 } from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";

const NewLeaveModal = ({ isOpen, onClose }) => {
  const { 
    leaveTypes, 
    fetchLeaveTypes, 
    createLeaveRequest, 
    isCreating,
    userBalances,      // Get Balances Array
    fetchLeaveBalances // Get Fetch Function
  } = useLeaveStore();

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Fetch both Types AND Balances when modal opens
      fetchLeaveTypes();
      fetchLeaveBalances(); 
      
      // Reset form
      setFormData({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
      });
      setErrors({});
    }
  }, [isOpen, fetchLeaveTypes, fetchLeaveBalances]);

  // --- DYNAMIC BALANCE CHECKER ---
  const getSelectedBalance = () => {
    if (!formData.leaveTypeId) return "Select a leave type";
    
    // 1. Find the type definition (to get the name)
    const selectedType = leaveTypes.find(t => t.id === Number(formData.leaveTypeId));
    if (!selectedType) return "Unknown Type";

    // 2. Find the user's balance for this specific type name
    // (Note: Backend returns 'leave_name', ensure it matches DB name)
    const balance = userBalances.find(b => b.leave_name === selectedType.name);

    if (balance) {
      const remaining = balance.allocated_days - balance.used_days;
      return `${remaining} days remaining`;
    }
    
    return "No credits allocated"; 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

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

    const success = await createLeaveRequest(formData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300">
          <div className="text-lg font-bold">Apply for Leave</div>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-6 px-6 space-y-5 overflow-y-auto">
          
          {/* Leave Type Dropdown */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend text-xs font-bold uppercase opacity-60 mb-1">
              Leave Type
            </legend>
            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleChange}
              className={`select select-bordered w-full text-sm ${
                errors.leaveTypeId ? "select-error" : ""
              }`}
            >
              <option value="" disabled>
                Select leave type
              </option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            
            {errors.leaveTypeId && (
              <span className="text-error text-xs mt-1 block">
                {errors.leaveTypeId}
              </span>
            )}

            {/* BALANCE INDICATOR */}
            <div className="mt-2 flex items-center gap-2 p-2 bg-base-200/50 rounded-lg border border-base-200">
                <CircleAlert size={14} className="text-primary" /> 
                <span className="text-xs font-medium opacity-80">
                  Current Balance: <span className="text-primary font-bold ml-1">{getSelectedBalance()}</span>
                </span>
            </div>
          </fieldset>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-bold uppercase opacity-60 mb-1">
                Start Date
              </legend>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`input input-bordered w-full text-sm ${
                  errors.startDate ? "input-error" : ""
                }`}
              />
              {errors.startDate && (
                <span className="text-error text-xs mt-1 block">
                  {errors.startDate}
                </span>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-bold uppercase opacity-60 mb-1">
                End Date
              </legend>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className={`input input-bordered w-full text-sm ${
                  errors.endDate ? "input-error" : ""
                }`}
              />
              {errors.endDate && (
                <span className="text-error text-xs mt-1 block">
                  {errors.endDate}
                </span>
              )}
            </fieldset>
          </div>

          {/* Reason Textarea */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-bold uppercase opacity-60 mb-1">
              Reason for Leave
            </legend>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`textarea textarea-bordered w-full h-24 resize-none text-sm leading-relaxed ${
                errors.reason ? "textarea-error" : ""
              }`}
              placeholder="Please provide a brief reason for your request..."
            ></textarea>
            {errors.reason && (
              <span className="text-error text-xs mt-1 block">{errors.reason}</span>
            )}
          </fieldset>
        </div>

        {/* Footer */}
        <div className="p-4 bg-base-200/50 border-t border-base-300 flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="btn btn-ghost hover:bg-base-200" 
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="btn btn-primary min-w-[140px] shadow-sm"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
        </div>

      </div>
    </div>
  );
};

export default NewLeaveModal;