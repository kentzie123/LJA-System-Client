"use client";

import React, { useEffect } from "react";
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
  Briefcase,
  Ban,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatDate, formatTime, getTypeColor, getCurrentMonth } from "@/utils/formatUtils";

const OvertimeTableList = ({
  requests = [],
  activeTab,
  setActiveTab,
  filterStatus,
  setFilterStatus,
  filterDate,
  setFilterDate,
  onEdit,
  onDelete,
  onAction,
  onViewRejectReason, 
  onViewOvertimeReason,
  canApprove = false,
  canCreate = false,
}) => {
  const { authUser } = useAuthStore();
  const currentUserId = authUser?.id;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  useEffect(() => {
    if (!canApprove) {
      setActiveTab("my");
    } else if (canApprove && !canCreate) {
      setActiveTab("team");
    }
  }, [canApprove, canCreate, setActiveTab]);

  if (!canApprove && !canCreate) {
    return (
      <div className="w-full h-full min-h-[300px] bg-base-100 rounded-xl shadow-sm border border-base-200 flex flex-col items-center justify-center text-base-content/40 antialiased-text">
        <Ban size={32} strokeWidth={1.5} className="mb-2" />
        <span className="text-[10px] font-black uppercase tracking-widest">Access Restricted</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-base-100 rounded-xl shadow-sm border border-base-200 flex flex-col antialiased-text overflow-hidden">
      
      {/* --- TOP BAR: Ultra Compact --- */}
      <div className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-base-200 shrink-0 bg-base-100">
        
        {/* TABS (Segmented Control) */}
        {canApprove ? (
          <div className="flex items-center p-1 bg-base-200/80 rounded-lg border border-base-300 w-full sm:w-fit shrink-0">
            {canCreate && (
              <button
                onClick={() => setActiveTab("my")}
                className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${
                  activeTab === "my" ? "bg-base-100 text-primary shadow-sm border border-base-200" : "text-base-content/50 hover:text-base-content border border-transparent"
                }`}
              >
                My Overtime
              </button>
            )}
            <button
              onClick={() => setActiveTab("team")}
              className={`relative flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${
                activeTab === "team" ? "bg-base-100 text-primary shadow-sm border border-base-200" : "text-base-content/50 hover:text-base-content border border-transparent"
              }`}
            >
              Team Approvals
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[8px] font-black text-white shadow-sm ring-2 ring-base-100">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="text-[10px] font-black uppercase tracking-widest text-base-content/50 px-1">
            My Overtime History
          </div>
        )}

        {/* FILTERS */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-32 group">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary pointer-events-none z-10 transition-colors" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-bordered select-sm h-8 min-h-0 pl-7 text-[9px] font-black uppercase tracking-widest w-full bg-base-200/50 hover:bg-base-200 border-transparent focus:border-primary focus:bg-base-100 rounded-md transition-all cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="relative flex items-center bg-base-200/50 hover:bg-base-200 border border-transparent focus-within:border-primary focus-within:bg-base-100 rounded-md px-2.5 h-8 w-full sm:w-auto transition-all cursor-pointer group">
            <Calendar size={12} className="text-base-content/40 group-focus-within:text-primary shrink-0 pointer-events-none mr-2 transition-colors" />
            <input
              type="month"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value || getCurrentMonth())}
              onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer text-base-content/80 w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-base-100 relative">
        <div className="w-full flex flex-col">
          
          {/* DESKTOP HEADER */}
          <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-2.5 bg-base-200/50 border-b border-base-200 sticky top-0 z-10 backdrop-blur-sm">
            <div className="col-span-3 text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40">Employee & Reason</div>
            <div className="col-span-4 text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40 pl-2">Timeframe & Hours</div>
            <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40">Status</div>
            {canApprove && activeTab === "team" ? (
              <div className="col-span-3 flex justify-between">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40">Approval</div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40">Actions</div>
              </div>
            ) : (
              <div className="col-span-3 text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40 text-right">Actions</div>
            )}
          </div>

          {/* BODY */}
          <div className="flex flex-col divide-y divide-base-200/60">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 opacity-40">
                <Briefcase size={32} strokeWidth={1.5} className="mb-3" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">No records found</h3>
              </div>
            ) : (
              requests.map((req) => {
                const isOwner = req.user_id === currentUserId;
                const isPending = req.status === "Pending";

                const StatusBadge = (
                  <div className="flex items-center">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                        req.status === "Approved" ? "border-success/30 bg-success/10 text-success" : 
                        req.status === "Rejected" ? "border-error/30 bg-error/10 text-error" : 
                        "border-warning/30 bg-warning/10 text-warning"
                      }`}
                    >
                      {req.status === "Approved" ? <CheckCircle size={10} strokeWidth={2.5} /> : <Clock size={10} strokeWidth={2.5} />}
                      {req.status}
                    </div>
                    {req.status === "Rejected" && req.rejection_reason && (
                      <button 
                        onClick={() => onViewRejectReason && onViewRejectReason(req.rejection_reason)} 
                        className="text-base-content/30 hover:text-error ml-1.5 p-0.5 transition-colors"
                        title="View Rejection Reason"
                      >
                        <Info size={14} />
                      </button>
                    )}
                  </div>
                );

                return (
                  <div key={req.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-3 p-3 lg:px-5 lg:py-3 lg:items-center hover:bg-base-200/40 transition-colors group">
                    
                    {/* 1. DETAILS (Removed duplicate date, kept clean) */}
                    <div className="lg:col-span-3 flex items-start justify-between min-w-0 w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 relative rounded-full overflow-hidden shrink-0 border border-base-300 bg-base-200">
                          <Image src={req.profile_picture ? getImageUrl(req.profile_picture) : "/images/default_profile.jpg"} alt={req.fullname} fill sizes="36px" className="object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0 justify-center">
                          <span className="font-black text-[11px] uppercase tracking-tight truncate leading-none text-base-content">
                            {req.fullname}
                          </span>
                          
                          {/* --- OVERTIME REASON SECTION --- */}
                          <div className="flex items-center gap-1.5 mt-1 min-w-0">
                            <span className="text-[9px] font-bold text-base-content/50 truncate leading-none">
                              "{req.reason}"
                            </span>
                            {req.reason && (
                              <button 
                                onClick={() => onViewOvertimeReason && onViewOvertimeReason(req.reason)} 
                                className="text-base-content/30 hover:text-primary transition-colors shrink-0"
                                title="View Full Overtime Reason"
                              >
                                <Info size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="lg:hidden shrink-0 ml-2">{StatusBadge}</div>
                    </div>

                    {/* 2. TIMEFRAME & HOURS (Fully explicit IN and OUT) */}
                    <div className="lg:col-span-4 flex flex-col min-w-0 mt-1 lg:mt-0 bg-base-200/50 lg:bg-transparent p-2.5 lg:p-0 lg:pl-2 rounded-md border border-base-200 lg:border-none gap-1.5">
                      
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded leading-none ${getTypeColor(req.ot_type)}`}>
                          {req.ot_type || "Regular Day"}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                          {req.total_hours} HRS TOTAL
                        </span>
                      </div>

                      {/* Stacking the Dates & Times cleanly */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-base-content/80">
                          <span className="text-[8px] font-black opacity-40 uppercase tracking-widest w-6">IN</span>
                          <span className="uppercase tracking-widest">{formatDate(req.start_datetime)}</span>
                          <span className="tabular-nums text-primary/80">{formatTime(req.start_datetime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-base-content/80">
                          <span className="text-[8px] font-black opacity-40 uppercase tracking-widest w-6">OUT</span>
                          <span className="uppercase tracking-widest">{formatDate(req.end_datetime)}</span>
                          <span className="tabular-nums text-error/80">{formatTime(req.end_datetime)}</span>
                        </div>
                      </div>

                    </div>

                    {/* 3. STATUS */}
                    <div className="hidden lg:block lg:col-span-2">
                      {StatusBadge}
                    </div>

                    {/* 4. ACTIONS (Locked Flex Layout) */}
                    <div className="flex items-center justify-between lg:justify-end gap-2 lg:col-span-3 w-full mt-2 pt-2 border-t border-base-200 lg:mt-0 lg:pt-0 lg:border-none">
                      
                      {/* APPROVAL BUTTONS */}
                      {canApprove && activeTab === "team" && (
                        <div className="flex items-center gap-1.5 flex-1 lg:flex-none">
                          <button
                            onClick={() => onAction && onAction(req, "Approved")}
                            disabled={!isPending}
                            className="btn btn-sm h-7 min-h-0 lg:h-6 lg:px-2 flex-1 lg:flex-none btn-success text-white gap-1 font-black text-[9px] uppercase tracking-widest rounded disabled:opacity-30 disabled:bg-success disabled:text-white border-none"
                          >
                            <Check size={12} strokeWidth={3} />
                            <span className="lg:hidden">Approve</span>
                          </button>
                          <button
                            onClick={() => onAction && onAction(req, "Rejected")}
                            disabled={!isPending}
                            className="btn btn-sm h-7 min-h-0 lg:h-6 lg:px-2 flex-1 lg:flex-none btn-error text-white gap-1 font-black text-[9px] uppercase tracking-widest rounded disabled:opacity-30 disabled:bg-error disabled:text-white border-none"
                          >
                            <X size={12} strokeWidth={3} />
                            <span className="lg:hidden">Reject</span>
                          </button>
                        </div>
                      )}

                      {/* EDIT/DELETE ACTIONS */}
                      <div className="flex items-center justify-end gap-1 ml-auto shrink-0 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        {isOwner && isPending && (
                          <button 
                            onClick={() => onEdit && onEdit(req)} 
                            className="btn btn-ghost btn-xs h-6 w-6 min-h-0 p-0 rounded text-base-content/40 hover:text-warning hover:bg-warning/10"
                            title="Edit"
                          >
                            <Pencil size={12} strokeWidth={2.5} />
                          </button>
                        )}
                        {((isOwner && isPending) || canApprove) && (
                          <button 
                            onClick={() => onDelete && onDelete(req)} 
                            className="btn btn-ghost btn-xs h-6 w-6 min-h-0 p-0 rounded text-base-content/40 hover:text-error hover:bg-error/10"
                            title="Delete"
                          >
                            <Trash2 size={12} strokeWidth={2.5} />
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

export default OvertimeTableList;