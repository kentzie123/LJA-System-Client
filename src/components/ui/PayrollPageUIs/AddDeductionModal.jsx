import { useEffect, useState } from "react";
import { X, Loader2, CreditCard, AlertCircle } from "lucide-react";
import { useDeductionStore } from "@/stores/useDeductionStore";

const AddDeductionModal = ({ isOpen, onClose, employees = [] }) => {
  const { createDeduction, isLoading } = useDeductionStore();

  const [formData, setFormData] = useState({
    name: "",
    type: "Fixed", // Fixed or Percentage
    amount: "",
    userId: "", // Empty = Global
    totalGoal: "", // For Loans
    totalPaid: 0,
  });

  // State for Errors
  const [errors, setErrors] = useState({});

  // Reset form AND errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        type: "Fixed",
        amount: "",
        userId: "",
        totalGoal: "",
        totalPaid: 0,
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle number inputs specifically to prevent NaN issues if needed, 
    // but typically standard binding works fine.
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this specific field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Required Fields
    if (!formData.name.trim()) newErrors.name = "Rule name is required.";
    if (!formData.amount || formData.amount <= 0) newErrors.amount = "Valid amount is required.";
    
    // 2. Logic: If Total Goal (Loan) is filled, it must be valid
    if (formData.totalGoal && Number(formData.totalGoal) <= 0) {
        newErrors.totalGoal = "Total loan amount must be greater than 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Logic: If 'totalGoal' is set, treat as LOAN
    const isLoan = formData.totalGoal && Number(formData.totalGoal) > 0;

    const payload = {
      user_id: formData.userId || null,
      name: formData.name,
      deduction_type: isLoan ? "LOAN" : formData.type,
      amount: formData.amount,
      total_amount: isLoan ? formData.totalGoal : null,
      // Pass totalPaid if your backend supports seeding initial payment
    };

    const success = await createDeduction(payload);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6">
          <div className="text-lg font-bold">New Deduction Rule</div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 px-6 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* 1. Rule Name */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">
              Rule Name / Description
            </legend>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. SSS Contribution"
              className={`input text-xs w-full ${errors.name ? "input-error" : ""}`}
            />
            {errors.name && (
              <span className="text-error text-xs mt-1">{errors.name}</span>
            )}
          </fieldset>

          {/* 2. Grid: Type & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">
                Calc Method
              </legend>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="select text-xs w-full"
              >
                <option value="Fixed">Fixed Amount (₱)</option>
                <option value="Percentage">Salary %</option>
              </select>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">
                Cycle Rate / Value
              </legend>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className={`input text-xs w-full ${errors.amount ? "input-error" : ""}`}
              />
              {errors.amount && (
                <span className="text-error text-xs mt-1">{errors.amount}</span>
              )}
            </fieldset>
          </div>

          {/* 3. Target Personnel */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs font-semibold">
              Target Personnel
            </legend>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="select text-xs w-full"
            >
              <option value="">Global Rule (All Active Staff)</option>
              {employees.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullname} — {u.position}
                </option>
              ))}
            </select>
          </fieldset>

          {/* 4. LOAN SECTION (Conditional) */}
          {formData.userId && (
            <div className="bg-base-200/50 p-4 rounded-xl border border-base-300 space-y-3">
               <div className="flex items-center gap-2 text-warning">
                  <CreditCard size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">Loan Repayment Tracking</span>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <fieldset className="fieldset">
                     <legend className="fieldset-legend text-[10px] font-semibold opacity-70">
                       Total Loan Amount
                     </legend>
                     <input
                       type="number"
                       name="totalGoal"
                       value={formData.totalGoal}
                       onChange={handleChange}
                       placeholder="Optional"
                       className={`input input-sm text-xs w-full ${errors.totalGoal ? "input-error" : ""}`}
                     />
                  </fieldset>

                  <fieldset className="fieldset">
                     <legend className="fieldset-legend text-[10px] font-semibold opacity-70">
                       Initial Paid
                     </legend>
                     <input
                       type="number"
                       name="totalPaid"
                       value={formData.totalPaid}
                       onChange={handleChange}
                       placeholder="0"
                       className="input input-sm text-xs w-full"
                     />
                  </fieldset>
               </div>
               {errors.totalGoal && (
                  <span className="text-error text-xs mt-1 block">{errors.totalGoal}</span>
               )}
               <div className="text-[10px] opacity-50 flex gap-1 items-start">
                  <AlertCircle size={10} className="mt-0.5 shrink-0" />
                  <span>Leave "Total Loan Amount" empty if this is a recurring deduction (e.g. HMO).</span>
               </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-4 pt-2 border-t border-base-200">
            <button onClick={onClose} className="btn" disabled={isLoading}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn btn-primary min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Strategy"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDeductionModal;