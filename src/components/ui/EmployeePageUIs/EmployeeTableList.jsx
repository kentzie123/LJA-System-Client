"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
} from "lucide-react";

/**
 * HELPER FUNCTIONS
 */
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * MAIN COMPONENT
 */
const EmployeeTableList = ({ 
  employees = [], 
  roles = [], 
  authUser, 
  onEdit, 
  onDelete 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- PERMISSIONS ---
  const canEdit = authUser?.role?.perm_employee_edit === true;
  const canDelete = authUser?.role?.perm_employee_delete === true;
  const showActionColumn = true; 

  // --- FILTERING ---
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchQuery.toLowerCase());

      const roleName = employee.role_name;
      const matchesRole = roleFilter === "All" || roleName === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [employees, searchQuery, roleFilter]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-base-100 rounded-xl border border-base-300 shadow-lg overflow-hidden flex flex-col">
      {/* TOOLBAR */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-base-300 bg-base-100/50">
        <div className="w-full md:w-96">
          <label className="w-full input input-bordered flex items-center gap-3 bg-base-200/50 focus-within:bg-base-200 focus-within:border-primary/50 transition-all h-10">
            <Search className="size-4 opacity-50" />
            <input
              type="text"
              className="grow text-sm placeholder:text-base-content/40"
              placeholder="Search by name, ID, or position..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
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
              {roles.map((role) => (
                <option key={role.id} value={role.role_name}>{role.role_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto w-full">
        <table className="table w-full">
          <thead className="bg-base-200 text-base-content/40 text-[11px] uppercase font-bold tracking-wider">
            <tr className="border-b border-base-300">
              <th className="py-4 px-6 text-left">ID</th>
              <th className="py-4 px-6 text-left">Employee</th>
              <th className="py-4 px-6 text-left">Role</th>
              <th className="py-4 px-6 text-left">Position</th>
              <th className="py-4 px-6 text-left">Date Hired</th>
              <th className="py-4 px-6 text-left text-primary font-black">Daily Rate</th>
              {showActionColumn && <th className="py-4 px-6 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-base-300">
            {currentEmployees.length > 0 ? (
              currentEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-base-200/40 transition-colors">
                  
                  {/* ID Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-bold text-base-content/70">
                      {employee.employee_id || "N/A"}
                    </span>
                  </td>

                  {/* Employee Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/employee/${employee.employee_id}`} className="flex items-center gap-4 group cursor-pointer">
                      <div className="avatar">
                        <div className="w-10 rounded-full ring-1 ring-base-300 ring-offset-base-100 ring-offset-1 group-hover:ring-primary transition-all">
                          <img 
                            src={employee.profile_picture || "/images/default_profile.jpg"} 
                            alt={employee.fullname} 
                            className="object-cover"
                            onError={(e) => {
                              e.target.src = "/images/default_profile.jpg";
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-base-content leading-tight group-hover:text-primary transition-colors">
                          {employee.fullname}
                        </div>
                        <div className="text-xs text-base-content/50 mt-1">
                          {employee.email}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge border-none h-8 px-4 font-medium rounded-lg ${getRoleBadgeColor(employee.role_name)}`}>
                      {employee.role_name}
                    </span>
                  </td>

                  {/* Position */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-base-content">{employee.position || "N/A"}</div>
                  </td>

                  {/* Date Hired */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-base-content/70 text-xs font-medium">
                      <Calendar className="size-3.5 opacity-60" />
                      {formatDate(employee.date_hired)}
                    </div>
                  </td>

                  {/* Daily Rate */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-primary">
                      {formatCurrency(employee.daily_rate)}
                    </div>
                  </td>

                  {/* Action Column */}
                  {showActionColumn && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 hover:opacity-100 transition-opacity">
                        
                        {/* View Profile Button (uses employee_id slug) */}
                        <Link 
                          href={`/employee/${employee.employee_id}`} 
                          className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-info hover:bg-info/10" 
                          title="View Details"
                        >
                          <Eye className="size-4" />
                        </Link>

                        {canEdit && (
                          <button onClick={() => onEdit(employee)} className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-warning hover:bg-warning/10" title="Edit Employee">
                            <Edit2 className="size-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => onDelete(employee)} className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-error hover:bg-error/10" title="Delete Employee">
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 opacity-50">
                  No employees found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="p-4 border-t border-base-300 flex items-center justify-between text-xs text-base-content/50 bg-base-100/50">
        <div>
          Showing {Math.min(startIndex + 1, filteredEmployees.length)} to{" "}
          {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next <ChevronRight className="size-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTableList;