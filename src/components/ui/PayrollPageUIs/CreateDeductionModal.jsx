import React, { useState, useEffect } from "react";
import { X, Search, Users, Globe, AlertCircle, Wallet, CheckSquare, Square } from "lucide-react";
import { useDeductionStore } from "@/stores/useDeductionStore";
import { useUserStore } from "@/stores/useUserStore";
import toast from "react-hot-toast"; 

// --- NEW IMPORTS ---
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";

const CreateDeductionModal = ({ isOpen, onClose }) => {
  const { createDeduction, isSubmitting } = useDeductionStore();
  const { users, fetchAllUsers } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    deduction_type: "FIXED",
    amount: "",
    is_global: true,
    total_loan_amount: "",
    downpayment: "",
    selected_users: [],
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAllUsers();
      setFormData({
        name: "",
        deduction_type: "FIXED",
        amount: "",
        is_global: true,
        total_loan_amount: "",
        downpayment: "",
        selected_users: [],
      });
      setSearchTerm("");
    }
  }, [isOpen, fetchAllUsers]);

  const activeUsers = users.filter((user) => user.isActive);

  const filteredUsers = activeUsers.filter((u) =>
    u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleUser = (userId) => {
    setFormData((prev) => {
      const current = prev.selected_users;
      const exists = current.includes(userId);
      return {
        ...prev,
        selected_users: exists
          ? current.filter((id) => id !== userId)
          : [...current, userId],
      };
    });
  };

  // --- NEW: Select All Function ---
  const toggleSelectAll = () => {
    if (formData.selected_users.length === filteredUsers.length && filteredUsers.length > 0) {
      setFormData(prev => ({ ...prev, selected_users: [] }));
    } else {
      setFormData(prev => ({ ...prev, selected_users: filteredUsers.map(u => u.id) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    if (!formData.is_global && formData.selected_users.length === 0) {
      toast.error("Please select at least one employee.");
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      total_loan_amount: formData.total_loan_amount
        ? parseFloat(formData.total_loan_amount)
        : null,
      downpayment: formData.downpayment ? parseFloat(formData.downpayment) : 0,
    };

    const success = await createDeduction(payload);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-base-300 max-h-[85vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300 flex-shrink-0">
          <div className="text-lg font-bold flex items-center gap-2 text-primary">
            <Wallet size={20} /> Create Deduction Plan
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting} 
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY - This area will now scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* BASICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control md:col-span-2">
              <label className="label text-xs font-bold opacity-70">
                PLAN NAME
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. SSS Contribution, Uniform Fee"
                className="input input-bordered w-full focus:input-primary focus:border-primary"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold opacity-70">
                DEDUCTION TYPE
              </label>
              <select
                name="deduction_type"
                className="select select-bordered w-full focus:select-primary focus:border-primary"
                value={formData.deduction_type}
                onChange={handleChange}
              >
                <option value="FIXED">Fixed Amount (₱)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold opacity-70">
                {formData.deduction_type === "FIXED"
                  ? "DEDUCTION PER PAYROLL (₱)"
                  : "PERCENTAGE (%)"}
              </label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                step="0.01"
                className="input input-bordered w-full font-mono focus:input-primary focus:border-primary"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* TARGETING (UPDATED TO MATCH ALLOWANCE UI) */}
          <div className="form-control space-y-3">
            <label className="label text-xs font-bold opacity-60 uppercase p-0">Target Audience</label>
            
            <div className="grid grid-cols-2 gap-2 bg-base-200 p-1 rounded-xl">
                <button
                  type="button"
                  className={`btn btn-sm border-none shadow-none transition-all ${
                    !formData.is_global 
                    ? "bg-base-100 text-primary shadow-md" 
                    : "btn-ghost text-base-content opacity-50 hover:bg-base-300"
                  }`}
                  onClick={() => setFormData({ ...formData, is_global: false })}
                >
                  <Users size={14} /> Specific
                </button>
                <button
                  type="button"
                  className={`btn btn-sm border-none shadow-none transition-all ${
                    formData.is_global 
                    ? "bg-base-100 text-primary shadow-md" 
                    : "btn-ghost text-base-content opacity-50 hover:bg-base-300"
                  }`}
                  onClick={() => setFormData({ ...formData, is_global: true })}
                >
                  <Globe size={14} /> Global
                </button>
            </div>

            {/* USER SELECTION LIST */}
            {!formData.is_global && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3 pt-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="z-1 absolute left-3 top-1/2 -translate-y-1/2 opacity-50"/>
                    <input 
                      type="text" 
                      placeholder="Search employees..." 
                      className="input input-sm input-bordered w-full pl-9 focus:border-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={toggleSelectAll} 
                    className="btn btn-sm btn-ghost text-xs"
                  >
                    {formData.selected_users.length === filteredUsers.length && filteredUsers.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="border border-base-300 rounded-xl max-h-48 overflow-y-auto bg-base-100 p-2 custom-scrollbar">
                  {users.length === 0 ? (
                    <div className="text-center py-8 opacity-50 text-xs flex flex-col items-center">
                      <AlertCircle size={24} className="mb-2 opacity-50" />
                      Loading employees...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <p className="text-center text-xs opacity-50 py-4">No employees found.</p>
                  ) : (
                    filteredUsers.map(user => {
                      const isSelected = formData.selected_users.includes(user.id);
                      return (
                        <div 
                          key={user.id} 
                          onClick={() => toggleUser(user.id)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-base-200 ${
                            isSelected ? "bg-primary/10 border border-primary/30" : "border border-transparent"
                          }`}
                        >
                           <div className={`${isSelected ? "text-primary" : "opacity-30"}`}>
                             {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                           </div>

                           <div className="w-8 h-8 relative rounded-full overflow-hidden bg-base-300 shrink-0 border border-base-content/10">
                             <Image
                               src={user.profile_picture ? getImageUrl(user.profile_picture) : "/images/default_profile.jpg"}
                               alt={user.fullname}
                               fill
                               sizes="32px"
                               className="object-cover"
                             />
                           </div>

                           <div className="flex-1 min-w-0">
                             <p className={`text-sm font-bold truncate ${isSelected ? "text-primary" : ""}`}>
                               {user.fullname}
                             </p>
                             <p className="text-xs opacity-50 truncate">{user.position || "No Position"}</p>
                           </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-[10px] text-right opacity-50">
                  {formData.selected_users.length} employee(s) selected
                </p>
              </div>
            )}

            {formData.is_global && (
              <div className="p-3 bg-primary/10 text-primary text-xs rounded-lg border border-primary/20 flex items-start gap-2 mt-2">
                 <Globe size={14} className="mt-0.5 flex-shrink-0" />
                 <p>This deduction will be automatically applied to <b>ALL current and future</b> active employees.</p>
              </div>
            )}
          </div>

          {/* LOAN DETAILS & DOWNPAYMENT */}
          <div className="collapse collapse-arrow border border-base-200 bg-base-100 rounded-lg">
            <input type="checkbox" defaultChecked={false} />
            <div className="collapse-title text-sm font-medium opacity-80 flex items-center gap-2">
              <span>Is this a Loan? (Total Limit)</span>
              {formData.total_loan_amount && (
                <span className="badge badge-warning badge-xs">Active</span>
              )}
            </div>
            <div className="collapse-content space-y-3">
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* 1. TOTAL GOAL */}
                <div className="form-control">
                  <label className="label text-xs font-bold opacity-70">
                    TOTAL LOAN GOAL (₱)
                  </label>
                  <input
                    type="number"
                    name="total_loan_amount"
                    placeholder="e.g. 5000.00"
                    className="input input-bordered w-full focus:input-primary focus:border-primary"
                    value={formData.total_loan_amount}
                    onChange={handleChange}
                  />
                </div>

                {/* 2. DOWNPAYMENT */}
                <div className="form-control">
                  <label className="label text-xs font-bold opacity-70 text-success">
                    DOWNPAYMENT (₱)
                  </label>
                  <input
                    type="number"
                    name="downpayment"
                    placeholder="e.g. 1000.00"
                    className="input input-bordered w-full focus:input-primary focus:border-primary"
                    value={formData.downpayment}
                    onChange={handleChange}
                    disabled={!formData.total_loan_amount}
                  />
                </div>
              </div>

              {/* Helper Summary */}
              {formData.total_loan_amount && (
                <div className="text-[11px] opacity-60 bg-base-200 p-3 rounded border border-base-300">
                  <div className="flex justify-between border-b border-base-content/10 pb-1 mb-1">
                    <span>Total Loan:</span>
                    <span className="font-mono">
                      ₱{formData.total_loan_amount}
                    </span>
                  </div>
                  <div className="flex justify-between text-success">
                    <span>Less Downpayment:</span>
                    <span className="font-mono">
                      - ₱{formData.downpayment || 0}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold mt-1 pt-1 border-t border-base-content/10">
                    <span>Starting Balance:</span>
                    <span>
                      ₱
                      {parseFloat(formData.total_loan_amount || 0) -
                        parseFloat(formData.downpayment || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-base-200 bg-base-200/50 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary px-8 min-w-[120px]"
            disabled={isSubmitting || !formData.name || !formData.amount}
          >
            {isSubmitting ? (
              <>
                 <span className="loading loading-spinner loading-xs mr-2"></span> Saving...
              </>
            ) : (
              "Create Plan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDeductionModal;