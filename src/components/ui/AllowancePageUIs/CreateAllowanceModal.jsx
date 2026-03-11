import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Loader2, Coins, Users, Globe, Search, CheckSquare, Square, AlertCircle } from "lucide-react";
import { useAllowanceStore } from "@/stores/useAllowanceStore";
import { useUserStore } from "@/stores/useUserStore"; 
import toast from "react-hot-toast"; 
import { getImageUrl } from "@/utils/getImageUrl";

const CreateAllowanceModal = ({ isOpen, onClose }) => {
  const { createAllowance, isCreating } = useAllowanceStore();
  const { users, fetchAllUsers, isFetchingUsers } = useUserStore(); 
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    is_global: true,
  });

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({}); // New Error State

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
      fetchAllUsers();
      setSelectedUserIds([]); 
      setSearchQuery(""); 
      setErrors({}); // Reset errors on open
      setFormData({ name: "", amount: "", is_global: true });
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, fetchAllUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u => 
      u.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.position?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Allowance name is required.";
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount.";
    }
    if (!formData.is_global && selectedUserIds.length === 0) {
      newErrors.users = "Please select at least one employee.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const toggleUser = (userId) => {
    setSelectedUserIds(prev => {
      const updated = prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId];
      if (errors.users && updated.length > 0) setErrors(prevErr => ({ ...prevErr, users: "" }));
      return updated;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
      if (errors.users) setErrors(prev => ({ ...prev, users: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      userIds: formData.is_global ? [] : selectedUserIds 
    };

    const success = await createAllowance(payload);
    if (success) onClose();
  };

  return (
    <dialog ref={modalRef} className="modal modal-middle" onClose={onClose}>
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-md border border-base-300 shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-base-200/50 py-4 px-5 border-b border-base-300 shrink-0">
          <div className="text-base font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
            <Coins size={18} /> <span>New Allowance</span>
          </div>
          <button type="button" onClick={onClose} disabled={isCreating} className="btn btn-sm btn-circle btn-ghost text-base-content/70">
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Name Field */}
          <div className="form-control">
            <label className="text-[10px] font-bold text-base-content/50 uppercase tracking-widest block mb-1.5">Allowance Name</label>
            <input 
              name="name"
              type="text" 
              placeholder="e.g. Rice Subsidy" 
              className={`input input-bordered h-10 w-full rounded-lg text-sm focus:border-emerald-500 focus:outline-emerald-500 ${errors.name ? "input-error" : ""}`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="text-[10px] text-error mt-1 font-medium">{errors.name}</span>}
          </div>

          {/* Amount Field */}
          <div className="form-control">
            <label className="text-[10px] font-bold text-base-content/50 uppercase tracking-widest block mb-1.5">Amount (PHP)</label>
            <div className="relative">
              <span className="z-10 absolute left-3 top-1/2 -translate-y-1/2 font-bold opacity-40 text-sm">₱</span>
              <input 
                name="amount"
                type="number" 
                placeholder="0.00" 
                className={`input input-bordered h-10 w-full pl-8 font-mono font-bold text-sm focus:border-emerald-500 focus:outline-emerald-500 ${errors.amount ? "input-error" : ""}`}
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
            {errors.amount && <span className="text-[10px] text-error mt-1 font-medium">{errors.amount}</span>}
          </div>

          {/* Recipients Toggle */}
          <div className="form-control">
            <label className="text-[10px] font-bold text-base-content/50 uppercase tracking-widest block mb-2">Recipients</label>
            <div className="grid grid-cols-2 gap-1.5 bg-base-200 p-1 rounded-xl">
                <button
                  type="button"
                  className={`btn btn-sm h-8 rounded-lg border-none shadow-none transition-all text-[11px] ${!formData.is_global ? "bg-base-100 text-emerald-600 shadow-sm" : "btn-ghost text-base-content/50"}`}
                  onClick={() => setFormData(prev => ({ ...prev, is_global: false }))}
                >
                  <Users size={14} /> Specific
                </button>
                <button
                  type="button"
                  className={`btn btn-sm h-8 rounded-lg border-none shadow-none transition-all text-[11px] ${formData.is_global ? "bg-base-100 text-emerald-600 shadow-sm" : "btn-ghost text-base-content/50"}`}
                  onClick={() => setFormData(prev => ({ ...prev, is_global: true }))}
                >
                  <Globe size={14} /> Global
                </button>
            </div>
          </div>

          {/* Specific User Selection */}
          {!formData.is_global && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="z-10 absolute left-3 top-1/2 -translate-y-1/2 opacity-30"/>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="input input-sm h-9 input-bordered w-full pl-9 rounded-lg text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="button" onClick={toggleSelectAll} className="btn btn-sm h-9 btn-ghost text-[10px] font-bold">
                   {selectedUserIds.length === filteredUsers.length ? "NONE" : "ALL"}
                </button>
              </div>

              <div className={`border rounded-xl max-h-44 overflow-y-auto bg-base-100 p-1.5 custom-scrollbar ${errors.users ? "border-error/50" : "border-base-300"}`}>
                {isFetchingUsers ? (
                  <div className="flex justify-center py-6"><Loader2 className="animate-spin size-5 opacity-40 text-emerald-600" /></div>
                ) : (
                  filteredUsers.map(user => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <div 
                        key={user.id} 
                        onClick={() => toggleUser(user.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer mb-1 ${isSelected ? "bg-emerald-500/5 border border-emerald-500/20" : "border border-transparent"}`}
                      >
                         <div className={`${isSelected ? "text-emerald-600" : "opacity-20"}`}>
                           {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                         </div>
                         <div className="w-8 h-8 rounded-full overflow-hidden bg-base-300 shrink-0">
                           <img src={user.profile_picture ? getImageUrl(user.profile_picture) : "/images/default_profile.jpg"} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold truncate">{user.fullname}</p>
                           <p className="text-[10px] opacity-40 truncate">{user.position || "Staff"}</p>
                         </div>
                      </div>
                    );
                  })
                )}
              </div>
              {errors.users && <span className="text-[10px] text-error font-medium">{errors.users}</span>}
            </div>
          )}

          {formData.is_global && (
            <div className="p-3 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-[11px] rounded-xl border border-emerald-500/10 flex items-start gap-2 leading-relaxed">
               <Globe size={14} className="mt-0.5 flex-shrink-0" />
               <p>This allowance will be automatically applied to <b>ALL current and future</b> active employees.</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-base-200/50 border-t border-base-300 flex justify-end gap-2.5 shrink-0">
            <button type="button" onClick={onClose} className="btn btn-sm h-10 rounded-lg btn-ghost text-xs" disabled={isCreating}>Cancel</button>
            <button 
              type="button"
              onClick={handleSubmit} 
              disabled={isCreating} 
              className="btn btn-sm h-10 rounded-lg btn-primary bg-emerald-600 hover:bg-emerald-700 border-none text-white text-xs px-6 shadow-md"
            >
              {isCreating ? <Loader2 className="animate-spin size-4" /> : "Create Allowance"}
            </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} className="cursor-default">close</button>
      </form>
    </dialog>
  );
};

export default CreateAllowanceModal;