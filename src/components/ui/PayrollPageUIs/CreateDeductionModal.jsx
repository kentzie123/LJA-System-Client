import React, { useState, useEffect } from "react";
import { X, Search, Users, Globe, AlertCircle } from "lucide-react";
import { useDeductionStore } from "@/stores/useDeductionStore";
import { useUserStore } from "@/stores/useUserStore"; 

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

  const activeUsers = users.filter(user => user.isActive);

  const filteredUsers = activeUsers.filter((u) =>
    u.fullname.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    
    if (!formData.is_global && formData.selected_users.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      total_loan_amount: formData.total_loan_amount ? parseFloat(formData.total_loan_amount) : null,
      downpayment: formData.downpayment ? parseFloat(formData.downpayment) : 0,
    };

    const success = await createDeduction(payload);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* FIX APPLIED HERE: 
          Added 'max-h-[85vh]' so the modal never gets taller than 85% of the screen.
          This forces the inner 'flex-1 overflow-y-auto' to actually work.
      */}
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-base-300 max-h-[85vh]">
        
        {/* HEADER */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold">Create Deduction Plan</h2>
            <p className="text-xs opacity-60">Add a new fee, contribution, or loan.</p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
            <X size={18} />
          </button>
        </div>

        {/* BODY - This area will now scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* BASICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control md:col-span-2">
              <label className="label text-xs font-bold opacity-70">PLAN NAME</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. SSS Contribution, Uniform Fee, Emergency Loan"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold opacity-70">DEDUCTION TYPE</label>
              <select
                name="deduction_type"
                className="select select-bordered w-full"
                value={formData.deduction_type}
                onChange={handleChange}
              >
                <option value="FIXED">Fixed Amount (₱)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold opacity-70">
                {formData.deduction_type === "FIXED" ? "DEDUCTION PER PAYROLL (₱)" : "PERCENTAGE (%)"}
              </label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                step="0.01"
                className="input input-bordered w-full font-mono"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* TARGETING */}
          <div className="bg-base-200/40 p-5 rounded-lg border border-base-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData.is_global ? "bg-primary/20 text-primary" : "bg-base-300 text-base-content/50"}`}>
                  {formData.is_global ? <Globe size={20} /> : <Users size={20} />}
                </div>
                <div>
                  <div className="font-bold text-sm">Target Audience</div>
                  <div className="text-xs opacity-60">
                    {formData.is_global 
                      ? "Applied automatically to ALL active employees." 
                      : "Applied only to specific employees selected below."}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                name="is_global"
                className="toggle toggle-primary"
                checked={formData.is_global}
                onChange={handleChange}
              />
            </div>

            {!formData.is_global && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-40" />
                  <input 
                    type="text" 
                    placeholder="Search employee name..." 
                    className="input input-sm input-bordered w-full pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="h-48 overflow-y-auto border border-base-300 rounded-lg bg-base-100 p-1 custom-scrollbar">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <label 
                        key={user.id} 
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-base-200 transition-colors ${formData.selected_users.includes(user.id) ? "bg-primary/5 border border-primary/20" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                              <span className="text-xs">{user.fullname.charAt(0)}</span>
                            </div>
                          </div>
                          <span className="text-sm font-medium">{user.fullname}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-xs checkbox-primary"
                          checked={formData.selected_users.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                        />
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-8 opacity-50 text-xs flex flex-col items-center">
                      <AlertCircle size={24} className="mb-2 opacity-50"/>
                      {users.length === 0 ? "Loading employees..." : "No employees found"}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs opacity-50 mt-2 font-mono">
                  {formData.selected_users.length} employee(s) selected
                </div>
              </div>
            )}
          </div>

          {/* LOAN DETAILS & DOWNPAYMENT */}
          <div className="collapse collapse-arrow border border-base-200 bg-base-100 rounded-lg">
            <input type="checkbox" defaultChecked={false} /> 
            <div className="collapse-title text-sm font-medium opacity-80 flex items-center gap-2">
              <span>Is this a Loan? (Total Limit)</span>
              {formData.total_loan_amount && <span className="badge badge-warning badge-xs">Active</span>}
            </div>
            <div className="collapse-content space-y-3">
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* 1. TOTAL GOAL */}
                <div className="form-control">
                  <label className="label text-xs font-bold opacity-70">TOTAL LOAN GOAL (₱)</label>
                  <input
                    type="number"
                    name="total_loan_amount"
                    placeholder="e.g. 5000.00"
                    className="input input-bordered w-full"
                    value={formData.total_loan_amount}
                    onChange={handleChange}
                  />
                </div>

                {/* 2. DOWNPAYMENT */}
                <div className="form-control">
                  <label className="label text-xs font-bold opacity-70 text-success">DOWNPAYMENT (₱)</label>
                  <input
                    type="number"
                    name="downpayment"
                    placeholder="e.g. 1000.00"
                    className="input input-bordered w-full"
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
                      <span className="font-mono">₱{formData.total_loan_amount}</span>
                  </div>
                  <div className="flex justify-between text-success">
                      <span>Less Downpayment:</span>
                      <span className="font-mono">- ₱{formData.downpayment || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-1 pt-1 border-t border-base-content/10">
                      <span>Starting Balance:</span>
                      <span>₱{parseFloat(formData.total_loan_amount || 0) - parseFloat(formData.downpayment || 0)}</span>
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
            className="btn btn-primary px-8"
            disabled={isSubmitting || (!formData.name || !formData.amount)}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : "Create Plan"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateDeductionModal;