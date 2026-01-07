"use client";

import { useState, useMemo, useEffect } from "react";
import {
  UserPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Filter,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBranchStore } from "@/stores/useBranchStore";
import { useRoleStore } from "@/stores/useRoleStore"; // 1. Import Role Store
import { useRouter } from "next/navigation";

// Modals
import AddEmployeeModal from "../ui/EmployeePageUIs/AddEmployeeModal";
import DeleteEmployeeModal from "../ui/EmployeePageUIs/DeleteEmployeeModal";
import EditEmployeeModal from "../ui/EmployeePageUIs/EditEmployeModal";
import ViewEmployeeModal from "../ui/EmployeePageUIs/ViewEmployeeModal";

// Layouts
import TopBar from "../layout/TopBar";


const getRoleBadgeColor = (roleName) => {
  switch (roleName?.toLowerCase()) {
    case "admin":
      return "bg-primary/10 text-primary";
    case "manager":
    case "hr":
      return "bg-info/10 text-info";
    case "employee":
    case "staff":
      return "bg-base-300 text-base-content/80";
    default:
      return "bg-base-200 text-base-content/50";
  }
};

const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const getAvatarColor = (id) => {
  const colors = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-info",
    "bg-success",
    "bg-warning",
    "bg-error",
    "bg-neutral",
  ];
  return colors[id % colors.length];
};

export default function EmployeePage() {
  const { authUser } = useAuthStore();
  const { users, fetchAllUsers, isFetchingUsers } = useUserStore();
  const { branches, fetchBranches } = useBranchStore();
  const { roles, fetchRoles } = useRoleStore(); // 2. Get roles from store

  const router = useRouter();

  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToView, setEmployeeToView] = useState(null);
  const itemsPerPage = 5;

  // --- Fetch Data on Mount ---
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    } else {
      fetchAllUsers();
      fetchBranches();
      fetchRoles(); // 3. Fetch roles on mount
    }
  }, [authUser, router, fetchAllUsers, fetchBranches, fetchRoles]);

  // --- Filtering Logic ---
  const filteredEmployees = useMemo(() => {
    const employeeList = users || [];

    return employeeList.filter((employee) => {
      // Search Logic
      const matchesSearch =
        employee.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchQuery.toLowerCase());

      // Role Filter Logic
      const roleName = employee.role_name;
      const matchesRole = roleFilter === "All" || roleName === roleFilter;

      // Branch Filter Logic
      const matchesBranch =
        branchFilter === "All" || employee.branch === branchFilter;

      return matchesSearch && matchesRole && matchesBranch;
    });
  }, [users, searchQuery, roleFilter, branchFilter]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (isFetchingUsers) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  if (!authUser) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <TopBar title={"Employee"} />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">Employee</div>
          <div className="text-sm opacity-65">
            Manage employees and update records.
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary text-primary-content font-medium px-6"
        >
          <UserPlus className="size-4" /> <span>Add Employee</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-base-100 rounded-xl border border-base-300 shadow-lg overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-base-300 bg-base-100/50">
          {/* Search */}
          <div className="w-full md:w-96">
            <label className="input input-bordered flex items-center gap-3 bg-base-200/50 focus-within:bg-base-200 focus-within:border-primary/50 transition-all h-10">
              <Search className="size-4 opacity-50" />
              <input
                type="text"
                className="grow text-sm placeholder:text-base-content/40"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </label>
          </div>

          {/* Filters */}
          <div className="flex gap-3 w-full md:w-auto">
            {/* Role Filter (Dynamic) */}
            <div className="relative w-full md:w-40">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Filter className="size-4 z-2 opacity-70" />
              </div>
              <select
                className="select select-bordered select-sm h-10 w-full pl-10 font-normal bg-base-200"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Roles</option>
                {/* 4. Map Roles */}
                {roles.map((role) => (
                  <option key={role.id} value={role.role_name}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter (Dynamic) */}
            <div className="relative w-full md:w-44">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Briefcase className="size-4 z-2 opacity-70" />
              </div>
              <select
                className="select select-bordered select-sm h-10 w-full pl-10 font-normal bg-base-200"
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Standard HTML Table (Unchanged) */}
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead className="bg-base-200 text-base-content/40 text-[11px] uppercase font-bold tracking-wider">
              <tr className="border-b border-base-300">
                <th className="py-4 px-6 text-left">Employee</th>
                <th className="py-4 px-6 text-left">Role</th>
                <th className="py-4 px-6 text-left">Branch</th>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-base-300">
              {currentEmployees.length > 0 ? (
                currentEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-base-200/40 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className={`avatar placeholder`}>
                          <div
                            className={`${getAvatarColor(
                              employee.id
                            )} text-white w-10 rounded-full flex items-center justify-center font-bold text-sm`}
                          >
                            <span>{getInitials(employee.fullname)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-base-content leading-tight">
                            {employee.fullname}
                          </div>
                          <div className="text-xs text-base-content/50 mt-0.5">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`badge border-none h-8 px-4 font-medium rounded-lg ${getRoleBadgeColor(
                          employee.role_name
                        )}`}
                      >
                        {employee.role_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-base-content">
                          {employee.branch || "Unassigned"}
                        </div>
                        <div className="text-xs text-base-content/50 mt-0.5">
                          {employee.position || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.isActive ? (
                        <span className="badge badge-success bg-success/15 text-success border-none h-7 px-3 font-semibold rounded-md">
                          Active
                        </span>
                      ) : (
                        <span className="badge badge-error bg-error/15 text-error border-none h-7 px-3 font-semibold rounded-md">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 hover:opacity-100 transition-opacity">
                        <div
                          className="tooltip tooltip-left"
                          data-tip="View Details"
                        >
                          <button
                            onClick={() => setEmployeeToView(employee)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>
                        <div
                          className="tooltip tooltip-left"
                          data-tip="Edit Employee"
                        >
                          <button
                            onClick={() => setEmployeeToEdit(employee)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-warning hover:bg-warning/10"
                          >
                            <Edit2 className="size-4" />
                          </button>
                        </div>
                        <div
                          className="tooltip tooltip-left"
                          data-tip="Delete Record"
                        >
                          <button
                            onClick={() => setEmployeeToDelete(employee)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-error hover:bg-error/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 opacity-50">
                    No employees found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-base-300 flex items-center justify-between text-xs text-base-content/50 bg-base-100/50">
          <div>
            Showing {Math.min(startIndex + 1, filteredEmployees.length)} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of{" "}
            {filteredEmployees.length} employees
          </div>
          <div className="join">
            <button
              className="join-item btn btn-xs btn-outline border-base-300 text-base-content/60 font-normal hover:bg-base-200 hover:text-base-content disabled:opacity-30"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-3 mr-1" /> Previous
            </button>
            <button
              className="join-item btn btn-xs btn-outline border-base-300 text-base-content/60 font-normal hover:bg-base-200 hover:text-base-content disabled:opacity-30"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next <ChevronRight className="size-3 ml-1" />
            </button>
          </div>
        </div>
      </div>

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
      <ViewEmployeeModal
        isOpen={!!employeeToView}
        onClose={() => setEmployeeToView(null)}
        employee={employeeToView}
      />
    </div>
  );
}
