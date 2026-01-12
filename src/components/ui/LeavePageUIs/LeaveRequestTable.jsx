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
} from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

const LeaveRequestTable = ({ onEdit, onDelete, onAction }) => {
  const {
    leaves,
    fetchAllLeaves,
    setSelectedLeave, // Needed to pass data to modals
    isUpdating,
  } = useLeaveStore();

  const { authUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState("team");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchAllLeaves();
  }, [fetchAllLeaves]);

  // --- PERMISSIONS ---
  // Admin is Role 1 or 3 (Super Admin)
  const isAdmin = authUser?.role_id === 1 || authUser?.role_id === 3;

  // --- LOGIC: COUNT PENDING REQUESTS ---
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
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- FILTERS ---
  const filteredLeaves = leaves.filter((req) => {
    if (activeTab === "my" && req.user_id !== authUser?.id) return false;
    if (filterStatus !== "All" && req.status !== filterStatus) return false;
    return true;
  });

  // --- HANDLERS ---

  // 1. Action Handler (Approve/Reject)
  const handleActionClick = (req, status) => {
    // Prevent clicking if status is already set to that value
    if (req.status === status) return;

    // Trigger Parent Modal via Prop
    onAction({
      id: req.id,
      status: status,
      fullname: req.fullname,
    });
  };

  // 2. Delete Handler
  const handleDeleteClick = (req) => {
    // Permission Check
    if (!isAdmin && req.status !== "Pending") {
      toast.error("You can only delete Pending requests.");
      return;
    }

    // Trigger Parent Modal
    setSelectedLeave(req);
    onDelete();
  };

  // 3. Edit Handler
  const handleEditClick = (req) => {
    // Permission Check
    if (!isAdmin && req.status !== "Pending") {
      toast.error("You can only edit Pending requests.");
      return;
    }

    // Trigger Parent Modal
    setSelectedLeave(req);
    onEdit();
  };

  return (
    <div className="w-full bg-base-200 rounded-2xl shadow-xl overflow-hidden border border-base-300 flex flex-col">
      {/* --- TOP BAR --- */}
      <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-base-300/50">
        <div className="bg-base-100/50 p-1 rounded-lg flex items-center w-full md:w-auto">
          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "my"
                ? "bg-base-300 shadow-sm"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`flex-1 md:flex-none relative px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "team"
                ? "bg-primary text-primary-content shadow-sm"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Team Approvals
            {/* Red Ping Logic: Only show if there are pending requests */}
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-error text-[8px] text-white justify-center items-center">
                  !
                </span>
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative group">
            <select
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-sm pl-9 bg-base-100 border-base-300 w-full md:w-32"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />
          </div>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-base-200 text-xxs font-bold opacity-50 uppercase tracking-wider">
            <div className="col-span-4">Request Details</div>
            <div className="col-span-3">Duration</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Approval</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-base-300/30">
            {filteredLeaves.length === 0 ? (
              <div className="p-8 text-center text-sm opacity-50">
                No requests found.
              </div>
            ) : (
              filteredLeaves.map((req) => {
                // LOGIC: Show buttons if Pending OR if User is Admin (Allows Admins to fix mistakes)
                const showActions = req.status === "Pending" || isAdmin;

                return (
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
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {req.fullname}
                          </span>
                          <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                            {req.leave_type}
                          </span>
                        </div>
                        <span className="text-xs opacity-60 mt-0.5 truncate max-w-[150px]">
                          {req.reason}
                        </span>
                      </div>
                    </div>

                    {/* 2. Duration */}
                    <div className="col-span-3 flex items-center gap-2 opacity-80">
                      <Calendar size={16} className="opacity-40 shrink-0" />
                      <div className="flex flex-col text-xs">
                        <span className="font-medium">
                          {formatDate(req.start_date)}
                        </span>
                        <span className="opacity-50">
                          to {formatDate(req.end_date)}
                        </span>
                      </div>
                    </div>

                    {/* 3. Status Badge */}
                    <div className="col-span-2">
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
                    </div>

                    {/* 4. Approval Actions */}
                    <div className="col-span-2">
                      {showActions ? (
                        <div className="flex gap-2">
                          {/* Approve Button */}
                          <button
                            onClick={() => handleActionClick(req, "Approved")}
                            disabled={isUpdating}
                            // Dim if already Approved
                            className={`btn btn-xs btn-success text-white tooltip tooltip-left ${
                              req.status === "Approved" ? "opacity-30" : ""
                            }`}
                            data-tip="Approve Leave"
                          >
                            <Check size={12} />
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => handleActionClick(req, "Rejected")}
                            disabled={isUpdating}
                            // Dim if already Rejected
                            className={`btn btn-xs btn-error text-white tooltip tooltip-left  ${
                              req.status === "Rejected" ? "opacity-30" : ""
                            }`}
                            data-tip="Reject Leave"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs opacity-40">-</span>
                      )}
                    </div>

                    {/* 5. Edit/Delete Actions */}
                    <div className="col-span-1 flex justify-end gap-1">
                      {/* EDIT */}
                      <button
                        onClick={() => handleEditClick(req)}
                        data-tip="Edit Leave"
                        className={`btn btn-ghost btn-xs btn-square hover:bg-base-200 tooltip tooltip-left ${
                          !isAdmin && req.status !== "Pending"
                            ? "opacity-20 cursor-not-allowed"
                            : "opacity-40 hover:opacity-100 hover:text-primary"
                        }`}
                      >
                        <Pencil size={14} />
                      </button>

                      {/* DELETE */}
                      <button
                        data-tip="Delete Leave"
                        onClick={() => handleDeleteClick(req)}
                        className={`btn btn-ghost btn-xs btn-square hover:bg-base-200 tooltip tooltip-left ${
                          !isAdmin && req.status !== "Pending"
                            ? "opacity-20 cursor-not-allowed"
                            : "opacity-40 hover:opacity-100 hover:text-error"
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
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
