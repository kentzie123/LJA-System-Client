import React, { useState } from "react";
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
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

// Import Shared Helpers
import {
  formatDate,
  formatTime,
  getAvatarColor,
  getTypeColor,
  getCurrentMonth,
} from "@/utils/formatUtils";

const OvertimeTableList = ({
  requests = [],
  onEdit,
  onDelete,
  onAction,
  onViewReason,
}) => {
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("my");
  const [filterStatus, setFilterStatus] = useState("All");

  // Use utility for default date (YYYY-MM)
  const [filterDate, setFilterDate] = useState(getCurrentMonth());

  // --- PERMISSIONS ---
  const currentUserId = authUser?.id;
  const isAdmin = authUser?.role_id === 1 || authUser?.role_id === 3;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  // --- FILTERING LOGIC ---
  const filteredRequests = requests.filter((req) => {
    // 1. Tab Filter
    if (activeTab === "my" && req.user_id !== currentUserId) return false;

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

  return (
    <div className="w-full bg-base-200 rounded-2xl shadow-xl overflow-hidden border border-base-300 flex flex-col">
      {/* --- TOP BAR --- */}
      <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-base-300/50 shrink-0">
        {/* TABS */}
        <div className="bg-base-100/50 p-1 rounded-lg flex items-center w-full md:w-auto">
          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "my"
                ? "bg-base-300 shadow-sm text-base-content"
                : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
            }`}
          >
            My Claims
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`flex-1 md:flex-none relative px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "team"
                ? "bg-base-300 shadow-sm text-base-content"
                : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
            }`}
          >
            Team Approvals
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white shadow-sm">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Status Select */}
          <div className="relative group w-1/2 md:w-auto">
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
          <div className="relative group bg-base-100 border border-base-300 rounded-lg px-3 py-1 flex items-center gap-2 hover:border-base-content/30 transition-colors h-8 w-1/2 md:w-auto">
            <Calendar size={14} className="opacity-50" />
            <input
              type="month"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-base-content/80 w-full md:w-auto accent-primary border-none p-0 h-full"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="btn btn-ghost btn-xs btn-circle h-5 w-5 min-h-0 opacity-50 hover:opacity-100"
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
          {/* HEADER (Sticky) */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-base-200/90 backdrop-blur text-xxs font-bold opacity-50 uppercase tracking-wider border-b border-base-300/30 sticky top-0 z-10">
            <div className="col-span-4">Request Details</div>
            <div className="col-span-3">Type & Hours</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Approval</div>
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
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-base-100/50 transition-colors"
                >
                  {/* 1. Request Details */}
                  <div className="col-span-4 flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0 ${getAvatarColor(
                        req.fullname
                      )}`}
                    >
                      {req.initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">
                        {req.fullname}
                      </span>
                      <div className="flex items-center gap-1 text-xs opacity-70 mt-0.5">
                        <Calendar size={12} />
                        <span>{formatDate(req.ot_date)}</span>
                      </div>

                      {/* --- ADDED REASON HERE --- */}
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
                      {formatTime(req.start_time)} - {formatTime(req.end_time)}
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

                  {/* 4. Approval Buttons */}
                  <div className="col-span-2">
                    {req.status === "Pending" || isAdmin ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAction && onAction(req, "Approved")}
                          className={`btn btn-xs btn-success text-white ${
                            req.status === "Approved" &&
                            "opacity-30 pointer-events-none"
                          }`}
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => onAction && onAction(req, "Rejected")}
                          className={`btn btn-xs btn-error text-white ${
                            req.status === "Rejected" &&
                            "opacity-30 pointer-events-none"
                          }`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs opacity-40">-</span>
                    )}
                  </div>

                  {/* 5. Actions (Edit/Delete) */}
                  <div className="col-span-1 flex justify-end gap-1">
                    {(req.status === "Pending" || isAdmin) && (
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
                    {(req.status === "Pending" || isAdmin) && (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OvertimeTableList;
