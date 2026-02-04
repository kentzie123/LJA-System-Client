"use client";

import { useState, useEffect } from "react";
import { UserPlus, Loader } from "lucide-react";
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
  // 1. Check if user can VIEW this page
  const canView = authUser?.role?.perm_employee_view === true;
  // 2. Check if user can CREATE employees
  const canCreate = authUser?.role?.perm_employee_create === true;

  // --- Fetch Data / Security Check ---
  useEffect(() => {
    // 1. Not Logged In? -> Login
    if (!authUser) {
      router.push("/login");
      return;
    }

    // 2. Logged In but NO PERMISSION? -> 404 Not Found
    if (!canView) {
      router.push("/not-found");
      return;
    }

    // 3. Has Permission? -> Fetch Data
    fetchAllUsers();
    fetchRoles();
  }, [authUser, router, fetchAllUsers, fetchRoles, canView]);

  // Loading State
  if (isFetchingUsers) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  // SECURITY GUARD:
  // Prevent the page from rendering anything if user is not logged in OR lacks permission.
  // This prevents the UI from "flashing" before the redirect happens.
  if (!authUser || !canView) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">Employee</div>
          <div className="text-sm opacity-65">
            Manage employees and update records.
          </div>
        </div>
        
        {/* CONDITIONAL RENDER: Only show if user has 'perm_employee_create' */}
        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary text-primary-content font-medium px-6"
          >
            <UserPlus className="size-4" /> <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Main Table List */}
      {/* We pass authUser so the table can check Edit/Delete permissions per row */}
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