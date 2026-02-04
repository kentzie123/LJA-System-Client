"use client";

import { useState, useEffect } from "react";
import { 
  Users, Clock, Calendar, Briefcase, DollarSign, Loader, Shield 
} from "lucide-react";
import { useRoleStore } from "@/stores/useRoleStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Import Components
import RoleHeader from "@/components/ui/RolePermissionPageUIs/RoleHeader";
import PermissionCard from "@/components/ui/RolePermissionPageUIs/PermissionCard";
import PermissionCheckbox from "@/components/ui/RolePermissionPageUIs/PermissionCheckbox";
import SaveBar from "@/components/ui/RolePermissionPageUIs/SaveBar";

const RolePermissionsPage = () => {
  const { roles, fetchRoles, updateRole, createRole, deleteRole, isUpdating, isLoading, isCreating, isDeleting } = useRoleStore();
  const { authUser } = useAuthStore();
  const router = useRouter();
  
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // --- PERMISSIONS ---
  const canViewRoles = authUser?.role?.perm_role_view === true;
  const canManageRoles = authUser?.role?.perm_role_manage === true;

  // --- SECURITY CHECK ---
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }
    // UPDATED CHECK:
    if (!canViewRoles) { 
      router.push("/not-found");
    } else {
      fetchRoles();
    }
  }, [authUser, router, fetchRoles, canViewRoles]);

  // --- DEFAULT SELECTION ---
  useEffect(() => {
    if (roles.length > 0) {
       const exists = roles.find(r => r.id === Number(selectedRoleId));
       if (!selectedRoleId || !exists) {
         setSelectedRoleId(roles[0].id);
       }
    }
  }, [roles, selectedRoleId]);

  // --- SYNC FORM DATA ---
  useEffect(() => {
    const role = roles.find(r => r.id === Number(selectedRoleId));
    if (role) {
      setFormData({
        // ... existing mappings ...
        perm_employee_view: role.perm_employee_view || false,
        perm_employee_create: role.perm_employee_create || false,
        perm_employee_edit: role.perm_employee_edit || false,
        perm_employee_delete: role.perm_employee_delete || false,

        perm_attendance_view: role.perm_attendance_view || false,
        perm_attendance_verify: role.perm_attendance_verify || false,
        perm_attendance_manual: role.perm_attendance_manual || false,
        perm_attendance_export: role.perm_attendance_export || false,

        perm_leave_view: role.perm_leave_view || false,
        perm_leave_view_all: role.perm_leave_view_all || false,
        perm_leave_approve: role.perm_leave_approve || false,

        perm_overtime_view: role.perm_overtime_view || false,
        perm_overtime_view_all: role.perm_overtime_view_all || false,
        perm_overtime_approve: role.perm_overtime_approve || false,

        perm_payroll_view: role.perm_payroll_view || false,
        perm_payroll_manage: role.perm_payroll_manage || false,

        // NEW: Role Management
        perm_role_view: role.perm_role_view || false,
        perm_role_manage: role.perm_role_manage || false,
      });
      setHasChanges(false);
    }
  }, [selectedRoleId, roles]);

  // --- HANDLERS (Same as before) ---
  const handleToggle = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleReset = () => {
    const role = roles.find(r => r.id === Number(selectedRoleId));
    if (role) {
      const tempId = selectedRoleId;
      setSelectedRoleId(""); 
      setTimeout(() => setSelectedRoleId(tempId), 0);
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

  const handleCreateRole = async (roleName) => {
    try {
      const newRole = await createRole(roleName);
      if (newRole) {
        setSelectedRoleId(newRole.id);
        return true;
      }
    } catch (err) { return false; }
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;
    if (Number(selectedRoleId) === 1) {
      toast.error("Cannot delete the System Admin role.");
      return;
    }
    try {
      await deleteRole(selectedRoleId);
      return true;
    } catch (err) { return false; }
  };

  // --- RENDER ---
  if (!authUser || !canViewRoles) return null;

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      
      {/* 1. Header (Pass Permissions) */}
      <RoleHeader 
        roles={roles} 
        selectedRoleId={selectedRoleId} 
        onChange={setSelectedRoleId}
        
        // Only allow Create/Delete if they have manage permission
        onCreate={canManageRoles ? handleCreateRole : undefined}
        isCreating={isCreating}

        onDelete={canManageRoles ? handleDeleteRole : undefined}
        isDeleting={isDeleting}
      />

      {/* 2. Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ... Existing Cards ... */}
        
        {/* EMPLOYEE */}
        <PermissionCard title="Employee Management" icon={Users}>
          <PermissionCheckbox label="View Employee List" checked={formData.perm_employee_view} onChange={() => handleToggle("perm_employee_view")} />
          <PermissionCheckbox label="Add New Employee" checked={formData.perm_employee_create} onChange={() => handleToggle("perm_employee_create")} />
          <PermissionCheckbox label="Edit Employee Details" checked={formData.perm_employee_edit} onChange={() => handleToggle("perm_employee_edit")} />
          <PermissionCheckbox label="Delete Employee Record" checked={formData.perm_employee_delete} onChange={() => handleToggle("perm_employee_delete")} />
        </PermissionCard>

        {/* ATTENDANCE */}
        <PermissionCard title="Attendance System" icon={Clock}>
          <PermissionCheckbox label="View Attendance Logs" checked={formData.perm_attendance_view} onChange={() => handleToggle("perm_attendance_view")} />
          <PermissionCheckbox label="Verify/Reject Logs" checked={formData.perm_attendance_verify} onChange={() => handleToggle("perm_attendance_verify")} />
          <PermissionCheckbox label="Manual Clock In/Out" checked={formData.perm_attendance_manual} onChange={() => handleToggle("perm_attendance_manual")} />
          <PermissionCheckbox label="Generate Reports" checked={formData.perm_attendance_export} onChange={() => handleToggle("perm_attendance_export")} />
        </PermissionCard>

        {/* LEAVE */}
        <PermissionCard title="Leave Management" icon={Calendar}>
          <PermissionCheckbox label="Access Leave Page" checked={formData.perm_leave_view} onChange={() => handleToggle("perm_leave_view")} />
          <PermissionCheckbox label="View All Leaves (Admin)" checked={formData.perm_leave_view_all} onChange={() => handleToggle("perm_leave_view_all")} />
          <PermissionCheckbox label="Approve/Reject Requests" checked={formData.perm_leave_approve} onChange={() => handleToggle("perm_leave_approve")} />
        </PermissionCard>

        {/* OVERTIME */}
        <PermissionCard title="Overtime Management" icon={Briefcase}>
          <PermissionCheckbox label="Access Overtime Page" checked={formData.perm_overtime_view} onChange={() => handleToggle("perm_overtime_view")} />
          <PermissionCheckbox label="View All (Admin)" checked={formData.perm_overtime_view_all} onChange={() => handleToggle("perm_overtime_view_all")} />
          <PermissionCheckbox label="Approve/Reject Requests" checked={formData.perm_overtime_approve} onChange={() => handleToggle("perm_overtime_approve")} />
        </PermissionCard>

        {/* PAYROLL */}
        <PermissionCard title="Payroll Access" icon={DollarSign}>
           <PermissionCheckbox label="Access Payroll Page" checked={formData.perm_payroll_view} onChange={() => handleToggle("perm_payroll_view")} />
           <PermissionCheckbox label="Process & Manage" checked={formData.perm_payroll_manage} onChange={() => handleToggle("perm_payroll_manage")} />
        </PermissionCard>

        {/* NEW: ROLE MANAGEMENT */}
        <PermissionCard title="System Roles (Danger Zone)" icon={Shield}>
           <PermissionCheckbox label="Access Roles Page" checked={formData.perm_role_view} onChange={() => handleToggle("perm_role_view")} />
           <PermissionCheckbox label="Create/Edit/Delete Roles" checked={formData.perm_role_manage} onChange={() => handleToggle("perm_role_manage")} />
        </PermissionCard>

      </div>

      {/* 3. Floating Save Bar (Only show if they can manage) */}
      {canManageRoles && (
        <SaveBar 
          hasChanges={hasChanges} 
          isUpdating={isUpdating} 
          onReset={handleReset} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default RolePermissionsPage;