import React, { useState } from "react";
import { Shield, Plus, X, Trash2, AlertTriangle } from "lucide-react";

const RoleHeader = ({ 
  roles, 
  selectedRoleId, 
  onChange, 
  onCreate, 
  isCreating,
  onDelete,     
  isDeleting    
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const selectedRoleName = roles.find(r => r.id === Number(selectedRoleId))?.role_name;

  // Handle Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const success = await onCreate(newRoleName);
    if (success) {
      setNewRoleName("");
      setIsCreateModalOpen(false);
    }
  };

  // Handle Delete
  const handleDeleteSubmit = async () => {
    const success = await onDelete();
    if (success) {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 border-b border-base-300 pb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3 text-base-content">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Shield className="size-6" />
          </div>
          Role Privileges
        </h1>
        <p className="text-sm opacity-60 mt-2 max-w-lg">
          Configure access controls. Changes affect users with this role immediately.
        </p>
      </div>

      {/* Role Selector & Actions */}
      <div className="w-full md:w-80 flex gap-2 items-end">
        <div className="w-full">
          <label className="label text-xs font-bold uppercase opacity-50 tracking-wider">
            Editing Role
          </label>
          <select 
            className="select select-bordered w-full font-semibold text-base focus:border-primary focus:outline-none"
            value={selectedRoleId}
            onChange={(e) => onChange(e.target.value)}
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>

        {/* CREATE BUTTON */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-square btn-primary"
          title="Create New Role"
        >
          <Plus size={20} />
        </button>

        {/* DELETE BUTTON (Hide for Admin ID 1) */}
        {Number(selectedRoleId) !== 1 && (
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-square btn-ghost text-error hover:bg-error/10"
            title="Delete Role"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* --- CREATE MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          {/* Replaced 'modal-box' with manual classes to ensure visibility */}
          <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Create New Role</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="label text-xs font-bold opacity-60">Role Name</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full focus:outline-none focus:border-primary" 
                  placeholder="e.g. HR Assistant"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary px-6" disabled={!newRoleName.trim() || isCreating}>
                  {isCreating ? <span className="loading loading-spinner loading-xs"></span> : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          {/* Replaced 'modal-box' here as well */}
          <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
            
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-bold text-lg">Delete Role?</h3>
              <p className="text-sm opacity-70">
                Are you sure you want to delete <strong>{selectedRoleName}</strong>? This action cannot be undone.
              </p>
              <div className="flex w-full gap-2 mt-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-ghost flex-1">Cancel</button>
                <button onClick={handleDeleteSubmit} className="btn btn-error flex-1" disabled={isDeleting}>
                  {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleHeader;