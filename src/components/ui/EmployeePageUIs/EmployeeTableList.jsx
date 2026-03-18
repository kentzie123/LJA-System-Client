"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";
import {
  Search,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  Briefcase,
  Wallet,
  Hash,
} from "lucide-react";

/**
 * HELPER FUNCTIONS
 */
const getRoleBadgeColor = (roleName) => {
  switch (roleName?.toLowerCase()) {
    case "admin":
      return "bg-primary/10 text-primary border-primary/20";
    case "manager":
    case "hr":
      return "bg-info/10 text-info border-info/20";
    case "employee":
    case "staff":
      return "bg-base-200 text-base-content/80 border-base-300";
    default:
      return "bg-base-200 text-base-content/50 border-base-300";
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
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const canEdit = authUser?.role?.perm_employee_edit === true;
  const canDelete = authUser?.role?.perm_employee_delete === true;
  const showActionColumn = true;

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employee_id
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchQuery.toLowerCase());

      const roleName = employee.role_name;
      const matchesRole = roleFilter === "All" || roleName === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [employees, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden flex flex-col antialiased-text">
      {/* TOOLBAR: Fully responsive stacking */}
      <div className="p-3 flex flex-col sm:flex-row gap-3 justify-between items-center border-b border-base-200 bg-base-100">
        <div className="w-full sm:w-80 shrink-0">
          <label className="w-full input input-bordered flex items-center gap-2 bg-base-200/30 focus-within:bg-base-100 h-8 rounded-md px-3 border-base-300 transition-colors">
            <Search className="size-3.5 opacity-50" />
            <input
              type="text"
              className="grow text-[11px] placeholder:text-base-content/40"
              placeholder="Search ID, name, or position..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
        </div>

        <div className="relative w-full sm:w-40 shrink-0">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
            <Filter className="size-3.5 z-2 opacity-50" />
          </div>
          <select
            className="select select-bordered select-sm h-8 min-h-0 w-full pl-8 py-0 font-medium bg-base-200 border-base-300 text-[11px] rounded-md transition-colors focus:bg-base-100"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.role_name}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =========================================
          DESKTOP VIEW (Visible on md and up) 
          ========================================= */}
      <div className="hidden md:block overflow-x-auto w-full min-h-[300px]">
        <table className="table table-xs w-full">
          <thead className="bg-base-200/50 text-base-content/50 text-[9px] uppercase tracking-widest">
            <tr className="border-b border-base-200">
              <th className="py-2.5 pl-4 pr-2 font-bold w-20">ID</th>
              <th className="py-2.5 px-2 font-bold">Employee Info</th>
              <th className="py-2.5 px-2 font-bold">Role</th>
              <th className="py-2.5 px-2 font-bold">Position</th>
              <th className="py-2.5 px-2 font-bold">Date Hired</th>
              {/* UPDATED HEADER NAME TO BE MORE INCLUSIVE */}
              <th className="py-2.5 px-2 font-black text-primary text-right">
                Base Pay
              </th>
              {showActionColumn && (
                <th className="py-2.5 pr-4 pl-2 text-right w-24">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="text-[12px] divide-y divide-base-200">
            {currentEmployees.length > 0 ? (
              currentEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-base-200/30 transition-colors group"
                >
                  <td className="py-1.5 pl-4 pr-2 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold opacity-60 group-hover:opacity-100 transition-opacity">
                      {employee.employee_id || "N/A"}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 whitespace-nowrap">
                    <Link
                      href={`/employee/${employee.employee_id}`}
                      className="flex items-center gap-3 w-fit"
                    >
                      <div className="avatar">
                        <div className="w-7 h-7 rounded-full ring-1 ring-base-300 ring-offset-base-100 ring-offset-[1px] relative overflow-hidden">
                          <Image
                            loading="eager"
                            src={
                              employee.profile_picture
                                ? getImageUrl(employee.profile_picture)
                                : "/images/default_profile.jpg"
                            }
                            alt={employee.fullname}
                            fill
                            sizes="28px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-base-content leading-none group-hover:text-primary transition-colors">
                          {employee.fullname}
                        </span>
                        <span className="text-[9px] text-base-content/40 mt-0.5 leading-none">
                          {employee.email}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="py-1.5 px-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border ${getRoleBadgeColor(employee.role_name)}`}
                    >
                      {employee.role_name}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 whitespace-nowrap">
                    <span className="font-medium text-base-content/80 text-[11px]">
                      {employee.position || "N/A"}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-base-content/60 text-[11px] font-medium">
                      <Calendar size={10} className="opacity-50" />
                      {formatDate(employee.date_hired)}
                    </div>
                  </td>
                  {/* UPDATED RATE COLUMN TO SHOW PAY TYPE */}
                  <td className="py-1.5 px-2 whitespace-nowrap text-right flex flex-col justify-end items-end h-full">
                    <span className="font-mono font-bold text-primary text-[11px] leading-tight">
                      {formatCurrency(employee.daily_rate || employee.payrate)}
                    </span>
                    <span className="text-[8px] uppercase tracking-widest text-base-content/40 font-bold leading-tight">
                      {employee.pay_type === 'Monthly' ? 'Monthly' : 'Daily'}
                    </span>
                  </td>
                  {showActionColumn && (
                    <td className="py-1.5 pr-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/employee/${employee.employee_id}`}
                          className="btn btn-ghost btn-xs h-6 w-6 min-h-0 p-0 rounded text-base-content/40 hover:text-info hover:bg-info/10"
                          title="View Details"
                        >
                          <Eye size={12} />
                        </Link>
                        {canEdit && (
                          <button
                            onClick={() => onEdit(employee)}
                            className="btn btn-ghost btn-xs h-6 w-6 min-h-0 p-0 rounded text-base-content/40 hover:text-warning hover:bg-warning/10"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDelete(employee)}
                            className="btn btn-ghost btn-xs h-6 w-6 min-h-0 p-0 rounded text-base-content/40 hover:text-error hover:bg-error/10"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <span className="text-[11px] font-bold uppercase tracking-widest opacity-40">
                    No employees found
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================
          MOBILE VIEW (Visible only below md) 
          ========================================= */}
      <div className="md:hidden flex flex-col divide-y divide-base-200">
        {currentEmployees.length > 0 ? (
          currentEmployees.map((employee, index) => (
            <div
              key={employee.id}
              className="p-4 flex flex-col gap-3 bg-base-100 hover:bg-base-200/20 transition-colors"
            >
              {/* Header: Avatar, Name, Role */}
              <div className="flex justify-between items-start gap-3">
                <Link
                  href={`/employee/${employee.employee_id}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="avatar shrink-0">
                    <div className="w-10 h-10 rounded-full ring-1 ring-base-300 ring-offset-base-100 ring-offset-[1px] relative overflow-hidden">
                      <Image
                        src={
                          employee.profile_picture
                            ? getImageUrl(employee.profile_picture)
                            : "/images/default_profile.jpg"
                        }
                        alt={employee.fullname}
                        fill
                        sizes="28px"
                        className="object-cover"
                        priority={index < 4}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[13px] text-base-content leading-tight truncate">
                      {employee.fullname}
                    </span>
                    <span className="text-[10px] text-base-content/50 mt-0.5 truncate">
                      {employee.email}
                    </span>
                  </div>
                </Link>
                <span
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded border ${getRoleBadgeColor(employee.role_name)}`}
                >
                  {employee.role_name}
                </span>
              </div>

              {/* Body: Data Grid */}
              <div className="grid grid-cols-2 gap-2 bg-base-200/30 rounded-lg p-3 border border-base-200/50">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-base-content/40 flex items-center gap-1">
                    <Hash size={8} /> Emp ID
                  </span>
                  <span className="font-mono text-[11px] font-bold text-base-content/80">
                    {employee.employee_id || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-base-content/40 flex items-center gap-1">
                    <Briefcase size={8} /> Position
                  </span>
                  <span className="text-[11px] font-bold text-base-content/80 truncate">
                    {employee.position || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-base-content/40 flex items-center gap-1">
                    <Calendar size={8} /> Hired
                  </span>
                  <span className="text-[11px] font-bold text-base-content/80">
                    {formatDate(employee.date_hired)}
                  </span>
                </div>
                
                {/* UPDATED MOBILE RATE DISPLAY TO SHOW PAY TYPE */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-base-content/40 flex items-center gap-1">
                    <Wallet size={8} /> Rate ({employee.pay_type === 'Monthly' ? 'Mo.' : 'Da.'})
                  </span>
                  <span className="font-mono text-[11px] font-black text-primary">
                    {formatCurrency(employee.daily_rate || employee.payrate)}
                  </span>
                </div>
              </div>

              {/* Footer: Actions */}
              {showActionColumn && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Link
                    href={`/employee/${employee.employee_id}`}
                    className="btn btn-outline btn-xs h-7 border-base-300 text-base-content/70 hover:bg-info hover:text-white hover:border-info flex-1 sm:flex-none"
                  >
                    <Eye size={12} className="mr-1" /> View
                  </Link>
                  {canEdit && (
                    <button
                      onClick={() => onEdit(employee)}
                      className="btn btn-outline btn-xs h-7 border-base-300 text-base-content/70 hover:bg-warning hover:text-warning-content hover:border-warning"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(employee)}
                      className="btn btn-outline btn-xs h-7 border-base-300 text-base-content/70 hover:bg-error hover:text-white hover:border-error"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-[11px] font-bold uppercase tracking-widest opacity-40">
            No employees found
          </div>
        )}
      </div>

      {/* PAGINATION FOOTER: Adapts to flex-col on small screens */}
      <div className="p-3 sm:px-4 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-base-content/50 bg-base-100">
        <div className="font-medium tracking-wide">
          Showing{" "}
          <span className="text-base-content font-bold">
            {Math.min(startIndex + 1, filteredEmployees.length)}
          </span>{" "}
          to{" "}
          <span className="text-base-content font-bold">
            {Math.min(startIndex + itemsPerPage, filteredEmployees.length)}
          </span>{" "}
          of{" "}
          <span className="text-base-content font-bold">
            {filteredEmployees.length}
          </span>
        </div>
        <div className="join border border-base-300 rounded-md overflow-hidden shrink-0">
          <button
            className="join-item btn btn-xs h-7 sm:h-6 min-h-0 bg-base-100 border-none hover:bg-base-200 text-base-content/60 font-bold uppercase tracking-widest disabled:opacity-30 disabled:bg-transparent"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={12} className="sm:w-2.5 sm:h-2.5" />
          </button>
          <div className="join-item flex items-center justify-center px-4 sm:px-3 bg-base-100 border-x border-base-300 text-[10px] sm:text-[9px] font-bold">
            {currentPage} / {totalPages || 1}
          </div>
          <button
            className="join-item btn btn-xs h-7 sm:h-6 min-h-0 bg-base-100 border-none hover:bg-base-200 text-base-content/60 font-bold uppercase tracking-widest disabled:opacity-30 disabled:bg-transparent"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight size={12} className="sm:w-2.5 sm:h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTableList;