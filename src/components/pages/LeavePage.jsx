"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLeaveStore } from "@/stores/useLeaveStore";
// 1. IMPORT NEXT.JS NAVIGATION HOOKS
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  UserPlus,
  Wallet,
  ArrowLeft,
  Calendar,
  List,
} from "lucide-react";

// UI Components
import LeaveStatsGrid from "../ui/LeavePageUIs/LeaveStatsGrid";
import LeaveRequestTable from "../ui/LeavePageUIs/LeaveRequestTable";
import LeaveBalanceTable from "../ui/LeavePageUIs/LeaveBalanceTable";
import LeaveCalendarView from "../ui/LeavePageUIs/LeaveCalendarView";

// Modals
import NewLeaveModal from "../ui/LeavePageUIs/NewLeaveModal";
import EditLeaveModal from "../ui/LeavePageUIs/EditLeaveModal";
import DeleteLeaveModal from "../ui/LeavePageUIs/DeleteLeaveModal";
import ConfirmLeaveActionModal from "../ui/LeavePageUIs/ConfirmLeaveActionModal";
import AdminCreateLeaveModal from "../ui/LeavePageUIs/AdminCreateLeaveModal";
import LeaveRejectReasonModal from "../ui/LeavePageUIs/LeaveRejectReasonModal";
import ViewLeaveRejectReasonModal from "../ui/LeavePageUIs/ViewLeaveRejectReasonModal";
import ViewLeaveReasonModal from "../ui/LeavePageUIs/ViewLeaveReasonModal"; // <-- IMPORT NEW MODAL

const LeavePage = () => {
  const { authUser, socket } = useAuthStore();
  const {
    fetchAllLeaves,
    fetchLeaveBalances,
    fetchAllBalances,
    allBalances,
    isFetchingBalances,
    leaves,
    isFetching,
    deleteLeaveRequest,
    updateLeaveStatus,
    selectedLeave,
    subscribeToLeaveUpdates,
    unsubscribeFromLeaveUpdates,
    fetchLeaveStats,
  } = useLeaveStore();

  // 2. SETUP NAVIGATION HOOKS
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Permissions
  const canAccessPage = authUser?.role?.perm_leave_view === true;
  const canViewAll = authUser?.role?.perm_leave_view_all === true;
  const canApprove = authUser?.role?.perm_leave_approve === true;
  const canCreate = authUser?.role?.perm_leave_create === true;
  const canManage = authUser?.role?.perm_leave_manage === true;

  // View States
  const [currentView, setCurrentView] = useState("requests");

  // 3. READ LAYOUT FROM URL (Default to 'list' if not present)
  const layoutView = searchParams.get("layout") || "list";

  // Filter States
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAdminCreateModalOpen, setIsAdminCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  
  // --- SPLIT REASON STATES ---
  const [isViewRejectReasonModalOpen, setIsViewRejectReasonModalOpen] = useState(false);
  const [rejectReasonText, setRejectReasonText] = useState("");

  const [isViewLeaveReasonModalOpen, setIsViewLeaveReasonModalOpen] = useState(false);
  const [leaveReasonText, setLeaveReasonText] = useState("");

  // Action States
  const [actionData, setActionData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Security & Initial Data
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }
    if (!canAccessPage) {
      router.push("/not-found");
      return;
    }

    fetchLeaveBalances();
    if (canViewAll) {
      fetchAllBalances();
    }
  }, [
    authUser,
    router,
    canAccessPage,
    fetchLeaveBalances,
    fetchAllBalances,
    canViewAll,
  ]);

  // Dynamic Fetching
  useEffect(() => {
    if (!authUser || !canAccessPage) return;

    let month = null;
    let year = null;

    if (filterDate) {
      const [y, m] = filterDate.split("-");
      year = y;
      month = m;
    }

    const timer = setTimeout(() => {
      fetchAllLeaves({ status: filterStatus, month: month, year: year });
      fetchLeaveStats({ month: month, year: year });
    }, 300);

    return () => clearTimeout(timer);
  }, [
    filterStatus,
    filterDate,
    authUser,
    canAccessPage,
    fetchAllLeaves,
    fetchLeaveStats,
  ]);

  // Real-time Listeners
  useEffect(() => {
    if (socket?.connected) {
      subscribeToLeaveUpdates();
    }
    return () => {
      unsubscribeFromLeaveUpdates();
    }
  }, [socket, subscribeToLeaveUpdates, unsubscribeFromLeaveUpdates]);

  // --- Handlers ---

  // 4. HANDLER TO UPDATE URL
  const handleLayoutChange = (newLayout) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", newLayout);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLeave) return;
    setIsDeleting(true);
    await deleteLeaveRequest(selectedLeave.id);
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
  };

  const handleActionTrigger = (data) => {
    setActionData(data);
    if (data.status === "Rejected") {
      setIsRejectModalOpen(true);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  // --- REASON HANDLERS ---
  const handleViewRejectReason = (reason) => {
    setRejectReasonText(reason);
    setIsViewRejectReasonModalOpen(true);
  };

  const handleViewLeaveReason = (reason) => {
    setLeaveReasonText(reason);
    setIsViewLeaveReasonModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!actionData) return;
    setIsProcessingAction(true);
    await updateLeaveStatus(actionData.id, "Approved");
    setIsProcessingAction(false);
    setIsConfirmModalOpen(false);
  };

  const handleRejectConfirm = async (reason) => {
    if (!actionData) return;
    setIsProcessingAction(true);
    await updateLeaveStatus(actionData.id, "Rejected", reason);
    setIsProcessingAction(false);
    setIsRejectModalOpen(false);
  };

  if (!authUser || !canAccessPage) return null;

  return (
    <div className="space-y-4 h-auto lg:h-[calc(100vh-100px)] flex flex-col antialiased-text">
      
      {/* --- HIGH-DENSITY HEADER & TOOLBAR --- */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-base-300 pb-4 shrink-0">
        
        {/* LEFT SIDE: Titles & Navigation */}
        <div className="flex flex-col">
          {currentView === "balances" ? (
            <div className="flex flex-col items-start gap-2">
              <button
                onClick={() => setCurrentView("requests")}
                className="btn btn-xs h-7 min-h-0 btn-ghost text-base-content/60 hover:bg-base-200 hover:text-base-content gap-1.5 px-2 -ml-2 transition-colors"
              >
                <ArrowLeft size={12} /> <span className="text-[10px] font-bold uppercase tracking-widest">Back to Requests</span>
              </button>
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content leading-none mb-1">
                  Employee Balances
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
                  Company-wide leave allocation ledger
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content leading-none mb-1">
                Leave Management
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
                Track time off & manage requests
              </p>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Actions & Layout Toggle */}
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 w-full xl:w-auto">
          
          {/* TOGGLE (Calendar / List) */}
          {currentView === "requests" && (
            <div className="flex items-center p-1 bg-base-200 rounded-lg border border-base-300 w-full sm:w-fit shrink-0">
              <button
                onClick={() => handleLayoutChange("calendar")}
                className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                  layoutView === "calendar"
                    ? "bg-base-100 text-primary shadow-sm"
                    : "text-base-content/50 hover:text-base-content"
                }`}
              >
                <Calendar size={12} /> Calendar
              </button>
              <button
                onClick={() => handleLayoutChange("list")}
                className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                  layoutView === "list"
                    ? "bg-base-100 text-primary shadow-sm"
                    : "text-base-content/50 hover:text-base-content"
                }`}
              >
                <List size={12} /> List
              </button>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-1 sm:flex-none">
            {canViewAll && currentView === "requests" && (
              <button
                onClick={() => setCurrentView("balances")}
                className="btn btn-sm h-8 min-h-0 bg-base-100 hover:bg-base-200 border-base-300 text-[10px] font-bold uppercase tracking-widest gap-1.5 flex-1 sm:flex-none shadow-sm px-3"
              >
                <Wallet size={12} className="text-primary" /> Balances
              </button>
            )}
            
            {canManage && currentView === "requests" && (
              <button
                onClick={() => setIsAdminCreateModalOpen(true)}
                className="btn btn-sm h-8 min-h-0 btn-secondary text-secondary-content text-[10px] font-bold uppercase tracking-widest gap-1.5 flex-1 sm:flex-none shadow-sm px-3"
              >
                <UserPlus size={12} /> Assign Leave
              </button>
            )}
            
            {canCreate && currentView === "requests" && (
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="btn btn-sm h-8 min-h-0 btn-primary text-primary-content text-[10px] font-bold uppercase tracking-widest gap-1.5 flex-1 sm:flex-none shadow-sm px-3"
              >
                <Plus size={12} /> Request Leave
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      {currentView === "requests" && (
        <div className="shrink-0">
          <LeaveStatsGrid leaves={leaves} isAdminView={canViewAll} />
        </div>
      )}

      {/* --- DYNAMIC VIEWS --- */}
      <div className="flex-1 overflow-hidden min-h-[400px]">
        {currentView === "balances" ? (
          <LeaveBalanceTable
            balances={allBalances}
            isFetching={isFetchingBalances}
          />
        ) : /* 5. CONDITIONAL RENDER BASED ON URL LAYOUT */
        layoutView === "calendar" ? (
          <LeaveCalendarView
            leaves={leaves}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
          />
        ) : (
          <LeaveRequestTable
            leaves={leaves}
            isFetching={isFetching}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={() => setIsDeleteModalOpen(true)}
            onAction={handleActionTrigger}
            
            // Pass both reason handlers properly
            onViewRejectReason={handleViewRejectReason}
            onViewLeaveReason={handleViewLeaveReason}
            
            canApprove={canApprove}
            canViewAll={canViewAll}
            canCreate={canCreate}
            authUser={authUser}
          />
        )}
      </div>

      {/* --- Modals --- */}
      <NewLeaveModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
      <AdminCreateLeaveModal
        isOpen={isAdminCreateModalOpen}
        onClose={() => setIsAdminCreateModalOpen(false)}
      />
      <EditLeaveModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      <DeleteLeaveModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        leaveRequest={selectedLeave}
        isDeleting={isDeleting}
        userRole={authUser.role_id}
      />
      <ConfirmLeaveActionModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleApproveConfirm}
        actionData={actionData}
        isProcessing={isProcessingAction}
      />
      <LeaveRejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        isProcessing={isProcessingAction}
      />
      <ViewLeaveRejectReasonModal
        isOpen={isViewRejectReasonModalOpen}
        onClose={() => setIsViewRejectReasonModalOpen(false)}
        reason={rejectReasonText}
      />
      <ViewLeaveReasonModal
        isOpen={isViewLeaveReasonModalOpen}
        onClose={() => setIsViewLeaveReasonModalOpen(false)}
        reason={leaveReasonText}
      />
    </div>
  );
};

export default LeavePage;