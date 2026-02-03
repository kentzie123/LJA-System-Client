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
} from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

const LeaveRequestTable = ({ 
  onEdit, 
  onDelete, 
  onAction, 
  onViewReason, 
  // --- Receive Permissions ---
  canApprove = false, 
  canViewAll = false 
}) => {
  const { leaves, fetchAllLeaves, setSelectedLeave, isUpdating } = useLeaveStore();
  const { authUser } = useAuthStore();

  // Tab State
  const [activeTab, setActiveTab] = useState(canViewAll ? "team" : "my");
  const [filterStatus, setFilterStatus] = useState("All");

  // Month Filter State
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };
  const [filterDate, setFilterDate] = useState(getCurrentMonth());

  // Force "my" tab if user loses "view all" permission
  useEffect(() => {
    if (!canViewAll) setActiveTab("my");
  }, [canViewAll]);

  useEffect(() => {
    fetchAllLeaves();
  }, [fetchAllLeaves]);

  const pendingCount = leaves.filter((l) => l.status === "Pending").length;

  // --- HELPERS ---
  const getAvatarColor = (name) => {
    const colors = [
      "bg-purple-500",
      "bg-teal-500",
      "bg-blue-500",
      "bg-orange-500",
      "bg-pink-500",
    ];
    return colors[name?.charCodeAt(0) % colors.length] || "bg-primary";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- FILTER LOGIC ---
  const filteredLeaves = leaves.filter((req) => {
    // A. Tab Filter: If "my" tab OR user can't view all, show only own leaves
    if (activeTab === "my" || !canViewAll) {
      if (req.user_id !== authUser?.id) return false;
    }

    // B. Status Filter
    if (filterStatus !== "All" && req.status !== filterStatus) return false;

    // C. Month Filter
    if (filterDate) {
      const reqDate = new Date(req.start_date);
      const reqMonthStr = `${reqDate.getFullYear()}-${String(reqDate.getMonth() + 1).padStart(2, "0")}`;
      if (reqMonthStr !== filterDate) return false;
    }

    return true;
  });

  // --- HANDLERS ---
  const handleActionClick = (req, status) => {
    // Allow re-approval/rejection as requested ("freely approve and reject")
    if (req.status === status) return;
    onAction({ id: req.id, status: status, fullname: req.fullname });
  };

  const handleDeleteClick = (req) => {
    if (req.user_id !== authUser?.id) {
      toast.error("You can only delete your own requests.");
      return;
    }
    if (req.status !== "Pending") {
      toast.error("You can only delete Pending requests.");
      return;
    }
    setSelectedLeave(req);
    onDelete();
  };

  const handleEditClick = (req) => {
    if (req.user_id !== authUser?.id) {
      toast.error("You can only edit your own requests.");
      return;
    }
    if (req.status !== "Pending") {
      toast.error("You can only edit Pending requests.");
      return;
    }
    setSelectedLeave(req);
    onEdit();
  };

  return (
    <div className="w-full bg-base-200 rounded-2xl shadow-xl overflow-hidden border border-base-300 flex flex-col">
      
      {/* --- TOP BAR --- */}
      <div className="p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-base-300/50">
        
        {/* TABS (Hidden if user can't view all) */}
        {canViewAll ? (
          <div className="bg-base-100/50 p-1 rounded-lg flex items-center w-full lg:w-auto">
            <button
              onClick={() => setActiveTab("my")}
              className={`flex-1 lg:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "my"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              My Leave
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`flex-1 lg:flex-none relative px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "team"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              Team Approvals
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-error text-[8px] text-white justify-center items-center">
                    {pendingCount}
                  </span>
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="text-lg font-bold px-2 opacity-80">My Leave History</div>
        )}

        {/* FILTERS */}
        <div className="grid grid-cols-2 lg:flex w-full lg:w-auto gap-3">
          {/* Month Input */}
          <div className="relative group bg-base-100 border border-base-300 rounded-lg px-3 py-1.5 flex items-center gap-2 hover:border-base-content/30 transition-colors h-10">
            <Calendar size={14} className="opacity-50 shrink-0" />
            <input
              type="month"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-base-content/80 w-full lg:w-auto accent-primary"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="btn btn-ghost btn-xs btn-circle h-5 w-5 min-h-0 shrink-0"
              >
                <X size={10} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative group h-10">
            <select
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-sm h-full pl-9 bg-base-100 border-base-300 w-full lg:w-40 cursor-pointer text-sm"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto w-full bg-base-100/30">
        <div className="min-w-[900px]">
          
          {/* HEADERS */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-base-200 text-xxs font-bold opacity-50 uppercase tracking-wider sticky top-0 z-10">
            {/* Dynamic Column Spans:
               If canApprove is TRUE:  Details(4) + Duration(3) + Status(2) + Approval(2) + Actions(1) = 12
               If canApprove is FALSE: Details(5) + Duration(3) + Status(3) + [Hidden]    + Actions(1) = 12
            */}
            <div className={canApprove ? "col-span-4" : "col-span-5"}>Request Details</div>
            <div className="col-span-3">Duration</div>
            <div className={canApprove ? "col-span-2" : "col-span-3"}>Status</div>
            
            {/* Approval Column Header - ONLY visible if permitted */}
            {canApprove && <div className="col-span-2">Approval</div>}
            
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* BODY */}
          <div className="divide-y divide-base-300/30">
            {filteredLeaves.length === 0 ? (
              <div className="p-12 text-center text-sm opacity-50 flex flex-col items-center gap-2">
                <span>No requests found for this period.</span>
                <button
                  onClick={() => {
                    setFilterDate("");
                    setFilterStatus("All");
                  }}
                  className="btn btn-link btn-xs no-underline hover:no-underline text-primary"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredLeaves.map((req) => {
                const isOwner = req.user_id === authUser?.id;
                const isPending = req.status === "Pending";

                return (
                  <div key={req.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-base-100/50 transition-colors">
                    
                    {/* 1. Request Details */}
                    <div className={canApprove ? "col-span-4" : "col-span-5 flex items-start gap-3"}>
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0 ${getAvatarColor(req.fullname)}`}>
                          {req.initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate max-w-[120px]">
                              {req.fullname}
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                              {req.leave_type}
                            </span>
                          </div>
                          <span className="text-xs opacity-60 mt-0.5 truncate italic max-w-[200px]" title={req.reason}>
                            "{req.reason}"
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Duration */}
                    <div className="col-span-3 flex items-center gap-2 opacity-80">
                      <Calendar size={16} className="opacity-40 shrink-0" />
                      <div className="flex flex-col text-xs">
                        <span className="font-medium tabular-nums">{formatDate(req.start_date)}</span>
                        <span className="opacity-50 tabular-nums">to {formatDate(req.end_date)}</span>
                      </div>
                    </div>

                    {/* 3. Status Badge */}
                    <div className={canApprove ? "col-span-2" : "col-span-3"}>
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium w-fit whitespace-nowrap
                          ${req.status === "Approved" ? "border-success/30 bg-success/10 text-success" : 
                            req.status === "Rejected" ? "border-error/30 bg-error/10 text-error" : 
                            "border-warning/30 bg-warning/10 text-warning"}`}>
                          {req.status === "Approved" ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {req.status}
                        </div>
                        {req.status === "Rejected" && req.rejection_reason && (
                          <button
                            onClick={() => onViewReason(req.rejection_reason)}
                            className="text-base-content/40 hover:text-primary transition-colors tooltip tooltip-right"
                            data-tip="View Reason"
                          >
                            <Info size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 4. Approval Actions - ONLY if canApprove is TRUE */}
                    {canApprove && (
                      <div className="col-span-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleActionClick(req, "Approved")}
                            disabled={isUpdating}
                            className={`btn btn-xs btn-success text-white tooltip tooltip-left ${req.status === "Approved" ? "opacity-30" : ""}`}
                            data-tip="Approve"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => handleActionClick(req, "Rejected")}
                            disabled={isUpdating}
                            className={`btn btn-xs btn-error text-white tooltip tooltip-left ${req.status === "Rejected" ? "opacity-30" : ""}`}
                            data-tip="Reject"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 5. Edit/Delete Actions (Owner Only) */}
                    <div className="col-span-1 flex justify-end gap-1">
                      {isOwner && isPending && (
                        <>
                          <button onClick={() => onEdit && handleEditClick(req)} className="btn btn-ghost btn-xs btn-square hover:bg-base-200" title="Edit">
                            <Pencil size={14} className="opacity-40 hover:opacity-100" />
                          </button>
                          <button onClick={() => onDelete && handleDeleteClick(req)} className="btn btn-ghost btn-xs btn-square hover:bg-base-200" title="Delete">
                            <Trash2 size={14} className="opacity-40 hover:opacity-100 hover:text-error" />
                          </button>
                        </>
                      )}
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