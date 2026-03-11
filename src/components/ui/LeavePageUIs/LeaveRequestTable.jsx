"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  Pencil,
  Check,
  X,
  Trash2,
  Info,
  Loader2,
  Briefcase,
  Ban,
} from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";
import toast from "react-hot-toast";

import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";

const LeaveRequestTable = ({
  leaves = [],
  onEdit,
  onDelete,
  onAction,
  onViewRejectReason,
  onViewLeaveReason,  
  canApprove = false,
  canViewAll = false,
  canCreate = false,
  authUser,
  isFetching = false,
  filterStatus,
  setFilterStatus,
  filterDate,
  setFilterDate,
}) => {
  const { setSelectedLeave, isUpdating, stats } = useLeaveStore();
  const currentUserId = authUser?.id;

  const showTeamTab = canApprove || canViewAll;
  const [activeTab, setActiveTab] = useState(() => (showTeamTab ? "team" : "my"));
  const pendingCount = stats?.pendingCount || 0;

  useEffect(() => {
    if (!showTeamTab && activeTab !== "my") setActiveTab("my");
  }, [showTeamTab, activeTab]);

  const displayedLeaves = leaves.filter((req) => {
    if (activeTab === "my") return req.user_id === currentUserId;
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleActionClick = (req, status) => {
    if (req.status !== status) onAction({ id: req.id, status, fullname: req.fullname });
  };

  const handleDeleteClick = (req) => {
    if (canViewAll) {
      setSelectedLeave(req);
      onDelete();
      return;
    }
    if (req.user_id !== currentUserId) return toast.error("Only your own requests.");
    if (req.status !== "Pending") return toast.error("Only Pending requests.");
    setSelectedLeave(req);
    onDelete();
  };

  const handleEditClick = (req) => {
    if (req.user_id !== currentUserId) return toast.error("Only your own requests.");
    if (req.status !== "Pending") return toast.error("Only pending requests.");
    setSelectedLeave(req);
    onEdit();
  };

  const handleDateChange = (e) => {
    const newVal = e.target.value;
    if (!newVal) {
      const now = new Date();
      setFilterDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    } else {
      setFilterDate(newVal);
    }
  };

  if (!showTeamTab && !canCreate) {
    return (
      <div className="w-full h-64 bg-base-100 rounded-xl shadow-sm border border-base-300 flex flex-col items-center justify-center text-base-content/50 gap-2 antialiased-text">
        <Ban size={32} className="opacity-20" />
        <span className="text-[10px] font-black uppercase tracking-widest">Access Restricted</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-base-100 rounded-xl shadow-sm border border-base-300 flex flex-col antialiased-text">
      
      {/* --- TOP BAR --- */}
      <div className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-base-200 shrink-0">
        
        {/* TABS */}
        {showTeamTab ? (
          <div className="flex items-center p-1 bg-base-200 rounded-lg border border-base-300 w-full sm:w-fit shrink-0">
            {canCreate && (
              <button
                onClick={() => setActiveTab("my")}
                className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                  activeTab === "my" ? "bg-base-100 text-primary shadow-sm" : "text-base-content/50 hover:text-base-content"
                }`}
              >
                My Leave
              </button>
            )}
            <button
              onClick={() => setActiveTab("team")}
              className={`relative flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                activeTab === "team" ? "bg-base-100 text-primary shadow-sm" : "text-base-content/50 hover:text-base-content"
              }`}
            >
              Team Approvals
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-error text-[8px] font-black text-white shadow-sm ring-1 ring-base-100">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="text-[10px] font-black uppercase tracking-widest text-base-content/50 px-1">
            My Leave History
          </div>
        )}

        {/* FILTERS */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-32">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none z-10" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-bordered select-sm h-8 min-h-0 pl-7 text-[10px] font-bold uppercase tracking-wider w-full bg-base-200/50 focus:bg-base-100 rounded-md"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="relative flex items-center bg-base-200/50 border border-base-300 rounded-md px-2.5 h-8 w-full sm:w-auto hover:bg-base-100 transition-colors focus-within:bg-base-100 focus-within:border-primary/50">
            <Calendar size={12} className="opacity-50 shrink-0 pointer-events-none mr-2" />
            <input
              type="month"
              value={filterDate}
              onChange={handleDateChange}
              onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
              className="bg-transparent text-[11px] font-bold focus:outline-none cursor-pointer text-base-content/80 w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-base-100">
        <div className="w-full flex flex-col">
          
          {/* DESKTOP HEADER */}
          <div className="hidden lg:grid grid-cols-12 gap-2 px-5 py-2.5 bg-base-200/50 text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40 border-b border-base-200 sticky top-0 z-10">
            <div className="col-span-4">Employee Details</div>
            <div className="col-span-3">Duration</div>
            <div className="col-span-2">Status</div>
            {canApprove ? (
              <div className="col-span-3 grid grid-cols-3">
                <div className="col-span-2 text-center">Approval</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
            ) : (
              <div className="col-span-3 text-right">Actions</div>
            )}
          </div>

          {/* BODY */}
          <div className="flex flex-col divide-y divide-base-200">
            {isFetching ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin size-6 text-primary opacity-50" /></div>
            ) : displayedLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 opacity-40">
                <Briefcase size={32} className="mb-3" strokeWidth={1.5} />
                <h3 className="text-[11px] font-black uppercase tracking-widest">No records found</h3>
              </div>
            ) : (
              displayedLeaves.map((req) => {
                const isOwner = req.user_id === currentUserId;
                const isPending = req.status === "Pending";

                const StatusBadge = (
                  <div className="flex items-center">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                        req.status === "Approved" ? "border-success/30 bg-success/10 text-success" : 
                        req.status === "Rejected" ? "border-error/30 bg-error/10 text-error" : 
                        "border-warning/30 bg-warning/10 text-warning"
                      }`}
                    >
                      {req.status === "Approved" ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {req.status}
                    </div>
                    {req.status === "Rejected" && req.rejection_reason && (
                      <button 
                        onClick={() => onViewRejectReason && onViewRejectReason(req.rejection_reason)} 
                        className="text-base-content/40 hover:text-error ml-1.5 p-0.5"
                        title="View Rejection Reason"
                      >
                        <Info size={12} />
                      </button>
                    )}
                  </div>
                );

                return (
                  <div key={req.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-2 p-3 lg:px-5 lg:py-2.5 lg:items-center hover:bg-base-200/30 transition-colors group">
                    
                    {/* 1. DETAILS */}
                    <div className="lg:col-span-4 flex items-start justify-between min-w-0 w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 relative rounded-full overflow-hidden shrink-0 border border-base-300 bg-base-200">
                          <Image src={req.profile_picture ? getImageUrl(req.profile_picture) : "/images/default_profile.jpg"} alt={req.fullname} fill sizes="32px" className="object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[12px] truncate leading-none text-base-content">{req.fullname}</span>
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest border border-primary/20 bg-primary/5 px-1.5 py-0.5 rounded shrink-0 leading-none">
                              {req.leave_type}
                            </span>
                          </div>
                          
                          {/* --- LEAVE REASON SECTION --- */}
                          <div className="flex items-center gap-1.5 mt-1 min-w-0">
                            <span className="text-[10px] opacity-50 truncate leading-none">
                              "{req.reason}"
                            </span>
                            {req.reason && (
                              <button 
                                onClick={() => onViewLeaveReason && onViewLeaveReason(req.reason)} 
                                className="text-base-content/30 hover:text-primary transition-colors shrink-0"
                                title="View Full Leave Reason"
                              >
                                <Info size={12} />
                              </button>
                            )}
                          </div>
                          {/* ---------------------------- */}

                        </div>
                      </div>
                      <div className="lg:hidden shrink-0 ml-2">{StatusBadge}</div>
                    </div>

                    {/* 2. DURATION */}
                    <div className="lg:col-span-3 flex items-center gap-1.5 opacity-70 min-w-0 text-[11px] font-medium mt-1 lg:mt-0 ml-11 lg:ml-0 bg-base-200/50 lg:bg-transparent p-2 lg:p-0 rounded border border-base-200 lg:border-none">
                      <Calendar size={12} className="opacity-50 shrink-0 hidden lg:block" />
                      <div className="flex flex-row lg:flex-col gap-1.5 lg:gap-0 leading-tight">
                        <span className="tabular-nums">{formatDate(req.start_date)}</span>
                        <span className="opacity-50 tabular-nums lg:hidden">→</span>
                        <span className="opacity-50 tabular-nums hidden lg:inline text-[9px] uppercase tracking-widest mt-0.5">To {formatDate(req.end_date)}</span>
                        <span className="tabular-nums lg:hidden">{formatDate(req.end_date)}</span>
                      </div>
                    </div>

                    {/* 3. STATUS */}
                    <div className="hidden lg:block lg:col-span-2">{StatusBadge}</div>

                    {/* 4. FOOTER / ACTIONS */}
                    <div className={`flex flex-wrap items-center justify-between w-full mt-2 pt-2 border-t border-base-200 lg:mt-0 lg:pt-0 lg:border-none gap-2 lg:col-span-3 ${!canApprove ? "lg:justify-end" : ""}`}>
                      
                      {/* APPROVAL BUTTONS */}
                      {canApprove && activeTab === "team" ? (
                        <div className="flex gap-1.5 w-full sm:w-auto flex-1 lg:justify-center order-last sm:order-none">
                          <button
                            onClick={() => handleActionClick(req, "Approved")}
                            disabled={isUpdating || req.status === "Approved"}
                            className={`btn btn-sm h-7 min-h-0 lg:btn-xs btn-success text-white flex-1 sm:flex-none gap-1 font-bold text-[9px] uppercase tracking-widest rounded px-2 ${req.status === "Approved" ? "opacity-30" : ""}`}
                          >
                            <Check size={12} />
                            <span className="lg:hidden">Approve</span>
                          </button>
                          <button
                            onClick={() => handleActionClick(req, "Rejected")}
                            disabled={isUpdating || req.status === "Rejected"}
                            className={`btn btn-sm h-7 min-h-0 lg:btn-xs btn-error text-white flex-1 sm:flex-none gap-1 font-bold text-[9px] uppercase tracking-widest rounded px-2 ${req.status === "Rejected" ? "opacity-30" : ""}`}
                          >
                            <X size={12} />
                            <span className="lg:hidden">Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="lg:hidden text-[9px] font-black opacity-30 uppercase tracking-widest">Actions</div>
                      )}

                      {/* EDIT/DELETE ACTIONS */}
                      <div className="flex justify-end gap-1 ml-auto shrink-0 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        {isOwner && isPending && (
                          <button onClick={() => handleEditClick(req)} className="btn btn-ghost btn-xs h-6 w-6 min-h-0 p-0 rounded text-base-content/40 hover:text-warning hover:bg-warning/10">
                            <Pencil size={12} />
                          </button>
                        )}
                        {((isOwner && isPending) || canViewAll) && (
                          <button onClick={() => handleDeleteClick(req)} className="btn btn-ghost btn-xs h-6 w-6 min-h-0 p-0 rounded text-base-content/40 hover:text-error hover:bg-error/10">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestTable;