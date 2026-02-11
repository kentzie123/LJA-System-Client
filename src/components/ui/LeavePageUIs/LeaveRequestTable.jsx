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
  Ban,
} from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

const LeaveRequestTable = ({
  onEdit,
  onDelete,
  onAction,
  onViewReason,
  canApprove = false,
  canViewAll = false,
  canCreate = false,
}) => {
  const { leaves, fetchAllLeaves, setSelectedLeave, isUpdating } = useLeaveStore();
  const { authUser } = useAuthStore();

  // --- 1. TAB STATE LOGIC ---
  const [activeTab, setActiveTab] = useState(() => {
    if (canViewAll) return "team";
    return "my";
  });

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // --- 2. PERMISSION ENFORCER ---
  useEffect(() => {
    if (canViewAll && !canCreate) {
      setActiveTab("team");
    } else if (!canViewAll) {
      setActiveTab("my");
    }
  }, [canViewAll, canCreate]);

  useEffect(() => {
    fetchAllLeaves();
  }, [fetchAllLeaves]);

  // --- HELPERS ---
  const pendingCount = leaves.filter((l) => l.status === "Pending").length;

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
    if (activeTab === "my") {
      if (!canCreate) return false;
      if (req.user_id !== authUser?.id) return false;
    } else if (!canViewAll) {
      if (req.user_id !== authUser?.id) return false;
    }

    if (filterStatus !== "All" && req.status !== filterStatus) return false;

    if (filterDate) {
      const reqDate = new Date(req.start_date);
      const reqMonthStr = `${reqDate.getFullYear()}-${String(reqDate.getMonth() + 1).padStart(2, "0")}`;
      if (reqMonthStr !== filterDate) return false;
    }
    return true;
  });

  // --- HANDLERS ---
  const handleActionClick = (req, status) => {
    if (req.status !== status)
      onAction({ id: req.id, status, fullname: req.fullname });
  };

  const handleDeleteClick = (req) => {
    // Admin Override
    if (canViewAll) {
      setSelectedLeave(req);
      onDelete();
      return;
    }
    // Standard User Checks
    if (req.user_id !== authUser?.id)
      return toast.error("You can only delete your own requests.");
    if (req.status !== "Pending")
      return toast.error("You can only delete Pending requests.");
    setSelectedLeave(req);
    onDelete();
  };

  const handleEditClick = (req) => {
    if (req.user_id !== authUser?.id)
      return toast.error("You can only edit your own requests.");
    if (req.status !== "Pending") return toast.error("Only pending requests.");
    setSelectedLeave(req);
    onEdit();
  };

  // --- 3. RESTRICTED ACCESS CHECK ---
  if (!canViewAll && !canCreate) {
    return (
      <div className="w-full h-64 bg-base-200 rounded-2xl shadow-xl border border-base-300 flex flex-col items-center justify-center text-base-content/50 gap-2">
        <Ban size={48} className="opacity-20" />
        <span className="font-semibold">Access Restricted</span>
        <span className="text-xs">
          You do not have permission to view or request leaves.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-base-200 rounded-2xl shadow-xl overflow-hidden border border-base-300 flex flex-col">
      {/* TOP BAR */}
      <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-base-300/50 shrink-0">
        {/* TABS */}
        {canViewAll ? (
          <div className="bg-base-300 p-1 rounded-lg flex items-center w-full md:w-auto">
            {canCreate && (
              <button
                onClick={() => setActiveTab("my")}
                className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
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
              // Added 'pr-8' to ensure text doesn't hit the badge
              className={`flex-1 md:flex-none relative px-6 pr-8 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                activeTab === "team"
                  ? "bg-base-100 shadow-sm text-base-content"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
              }`}
            >
              Team Approvals
              
              {/* --- BADGE POSITIONED HERE --- */}
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

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Status Select */}
          <div className="relative group w-full md:w-auto">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none z-10"
            />
            <select
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-sm pl-9 bg-base-100 border-base-300 w-full md:w-36 focus:outline-none focus:border-primary cursor-pointer rounded-lg"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Month Picker */}
          <div className="relative group bg-base-100 border border-base-300 rounded-lg px-3 py-1 flex items-center gap-2 hover:border-base-content/30 transition-colors h-8 w-full md:w-auto">
            <Calendar
              size={14}
              className="opacity-50 shrink-0 pointer-events-none"
            />
            <input
              type="month"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              onClick={(e) => {
                try {
                  e.target.showPicker();
                } catch (error) {}
              }}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-base-content/80 w-full md:w-auto accent-primary border-none p-0 h-full"
            />
            {filterDate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterDate("");
                }}
                className="btn btn-ghost btn-xs btn-circle h-5 w-5 min-h-0 opacity-50 hover:opacity-100 shrink-0"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-x-auto bg-base-100/30 relative">
        <div className="min-w-[900px] h-full flex flex-col">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-base-200/90 backdrop-blur text-xxs font-bold opacity-50 uppercase tracking-wider border-b border-base-300/30 sticky top-0 z-10">
            <div className={canApprove ? "col-span-4" : "col-span-5"}>
              Request Details
            </div>
            <div className="col-span-3">Duration</div>
            <div className={canApprove ? "col-span-2" : "col-span-3"}>
              Status
            </div>
            {canApprove && <div className="col-span-2">Approval</div>}
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-base-300/30">
            {filteredLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center p-8 opacity-60">
                <Clock
                  size={48}
                  className="mb-4 text-base-content/30"
                  strokeWidth={1.5}
                />
                <h3 className="text-base font-semibold">
                  No leave requests found.
                </h3>
                <p className="text-sm mt-1">
                  Records will appear here once submitted.
                </p>
                <button
                  onClick={() => {
                    setFilterDate("");
                    setFilterStatus("All");
                  }}
                  className="btn btn-link btn-sm mt-2 text-primary no-underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredLeaves.map((req) => {
                const isOwner = req.user_id === authUser?.id;
                const isPending = req.status === "Pending";
                return (
                  <div
                    key={req.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-base-100/50 transition-colors"
                  >
                    {/* DETAILS */}
                    <div
                      className={
                        canApprove
                          ? "col-span-4"
                          : "col-span-5 flex items-start gap-3"
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 shadow-sm border border-base-300">
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
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate max-w-[120px]">
                              {req.fullname}
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                              {req.leave_type}
                            </span>
                          </div>
                          <span
                            className="text-xs opacity-60 mt-0.5 truncate italic max-w-[200px]"
                            title={req.reason}
                          >
                            "{req.reason}"
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DURATION */}
                    <div className="col-span-3 flex items-center gap-2 opacity-80">
                      <Calendar size={16} className="opacity-40 shrink-0" />
                      <div className="flex flex-col text-xs">
                        <span className="font-medium tabular-nums">
                          {formatDate(req.start_date)}
                        </span>
                        <span className="opacity-50 tabular-nums">
                          to {formatDate(req.end_date)}
                        </span>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div
                      className={canApprove ? "col-span-2" : "col-span-3"}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium w-fit whitespace-nowrap ${
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
                        {req.status === "Rejected" &&
                          req.rejection_reason && (
                            <button
                              onClick={() =>
                                onViewReason(req.rejection_reason)
                              }
                              className="text-base-content/40 hover:text-primary transition-colors tooltip tooltip-right"
                              data-tip="View Reason"
                            >
                              <Info size={14} />
                            </button>
                          )}
                      </div>
                    </div>

                    {/* APPROVAL */}
                    {canApprove && (
                      <div className="col-span-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleActionClick(req, "Approved")
                            }
                            disabled={isUpdating}
                            className={`btn btn-xs btn-success text-white tooltip tooltip-left ${
                              req.status === "Approved" ? "opacity-30" : ""
                            }`}
                            data-tip="Approve"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() =>
                              handleActionClick(req, "Rejected")
                            }
                            disabled={isUpdating}
                            className={`btn btn-xs btn-error text-white tooltip tooltip-left ${
                              req.status === "Rejected" ? "opacity-30" : ""
                            }`}
                            data-tip="Reject"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="col-span-1 flex justify-end gap-1">
                      {isOwner && isPending && (
                        <button
                          onClick={() => onEdit && handleEditClick(req)}
                          className="btn btn-ghost btn-xs btn-square hover:bg-base-200"
                          title="Edit"
                        >
                          <Pencil
                            size={14}
                            className="opacity-40 hover:opacity-100"
                          />
                        </button>
                      )}

                      {/* Delete: Owner(Pending) OR Admin(Any) */}
                      {((isOwner && isPending) || canViewAll) && (
                        <button
                          onClick={() => onDelete && handleDeleteClick(req)}
                          className="btn btn-ghost btn-xs btn-square hover:bg-base-200"
                          title="Delete"
                        >
                          <Trash2
                            size={14}
                            className="opacity-40 hover:opacity-100 hover:text-error"
                          />
                        </button>
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