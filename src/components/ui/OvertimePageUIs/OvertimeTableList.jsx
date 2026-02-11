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
  Briefcase,
  Ban,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

// Import Shared Helpers
import {
  formatDate,
  formatTime,
  getTypeColor,
  getCurrentMonth,
} from "@/utils/formatUtils";

const OvertimeTableList = ({
  requests = [],
  onEdit,
  onDelete,
  onAction,
  onViewReason,
  canApprove = false,
  canCreate = false,
}) => {
  const { authUser } = useAuthStore();

  // Tab Logic:
  const [activeTab, setActiveTab] = useState(() => {
    if (canApprove) return "team";
    return "my";
  });

  const [filterStatus, setFilterStatus] = useState("All");

  // Use utility for default date (YYYY-MM)
  const [filterDate, setFilterDate] = useState(getCurrentMonth());

  // --- PERMISSIONS ---
  const currentUserId = authUser?.id;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  // --- EFFECT: Permission Enforcer ---
  useEffect(() => {
    if (!canApprove) {
      setActiveTab("my");
    } else if (canApprove && !canCreate) {
      setActiveTab("team");
    }
  }, [canApprove, canCreate]);

  // --- FILTERING LOGIC ---
  const filteredRequests = requests.filter((req) => {
    // 1. Tab Filter
    if (activeTab === "my") {
      if (!canCreate) return false;
      if (req.user_id !== currentUserId) return false;
    }
    // 2. Status Filter
    if (filterStatus !== "All" && req.status !== filterStatus) return false;

    // 3. Month Filter
    if (filterDate) {
      const reqDate = new Date(req.ot_date);
      const reqMonthStr = `${reqDate.getFullYear()}-${String(
        reqDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (reqMonthStr !== filterDate) return false;
    }
    return true;
  });

  // --- RENDER: RESTRICTED ACCESS ---
  if (!canApprove && !canCreate) {
    return (
      <div className="w-full h-64 bg-base-200 rounded-2xl shadow-xl border border-base-300 flex flex-col items-center justify-center text-base-content/50 gap-2">
        <Ban size={48} className="opacity-20" />
        <span className="font-semibold">Access Restricted</span>
        <span className="text-xs">
          You do not have permission to view or request overtime.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-base-200 rounded-2xl shadow-xl overflow-hidden border border-base-300 flex flex-col">
      {/* --- TOP BAR --- */}
      <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-base-300/50 shrink-0">
        {/* TABS */}
        {canApprove ? (
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
                My Overtime
              </button>
            )}

            <button
              onClick={() => setActiveTab("team")}
              // Added 'pr-8' to prevent text overlap with the badge
              className={`flex-1 md:flex-none relative px-6 pr-8 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                activeTab === "team"
                  ? "bg-base-100 shadow-sm text-base-content"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
              }`}
            >
              Team Approvals
              
              {/* --- UPDATED BADGE WITH ANIMATION --- */}
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
            My Overtime History
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
              // Fix: Open picker anywhere on click
              onClick={(e) => {
                try {
                  e.target.showPicker();
                } catch (error) {
                  // Fallback for older browsers that don't support showPicker
                }
              }}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-base-content/80 w-full md:w-auto accent-primary border-none p-0 h-full"
            />
            {filterDate && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent reopening picker when clearing
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

      {/* --- RESPONSIVE TABLE WRAPPER --- */}
      <div className="flex-1 overflow-x-auto bg-base-100/30 relative">
        <div className="min-w-[1000px] h-full flex flex-col">
          {/* HEADER */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-base-200/90 backdrop-blur text-xxs font-bold opacity-50 uppercase tracking-wider border-b border-base-300/30 sticky top-0 z-10">
            <div className="col-span-4">Request Details</div>
            <div className="col-span-3">Type & Hours</div>
            <div className="col-span-2">Status</div>
            {canApprove ? (
              <div className="col-span-2">Approval</div>
            ) : (
              <div className="col-span-2"></div>
            )}
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* CONTENT */}
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-8 opacity-60">
              <Briefcase
                size={48}
                className="mb-4 text-base-content/30"
                strokeWidth={1.5}
              />
              <h3 className="text-base font-semibold">
                No overtime claims found.
              </h3>
              <p className="text-sm mt-1">
                Records will appear here once submitted or shared.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-base-300/30">
              {filteredRequests.map((req) => {
                const isOwner = req.user_id === currentUserId;
                const isPending = req.status === "Pending";

                return (
                  <div
                    key={req.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-base-100/50 transition-colors"
                  >
                    {/* 1. Request Details */}
                    <div className="col-span-4 flex items-start gap-3">
                      {/* --- PROFILE PICTURE --- */}
                      <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 shadow-sm border border-base-300">
                        <img
                          src={
                            req.profile_picture || "/images/default_profile.jpg"
                          }
                          alt={req.fullname}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate">
                          {req.fullname}
                        </span>
                        <div className="flex items-center gap-1 text-xs opacity-70 mt-0.5">
                          <Calendar size={12} />
                          <span>{formatDate(req.ot_date)}</span>
                        </div>

                        <span className="text-xs opacity-50 mt-1 truncate max-w-[200px] italic">
                          "{req.reason}"
                        </span>
                      </div>
                    </div>

                    {/* 2. Type & Hours */}
                    <div className="col-span-3 flex flex-col justify-center text-xs">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide w-fit px-1.5 py-0.5 rounded mb-1 ${getTypeColor(
                          req.ot_type
                        )}`}
                      >
                        {req.ot_type || "Regular Day"}
                      </span>

                      <div className="flex items-center gap-1.5 font-medium text-base-content/80">
                        <Clock size={14} className="text-primary" />
                        {formatTime(req.start_time)} -{" "}
                        {formatTime(req.end_time)}
                      </div>
                      <span className="text-[11px] font-bold opacity-50 mt-1">
                        {req.total_hours} hrs total
                      </span>
                    </div>

                    {/* 3. Status Badge */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium w-fit
                          ${
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
                            onClick={() =>
                              onViewReason && onViewReason(req.rejection_reason)
                            }
                            className="text-base-content/40 hover:text-primary transition-colors tooltip tooltip-right"
                            data-tip="View Reason"
                          >
                            <Info size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 4. Approval Buttons (CONDITIONAL) */}
                    <div className="col-span-2">
                      {canApprove ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              onAction && onAction(req, "Approved")
                            }
                            className={`btn btn-xs btn-success text-white ${
                              req.status === "Approved" &&
                              "opacity-30 pointer-events-none"
                            }`}
                            disabled={req.status === "Approved"}
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() =>
                              onAction && onAction(req, "Rejected")
                            }
                            className={`btn btn-xs btn-error text-white ${
                              req.status === "Rejected" &&
                              "opacity-30 pointer-events-none"
                            }`}
                            disabled={req.status === "Rejected"}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs opacity-0">-</span>
                      )}
                    </div>

                    {/* 5. Actions (Edit/Delete) */}
                    <div className="col-span-1 flex justify-end gap-1">
                      {isOwner && isPending && (
                        <button
                          onClick={() => onEdit && onEdit(req)}
                          className="btn btn-ghost btn-xs btn-square hover:bg-base-200"
                          title="Edit"
                        >
                          <Pencil
                            size={14}
                            className="opacity-40 hover:opacity-100"
                          />
                        </button>
                      )}

                      {/* DELETE: Owner (Pending) OR Approver (Anytime) */}
                      {((isOwner && isPending) || canApprove) && (
                        <button
                          onClick={() => onDelete && onDelete(req)}
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OvertimeTableList;