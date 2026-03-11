"use client";

import { useState, useEffect } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { useRoleStore } from "@/stores/useRoleStore"; 
import { useRouter } from "next/navigation";

// Modals
import AddEmployeeModal from "../ui/EmployeePageUIs/AddEmployeeModal";
import DeleteEmployeeModal from "../ui/EmployeePageUIs/DeleteEmployeeModal";
import EditEmployeeModal from "../ui/EmployeePageUIs/EditEmployeModal";

// Layouts
import EmployeeTableList from "../ui/EmployeePageUIs/EmployeeTableList"; 

export default function EmployeePage() {
  const { authUser } = useAuthStore();
  const { users, fetchAllUsers, isFetchingUsers } = useUserStore();
  const { roles, fetchRoles } = useRoleStore();

  const router = useRouter();

  // --- Modal States ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  // --- PERMISSION CHECK ---
  const canView = authUser?.role?.perm_employee_view === true;
  const canCreate = authUser?.role?.perm_employee_create === true;

  // --- Fetch Data / Security Check ---
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }
    if (!canView) {
      router.push("/not-found");
      return;
    }
    fetchAllUsers();
    fetchRoles();
  }, [authUser, router, fetchAllUsers, fetchRoles, canView]);

  if (isFetchingUsers) {
    return (
      <div className="flex flex-col h-[60vh] w-full items-center justify-center gap-3">
        <Loader2 className="animate-spin size-6 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40 animate-pulse">
          Syncing Directory...
        </span>
      </div>
    );
  }

  if (!authUser || !canView) return null;

  return (
    <div className="space-y-4 animate-in fade-in duration-300 antialiased-text pb-8">
      
      {/* --- HIGH-DENSITY HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-base-300 pb-4">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight leading-none mb-1.5">
            Employee Directory
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
            Manage workforce records & roles
          </p>
        </div>
        
        {/* CONDITIONAL RENDER: Only show if user has 'perm_employee_create' */}
        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm h-9 sm:h-8 min-h-0 px-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest shadow-sm w-full sm:w-auto flex items-center gap-1.5 shrink-0"
          >
            <UserPlus size={14} /> 
            Add Employee
          </button>
        )}
      </div>

      {/* Main Table List */}
      <EmployeeTableList
        employees={users}
        roles={roles}
        authUser={authUser} 
        onEdit={(employee) => setEmployeeToEdit(employee)}
        onDelete={(employee) => setEmployeeToDelete(employee)}
      />

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <DeleteEmployeeModal
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        employee={employeeToDelete}
      />
      <EditEmployeeModal
        isOpen={!!employeeToEdit}
        onClose={() => setEmployeeToEdit(null)}
        employee={employeeToEdit}
      />
    </div>
  );
}