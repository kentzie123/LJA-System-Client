"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  AlertCircle, 
  Shield, 
  Users, 
  Clock, 
  Lock, 
  RotateCcw,
  Calendar // Added Calendar Icon
} from "lucide-react";
import { useRoleStore } from "@/stores/useRoleStore";
import toast from "react-hot-toast";

const RolePermissionsPage = () => {
  const { roles, fetchRoles, updateRole, isUpdating } = useRoleStore();
  
  // --- STATE ---
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // --- 2. DEFAULT SELECTION ---
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id); 
    }
  }, [roles, selectedRoleId]);

  // --- 3. SYNC FORM DATA ---
  useEffect(() => {
    const role = roles.find(r => r.id === Number(selectedRoleId));
    if (role) {
      setFormData({
        // EMPLOYEE MANAGEMENT
        perm_employee_view: role.perm_employee_view || false,
        perm_employee_create: role.perm_employee_create || false,
        perm_employee_edit: role.perm_employee_edit || false,
        perm_employee_delete: role.perm_employee_delete || false,
        
        // ATTENDANCE SYSTEM
        perm_attendance_view: role.perm_attendance_view || false,
        perm_attendance_verify: role.perm_attendance_verify || false,
        perm_attendance_manual: role.perm_attendance_manual || false,
        perm_attendance_export: role.perm_attendance_export || false,

        // LEAVE MANAGEMENT (New)
        perm_leave_view_all: role.perm_leave_view_all || false,
        perm_leave_approve: role.perm_leave_approve || false,
      });
      setHasChanges(false);
    }
  }, [selectedRoleId, roles]);

  // --- HANDLERS ---

  const handleToggle = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleReset = () => {
    const role = roles.find(r => r.id === Number(selectedRoleId));
    if (role) {
      setFormData({
        // Reset Employee
        perm_employee_view: role.perm_employee_view,
        perm_employee_create: role.perm_employee_create,
        perm_employee_edit: role.perm_employee_edit,
        perm_employee_delete: role.perm_employee_delete,
        // Reset Attendance
        perm_attendance_view: role.perm_attendance_view,
        perm_attendance_verify: role.perm_attendance_verify,
        perm_attendance_manual: role.perm_attendance_manual,
        perm_attendance_export: role.perm_attendance_export,
        // Reset Leave
        perm_leave_view_all: role.perm_leave_view_all,
        perm_leave_approve: role.perm_leave_approve,
      });
      setHasChanges(false);
      toast("Changes discarded", { icon: "↩️" });
    }
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    
    try {
      await updateRole(selectedRoleId, formData);
      toast.success("Permissions updated successfully!");
      setHasChanges(false);
    } catch (err) {
      console.error(err);
    }
  };

  // --- UI HELPER: PERMISSION CHECKBOX CARD ---
  const PermissionCheckbox = ({ label, checked, onChangeKey, disabled = false }) => (
    <label className={`
      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none h-full
      ${disabled 
        ? "opacity-50 cursor-not-allowed bg-base-200 border-base-200" 
        : checked
          ? "bg-primary/5 border-primary shadow-sm" // Active State
          : "bg-base-100 border-base-300 hover:border-primary/50" // Inactive Hover
      }
    `}>
      <input 
        type="checkbox" 
        className={`checkbox checkbox-sm rounded ${checked ? "checkbox-primary" : "border-base-content/40"}`}
        checked={checked}
        onChange={() => !disabled && handleToggle(onChangeKey)}
        disabled={disabled}
      />
      <span className={`text-sm font-medium ${checked ? "text-primary" : "text-base-content/80"}`}>
        {label}
      </span>
    </label>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 border-b border-base-300 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-base-content">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Shield className="size-6" />
            </div>
            Role Privileges
          </h1>
          <p className="text-sm opacity-60 mt-2 max-w-lg">
            Configure access controls and security levels. Changes affect users with this role immediately.
          </p>
        </div>

        {/* Role Selector */}
        <div className="w-full md:w-72">
          <label className="label text-xs font-bold uppercase opacity-50 tracking-wider">
            Editing Role
          </label>
          <select 
            className="select select-bordered w-full font-semibold text-base focus:border-primary focus:outline-none"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- PERMISSIONS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. EMPLOYEE MANAGEMENT (Active) */}
        <div className="card bg-base-100 shadow-sm border border-base-300 overflow-visible">
          <div className="card-body p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-base-content border-b border-base-200 pb-3 mb-4">
              <Users className="size-4 text-primary" />
              Employee Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PermissionCheckbox 
                label="View Employee List" 
                checked={formData.perm_employee_view} 
                onChangeKey="perm_employee_view" 
              />
              <PermissionCheckbox 
                label="Add New Employee" 
                checked={formData.perm_employee_create} 
                onChangeKey="perm_employee_create" 
              />
              <PermissionCheckbox 
                label="Edit Employee Details" 
                checked={formData.perm_employee_edit} 
                onChangeKey="perm_employee_edit" 
              />
              <PermissionCheckbox 
                label="Delete Employee Record" 
                checked={formData.perm_employee_delete} 
                onChangeKey="perm_employee_delete" 
              />
            </div>
          </div>
        </div>

        {/* 2. ATTENDANCE (Active) */}
        <div className="card bg-base-100 shadow-sm border border-base-300 overflow-visible">
          <div className="card-body p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-base-content border-b border-base-200 pb-3 mb-4">
              <Clock className="size-4 text-primary" />
              Attendance System
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PermissionCheckbox 
                label="View Attendance Logs" 
                checked={formData.perm_attendance_view} 
                onChangeKey="perm_attendance_view" 
              />
              <PermissionCheckbox 
                label="Verify/Reject Logs" 
                checked={formData.perm_attendance_verify} 
                onChangeKey="perm_attendance_verify" 
              />
              <PermissionCheckbox 
                label="Manual Clock In/Out" 
                checked={formData.perm_attendance_manual} 
                onChangeKey="perm_attendance_manual" 
              />
              <PermissionCheckbox 
                label="Generate Reports" 
                checked={formData.perm_attendance_export} 
                onChangeKey="perm_attendance_export" 
              />
            </div>
          </div>
        </div>

        {/* 3. LEAVE MANAGEMENT (Now Active) */}
        <div className="card bg-base-100 shadow-sm border border-base-300 overflow-visible">
          <div className="card-body p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-base-content border-b border-base-200 pb-3 mb-4">
              <Calendar className="size-4 text-primary" />
              Leave Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PermissionCheckbox 
                label="View All Leaves (Admin/HR)" 
                checked={formData.perm_leave_view_all} 
                onChangeKey="perm_leave_view_all" 
              />
              <PermissionCheckbox 
                label="Approve/Reject Requests" 
                checked={formData.perm_leave_approve} 
                onChangeKey="perm_leave_approve" 
              />
            </div>
          </div>
        </div>

        {/* 4. PAYROLL (Still Disabled / Coming Soon) */}
        <div className="card bg-base-100/50 shadow-none border border-base-300 border-dashed relative">
          <div className="absolute top-3 right-3 z-10">
             <span className="badge badge-neutral text-xs font-medium opacity-80">Coming Soon</span>
          </div>
          <div className="card-body p-6 opacity-50 grayscale select-none">
            <h3 className="flex items-center gap-2 text-base font-bold text-base-content border-b border-base-200 pb-3 mb-4">
              <Lock className="size-4" />
              Payroll Access
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pointer-events-none">
               <PermissionCheckbox label="View Payroll History" checked={false} disabled />
               <PermissionCheckbox label="Process Pay Run" checked={false} disabled />
               <PermissionCheckbox label="Manage Deductions" checked={false} disabled />
               <PermissionCheckbox label="Approve Salary" checked={false} disabled />
            </div>
          </div>
        </div>

      </div>

      {/* --- FLOATING SAVE BAR --- */}
      <div className={`fixed bottom-6 left-0 right-0 z-50 px-4 transition-all duration-300 transform ${hasChanges ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}>
        <div className="max-w-2xl mx-auto bg-base-300 text-base-content px-6 py-3 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-base-content/10 backdrop-blur-md bg-opacity-90">
          
          <div className="flex items-center gap-3">
            <AlertCircle className="text-warning size-5 shrink-0" />
            <span className="font-medium text-sm">You have unsaved changes.</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleReset} 
              className="btn btn-sm btn-ghost text-base-content/70 hover:bg-base-content/10 flex-1 sm:flex-none"
            >
              <RotateCcw className="size-4 mr-1" />
              Reset
            </button>
            <button 
              onClick={handleSave}
              disabled={isUpdating}
              className="btn btn-sm btn-primary text-primary-content px-6 shadow-md flex-1 sm:flex-none"
            >
              {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : <Save className="size-4 mr-1" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RolePermissionsPage;