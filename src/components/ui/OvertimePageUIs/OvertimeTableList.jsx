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

// Import Shared Helpers
import {
  formatDate,
  formatTime,
  getTypeColor,
  getCurrentMonth,
} from "@/utils/formatUtils";

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
  onViewReason,
  canApprove = false,
  canCreate = false,
}) => {
  const { authUser } = useAuthStore();

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
  }, [canApprove, canCreate, setActiveTab]);

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
      {/* --- TOP BAR (Responsive Flex Wrap) --- */}
      <div className="p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-base-300/50 shrink-0">
        {/* TABS */}
        {canApprove ? (
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
                My Overtime
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
            My Overtime History
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
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setFilterDate(val);
                } else {
                  // Fallback to prevent an empty date entirely
                  setFilterDate(getCurrentMonth());
                }
              }}
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

      {/* --- RESPONSIVE TABLE/LIST WRAPPER --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-base-100/30 custom-scrollbar relative">
        <div className="w-full h-full flex flex-col">
          {/* DESKTOP HEADER (Hidden on mobile) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-base-200/90 backdrop-blur text-xxs font-bold opacity-50 uppercase tracking-wider border-b border-base-300/30 sticky top-0 z-10">
            <div className="col-span-4">Request Details</div>
            <div className="col-span-3">Type & Hours</div>
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

          {/* CONTENT */}
          {requests.length === 0 ? (
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
            <div className="flex flex-col divide-y divide-base-300/30">
              {requests.map((req) => {
                const isOwner = req.user_id === currentUserId;
                const isPending = req.status === "Pending";

                // Status Badge Component
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
                        onClick={() =>
                          onViewReason && onViewReason(req.rejection_reason)
                        }
                        className="text-base-content/40 hover:text-primary transition-colors ml-2 p-1"
                      >
                        <Info size={14} />
                      </button>
                    )}
                  </div>
                );

                return (
                  // ROW WRAPPER: Stack on Mobile, Grid on Desktop (lg breakpoint)
                  <div
                    key={req.id}
                    className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 p-4 lg:px-6 lg:py-4 lg:items-center hover:bg-base-100/50 transition-colors"
                  >
                    {/* 1. Request Details */}
                    <div className="lg:col-span-4 flex items-start justify-between min-w-0 w-full">
                      <div className="flex items-start gap-3 w-full">
                        {/* Avatar */}
                        <div className="h-10 w-10 lg:h-10 lg:w-10 rounded-full overflow-hidden shrink-0 shadow-sm border border-base-300">
                          <img
                            src={
                              req.profile_picture ||
                              "/images/default_profile.jpg"
                            }
                            alt={req.fullname}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Name & Reason */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-sm truncate">
                            {req.fullname}
                          </span>
                          <div className="flex items-center gap-1 text-xs opacity-70 mt-0.5">
                            <Calendar size={12} />
                            <span>{formatDate(req.ot_date)}</span>
                          </div>
                          <span className="text-xs opacity-60 mt-1 line-clamp-2 lg:truncate italic">
                            "{req.reason}"
                          </span>
                        </div>
                      </div>

                      {/* Mobile Status Badge (Hidden on Desktop) */}
                      <div className="lg:hidden shrink-0 ml-2">
                        {StatusBadge}
                      </div>
                    </div>

                    {/* 2. Type & Hours */}
                    <div className="lg:col-span-3 flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-start text-xs mt-2 lg:mt-0 lg:ml-0 bg-base-200/50 lg:bg-transparent p-2 lg:p-0 rounded-lg">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${getTypeColor(req.ot_type)}`}
                      >
                        {req.ot_type || "Regular Day"}
                      </span>

                      <div className="flex flex-col lg:flex-col items-end lg:items-start lg:mt-1">
                        <div className="flex items-center gap-1.5 font-medium text-base-content/80">
                          <Clock
                            size={14}
                            className="text-primary hidden lg:block"
                          />
                          {formatTime(req.start_time)} -{" "}
                          {formatTime(req.end_time)}
                        </div>
                        <span className="text-[11px] font-bold text-primary lg:opacity-50 mt-0.5">
                          {req.total_hours} hrs total
                        </span>
                      </div>
                    </div>

                    {/* 3. Status Badge (Desktop Only) */}
                    <div className="hidden lg:block lg:col-span-2">
                      {StatusBadge}
                    </div>

                    {/* 4 & 5. Approval & Actions Footer (UPDATED RESPONSIVE BLOCK) */}
                    <div
                      className={`flex flex-wrap sm:flex-nowrap items-center justify-between w-full mt-3 pt-3 border-t border-base-200 lg:mt-0 lg:pt-0 lg:border-none gap-3 lg:col-span-3 ${
                        !canApprove ? "lg:justify-end" : ""
                      }`}
                    >
                      {/* APPROVAL */}
                      {canApprove && activeTab === "team" ? (
                        <div className="flex gap-2 w-full sm:w-auto flex-1 order-last sm:order-none">
                          <button
                            onClick={() =>
                              onAction && onAction(req, "Approved")
                            }
                            className={`btn btn-sm lg:btn-xs btn-success text-white flex-1 sm:flex-none gap-1 font-bold ${
                              req.status === "Approved" ? "opacity-30" : ""
                            }`}
                            disabled={req.status === "Approved"}
                          >
                            <Check size={14} className="lg:hidden mr-1" />
                            <Check size={12} className="hidden lg:block" />
                            <span className="lg:hidden">Approve</span>
                          </button>
                          <button
                            onClick={() =>
                              onAction && onAction(req, "Rejected")
                            }
                            className={`btn btn-sm lg:btn-xs btn-error text-white flex-1 sm:flex-none gap-1 font-bold ${
                              req.status === "Rejected" ? "opacity-30" : ""
                            }`}
                            disabled={req.status === "Rejected"}
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
                            onClick={() => onEdit && onEdit(req)}
                            className="btn btn-outline btn-sm lg:btn-xs lg:btn-ghost lg:btn-square opacity-60 hover:opacity-100 gap-2 hover:bg-base-300"
                          >
                            <Pencil size={14} />
                            <span className="lg:hidden text-xs">Edit</span>
                          </button>
                        )}
                        {((isOwner && isPending) || canApprove) && (
                          <button
                            onClick={() => onDelete && onDelete(req)}
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OvertimeTableList;