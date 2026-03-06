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

const LeaveRequestTable = ({
  leaves = [],
  onEdit,
  onDelete,
  onAction,
  onViewReason,
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

  // --- TAB LOGIC ---
  const showTeamTab = canApprove || canViewAll;
  const [activeTab, setActiveTab] = useState(() => {
    if (showTeamTab) return "team";
    return "my";
  });

  // Calculate True Pending Count directly from Backend Stats
  const pendingCount = stats?.pendingCount || 0;

  // --- EFFECT: Tab Guard ---
  useEffect(() => {
    if (!showTeamTab && activeTab !== "my") {
      setActiveTab("my");
    }
  }, [showTeamTab, activeTab]);

  // --- LOCAL FILTERING (For Tabs) ---
  const displayedLeaves = leaves.filter((req) => {
    // If viewing personal tab, strictly filter by user ID
    if (activeTab === "my") {
      return req.user_id === currentUserId;
    }
    // If viewing team tab, show all
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleActionClick = (req, status) => {
    if (req.status !== status)
      onAction({ id: req.id, status, fullname: req.fullname });
  };

  const handleDeleteClick = (req) => {
    if (canViewAll) {
      setSelectedLeave(req);
      onDelete();
      return;
    }
    if (req.user_id !== currentUserId)
      return toast.error("Only your own requests.");
    if (req.status !== "Pending") return toast.error("Only Pending requests.");
    setSelectedLeave(req);
    onDelete();
  };

  const handleEditClick = (req) => {
    if (req.user_id !== currentUserId)
      return toast.error("Only your own requests.");
    if (req.status !== "Pending") return toast.error("Only pending requests.");
    setSelectedLeave(req);
    onEdit();
  };

  // --- NO-CLEAR DATE HANDLER ---
  const handleDateChange = (e) => {
    const newVal = e.target.value;
    if (!newVal) {
      // Snap back to current month if they try to clear it completely
      const now = new Date();
      setFilterDate(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      );
    } else {
      setFilterDate(newVal);
    }
  };

  // --- RENDER: RESTRICTED ACCESS ---
  if (!showTeamTab && !canCreate) {
    return (
      <div className="w-full h-64 bg-base-200 rounded-2xl shadow-xl border border-base-300 flex flex-col items-center justify-center text-base-content/50 gap-2">
        <Ban size={48} className="opacity-20" />
        <span className="font-semibold">Access Restricted</span>
        <span className="text-xs">
          You do not have permission to view or request leave.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-base-200 rounded-2xl shadow-xl overflow-hidden border border-base-300 flex flex-col">
      {/* --- TOP BAR (Responsive Flex Wrap) --- */}
      <div className="p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-base-300/50 shrink-0">
        {/* TABS */}
        {showTeamTab ? (
          <div className="bg-base-300 p-1 rounded-lg flex items-center w-full sm:w-auto">
            {canCreate && (
              <button
                onClick={() => setActiveTab("my")}
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === "my"
                    ? "bg-base-100 shadow-sm text-base-content"
                    : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
                }`}
              >
                My Leave
              </button>
            )}

            <button
              onClick={() => setActiveTab("team")}
              className={`flex-1 sm:flex-none relative px-6 pr-8 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                activeTab === "team"
                  ? "bg-base-100 shadow-sm text-base-content"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
              }`}
            >
              Team Approvals
              {pendingCount > 0 && (
                <div className="absolute top-1 right-1 z-10 flex h-4 w-4 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white shadow-sm">
                    {pendingCount}
                  </span>
                </div>
              )}
            </button>
          </div>
        ) : (
          <div className="font-bold text-base-content/70 px-2">
            My Leave History
          </div>
        )}

        {/* FILTERS (Stack on mobile, row on tablet+) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto justify-end">
          {/* Status Select */}
          <div className="relative group w-full sm:w-auto">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none z-10"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-sm pl-9 bg-base-100 border-base-300 w-full sm:w-36 focus:outline-none focus:border-primary cursor-pointer rounded-lg"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Month Picker */}
          <div className="relative group bg-base-100 border border-base-300 rounded-lg px-3 py-1 flex items-center gap-2 hover:border-base-content/30 transition-colors h-8 w-full sm:w-auto">
            <Calendar
              size={14}
              className="opacity-50 shrink-0 pointer-events-none"
            />
            <input
              type="month"
              value={filterDate}
              onChange={handleDateChange}
              onClick={(e) => {
                try {
                  e.target.showPicker();
                } catch (err) {}
              }}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-base-content/80 w-full sm:w-auto accent-primary border-none p-0 h-full"
            />
          </div>
        </div>
      </div>

      {/* --- TABLE / LIST CONTAINER --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-base-100/30 custom-scrollbar relative">
        <div className="w-full h-full flex flex-col">
          {/* DESKTOP HEADER (Hidden on Mobile) */}
          <div className="hidden lg:grid grid-cols-12 gap-2 px-6 py-4 bg-base-200/90 backdrop-blur text-xxs font-bold opacity-50 uppercase tracking-wider border-b border-base-300/30 sticky top-0 z-10">
            <div className="col-span-4">Request Details</div>
            <div className="col-span-3">Duration</div>
            <div className="col-span-2">Status</div>
            {canApprove ? (
              <div className="col-span-3 grid grid-cols-3">
                <div className="col-span-2">Approval</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
            ) : (
              <div className="col-span-3 text-right">Actions</div>
            )}
          </div>

          {/* BODY */}
          <div className="flex flex-col divide-y divide-base-300/30">
            {isFetching ? (
              <div className="p-12 text-center flex justify-center">
                <Loader2 className="animate-spin size-8 text-primary opacity-50" />
              </div>
            ) : displayedLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center p-12 opacity-60">
                <Briefcase
                  size={48}
                  className="mb-4 text-base-content/30"
                  strokeWidth={1.5}
                />
                <h3 className="text-base font-semibold">No records found.</h3>
                <p className="text-sm mt-1">
                  Try adjusting your filters or tabs.
                </p>
              </div>
            ) : (
              displayedLeaves.map((req) => {
                const isOwner = req.user_id === currentUserId;
                const isPending = req.status === "Pending";

                const StatusBadge = (
                  <div className="flex items-center">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium w-fit ${
                        req.status === "Approved"
                          ? "border-success/30 bg-success/10 text-success"
                          : req.status === "Rejected"
                            ? "border-error/30 bg-error/10 text-error"
                            : "border-warning/30 bg-warning/10 text-warning"
                      }`}
                    >
                      {req.status === "Approved" ? (
                        <CheckCircle size={10} />
                      ) : (
                        <Clock size={10} />
                      )}
                      {req.status}
                    </div>
                    {req.status === "Rejected" && req.rejection_reason && (
                      <button
                        onClick={() => onViewReason(req.rejection_reason)}
                        className="text-base-content/40 hover:text-primary transition-colors ml-2 p-1"
                      >
                        <Info size={14} />
                      </button>
                    )}
                  </div>
                );

                return (
                  // ROW WRAPPER: Flex Column on Mobile, Grid on Desktop
                  <div
                    key={req.id}
                    className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-2 p-4 lg:px-6 lg:py-4 lg:items-center hover:bg-base-100/50 transition-colors"
                  >
                    {/* 1. DETAILS - Col Span 4 */}
                    <div className="lg:col-span-4 flex items-start justify-between min-w-0 w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 lg:h-9 lg:w-9 rounded-full overflow-hidden shrink-0 border border-base-300 shadow-sm bg-base-300">
                          <img
                            src={
                              req.profile_picture ||
                              "/images/default_profile.jpg"
                            }
                            alt={req.fullname}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm truncate">
                              {req.fullname}
                            </span>
                            <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                              {req.leave_type}
                            </span>
                          </div>
                          <span
                            className="text-xs opacity-50 line-clamp-1 italic mt-0.5"
                            title={req.reason}
                          >
                            "{req.reason}"
                          </span>
                        </div>
                      </div>
                      {/* Mobile Status Badge (Hidden on Desktop) */}
                      <div className="lg:hidden shrink-0 ml-2">
                        {StatusBadge}
                      </div>
                    </div>

                    {/* 2. DURATION - Col Span 3 */}
                    <div className="lg:col-span-3 flex items-center gap-2 opacity-80 min-w-0 text-sm lg:text-[11px] mt-1 lg:mt-0 ml-12 lg:ml-0 bg-base-200/50 lg:bg-transparent p-2 lg:p-0 rounded-lg">
                      <Calendar
                        size={14}
                        className="opacity-40 shrink-0 hidden lg:block"
                      />
                      <div className="flex flex-row lg:flex-col gap-1.5 lg:gap-0 leading-tight">
                        <span className="font-semibold tabular-nums">
                          {formatDate(req.start_date)}
                        </span>
                        <span className="opacity-50 tabular-nums lg:hidden">
                          →
                        </span>
                        <span className="opacity-50 tabular-nums hidden lg:inline">
                          to {formatDate(req.end_date)}
                        </span>
                        <span className="font-semibold tabular-nums lg:hidden">
                          {formatDate(req.end_date)}
                        </span>
                      </div>
                    </div>

                    {/* 3. STATUS - Col Span 2 (Desktop Only) */}
                    <div className="hidden lg:block lg:col-span-2">
                      {StatusBadge}
                    </div>

                    {/* 4. FOOTER: APPROVAL & ACTIONS - Col Span 3 */}
                    <div
                      className={`flex flex-wrap sm:flex-nowrap items-center justify-between w-full mt-3 pt-3 border-t border-base-200 lg:mt-0 lg:pt-0 lg:border-none gap-3 lg:col-span-3 ${!canApprove ? "lg:justify-end" : ""}`}
                    >
                      {/* APPROVAL */}
                      {canApprove && activeTab === "team" ? (
                        <div className="flex gap-2 w-full sm:w-auto flex-1 order-last sm:order-none">
                          <button
                            onClick={() => handleActionClick(req, "Approved")}
                            disabled={isUpdating || req.status === "Approved"}
                            className={`btn btn-sm lg:btn-xs btn-success text-white flex-1 sm:flex-none gap-1 font-bold ${req.status === "Approved" ? "opacity-30" : ""}`}
                          >
                            <Check size={14} className="lg:hidden mr-1" />
                            <Check size={12} className="hidden lg:block" />
                            <span className="lg:hidden">Approve</span>
                          </button>
                          <button
                            onClick={() => handleActionClick(req, "Rejected")}
                            disabled={isUpdating || req.status === "Rejected"}
                            className={`btn btn-sm lg:btn-xs btn-error text-white flex-1 sm:flex-none gap-1 font-bold ${req.status === "Rejected" ? "opacity-30" : ""}`}
                          >
                            <X size={14} className="lg:hidden mr-1" />
                            <X size={12} className="hidden lg:block" />
                            <span className="lg:hidden">Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="lg:hidden text-xs font-semibold opacity-40 uppercase">
                          Actions
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div className="flex justify-end gap-2 lg:gap-1 ml-auto shrink-0">
                        {isOwner && isPending && (
                          <button
                            onClick={() => handleEditClick(req)}
                            className="btn btn-outline btn-sm lg:btn-xs lg:btn-ghost lg:btn-square opacity-60 hover:opacity-100 gap-2 hover:bg-base-300"
                          >
                            <Pencil size={14} />
                            <span className="lg:hidden text-xs">Edit</span>
                          </button>
                        )}
                        {((isOwner && isPending) || canViewAll) && (
                          <button
                            onClick={() => handleDeleteClick(req)}
                            className="btn btn-outline btn-error btn-sm lg:btn-xs lg:btn-ghost lg:btn-square opacity-60 hover:opacity-100 hover:text-error gap-2 hover:bg-error/10"
                          >
                            <Trash2 size={14} />
                            <span className="lg:hidden text-xs">Delete</span>
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
