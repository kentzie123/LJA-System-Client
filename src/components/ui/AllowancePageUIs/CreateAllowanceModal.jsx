import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, Coins, Users, Globe, Search, CheckSquare, Square } from "lucide-react";
import { useAllowanceStore } from "@/stores/useAllowanceStore";
import { useUserStore } from "@/stores/useUserStore"; 

const CreateAllowanceModal = ({ isOpen, onClose }) => {
  const { createAllowance, isCreating } = useAllowanceStore();
  const { users, fetchAllUsers, isFetchingUsers } = useUserStore(); 

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    is_global: true,
  });

  // State for specific selection
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllUsers();
      setSelectedUserIds([]); 
      setSearchQuery(""); 
      setFormData(prev => ({ ...prev, is_global: true }));
    }
  }, [isOpen, fetchAllUsers]);

  // 2. Filter users
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u => 
      u.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.position?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // 3. Toggle User Selection
  const toggleUser = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  // 4. Select All / Deselect All
  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.amount) return;
    
    if (!formData.is_global && selectedUserIds.length === 0) {
      alert("Please select at least one employee for this specific allowance.");
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      userIds: formData.is_global ? [] : selectedUserIds 
    };

    const success = await createAllowance(payload);
    
    if (success) {
      setFormData({ name: "", amount: "", is_global: true });
      setSelectedUserIds([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* HEADER - Emerald Text */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300 flex-shrink-0">
          <div className="text-lg font-bold flex items-center gap-2 text-emerald-700">
            <Coins size={20} /> New Allowance
          </div>
          <button 
            onClick={onClose} 
            disabled={isCreating} 
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* 1. Name Input */}
          <div className="form-control">
            <label className="label text-xs font-bold opacity-60 uppercase">Allowance Name</label>
            <input 
              type="text" 
              placeholder="e.g. Rice Subsidy, Gas, Food" 
              className="input input-bordered w-full focus:input-primary focus:border-emerald-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* 2. Amount Input */}
          <div className="form-control">
            <label className="label text-xs font-bold opacity-60 uppercase">Amount (PHP)</label>
            <div className="relative">
              <span className="z-1 absolute left-3 top-1/2 -translate-y-1/2 font-bold opacity-40">₱</span>
              <input 
                type="number" 
                placeholder="0.00" 
                className="input input-bordered w-full pl-8 font-mono font-bold text-lg focus:input-primary focus:border-emerald-500"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          {/* 3. Global vs Specific Toggle (Emerald Active State) */}
          <div className="form-control">
            <label className="label text-xs font-bold opacity-60 uppercase">Recipients</label>
            <div className="grid grid-cols-2 gap-2 bg-base-200 p-1 rounded-xl">
                <button
                  type="button"
                  className={`btn btn-sm border-none shadow-none transition-all ${
                    !formData.is_global 
                    ? "bg-white text-emerald-700 shadow-md" 
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
                    ? "bg-white text-emerald-700 shadow-md" 
                    : "btn-ghost text-base-content opacity-50 hover:bg-base-300"
                  }`}
                  onClick={() => setFormData({ ...formData, is_global: true })}
                >
                  <Globe size={14} /> Global
                </button>
            </div>
          </div>

          {/* 4. USER SELECTION LIST (Only if Specific) */}
          {!formData.is_global && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
              
              {/* Search & Actions */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="z-1 absolute left-3 top-1/2 -translate-y-1/2 opacity-50"/>
                  <input 
                    type="text" 
                    placeholder="Search employees..." 
                    className="input input-sm input-bordered w-full pl-9 focus:border-emerald-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button onClick={toggleSelectAll} className="btn btn-sm btn-ghost text-xs">
                  {selectedUserIds.length === filteredUsers.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {/* List */}
              <div className="border border-base-300 rounded-xl max-h-48 overflow-y-auto bg-base-100 p-2">
                {isFetchingUsers ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin opacity-50 text-emerald-600" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center text-xs opacity-50 py-4">No employees found.</p>
                ) : (
                  filteredUsers.map(user => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <div 
                        key={user.id} 
                        onClick={() => toggleUser(user.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-base-200 ${
                          isSelected ? "bg-emerald-50 border border-emerald-100" : "border border-transparent"
                        }`}
                      >
                         <div className={`${isSelected ? "text-emerald-600" : "opacity-30"}`}>
                           {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className={`text-sm font-bold truncate ${isSelected ? "text-emerald-700" : ""}`}>
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
                {selectedUserIds.length} employee(s) selected
              </p>
            </div>
          )}

          {formData.is_global && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-100 flex items-start gap-2">
               <Globe size={14} className="mt-0.5 flex-shrink-0" />
               <p>This allowance will be automatically applied to <b>ALL current and future</b> active employees.</p>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-base-200/50 border-t border-base-200 flex justify-end gap-3 flex-shrink-0">
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
              className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 border-none text-white min-w-[120px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin size-4 mr-2" /> Creating...
                </>
              ) : (
                "Create Allowance"
              )}
            </button>
        </div>

      </div>
    </div>
  );
};

export default CreateAllowanceModal;