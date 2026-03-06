"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, Wallet, ArrowLeft } from "lucide-react"; 

// UI Components
import LeaveStatsGrid from "../ui/LeavePageUIs/LeaveStatsGrid";
import LeaveRequestTable from "../ui/LeavePageUIs/LeaveRequestTable"; 
import LeaveBalanceTable from "../ui/LeavePageUIs/LeaveBalanceTable"; 

// Modals
import NewLeaveModal from "../ui/LeavePageUIs/NewLeaveModal";
import EditLeaveModal from "../ui/LeavePageUIs/EditLeaveModal";
import DeleteLeaveModal from "../ui/LeavePageUIs/DeleteLeaveModal";
import ConfirmLeaveActionModal from "../ui/LeavePageUIs/ConfirmLeaveActionModal";
import AdminCreateLeaveModal from "../ui/LeavePageUIs/AdminCreateLeaveModal"; 
import LeaveRejectReasonModal from "../ui/LeavePageUIs/LeaveRejectReasonModal";
import ViewLeaveRejectReasonModal from "../ui/LeavePageUIs/ViewLeaveRejectReasonModal";

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
    fetchLeaveStats // <--- ADDED: Extracted fetchLeaveStats from the store
  } = useLeaveStore();

  const router = useRouter();

  // Permissions
  const canAccessPage = authUser?.role?.perm_leave_view === true;
  const canViewAll = authUser?.role?.perm_leave_view_all === true; 
  const canApprove = authUser?.role?.perm_leave_approve === true;
  const canCreate = authUser?.role?.perm_leave_create === true;
  const canManage = authUser?.role?.perm_leave_manage === true;

  // View State ("requests" or "balances")
  const [currentView, setCurrentView] = useState("requests");

  // --- NEW: FILTER STATES LIFTED UP FROM TABLE ---
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
  const [isViewReasonModalOpen, setIsViewReasonModalOpen] = useState(false); 

  // Action States
  const [actionData, setActionData] = useState(null); 
  const [viewReason, setViewReason] = useState(""); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Security & Initial Data (Balances)
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
  }, [authUser, router, canAccessPage, fetchLeaveBalances, fetchAllBalances, canViewAll]);

  // --- NEW: DYNAMIC FETCHING BASED ON FILTERS ---
  useEffect(() => {
    if (!authUser || !canAccessPage) return;

    let month = null;
    let year = null;

    // Parse the "YYYY-MM" string into separate month and year for the backend
    if (filterDate) {
      const [y, m] = filterDate.split("-");
      year = y;
      month = m;
    }

    const timer = setTimeout(() => {
      // 1. Fetch the table rows
      fetchAllLeaves({
        status: filterStatus,
        month: month,
        year: year,
      });
      
      // 2. Fetch the stats to update the grid and the pending badge!
      fetchLeaveStats({
        month: month,
        year: year,
      });
    }, 300); // 300ms debounce to prevent spamming the database

    return () => clearTimeout(timer);
  }, [filterStatus, filterDate, authUser, canAccessPage, fetchAllLeaves, fetchLeaveStats]);

  // Real-time Listeners
  useEffect(() => {
    if (socket?.connected) {
      subscribeToLeaveUpdates();
    }
    return () => {
      unsubscribeFromLeaveUpdates();
    };
  }, [socket, subscribeToLeaveUpdates, unsubscribeFromLeaveUpdates]);

  // Handlers
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

  const handleViewReason = (reason) => {
    setViewReason(reason);
    setIsViewReasonModalOpen(true);
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
    <div className="space-y-6 h-auto lg:h-[calc(100vh-100px)] flex flex-col">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Dynamic Titles based on View */}
          <div className="flex flex-col">
            {currentView === "balances" ? (
              <div className="flex flex-col items-start gap-3">
                <button 
                  onClick={() => setCurrentView("requests")}
                  className="btn btn-sm btn-outline border-base-300 hover:bg-base-200 gap-2 shadow-sm font-bold text-base-content/80"
                >
                  <ArrowLeft size={16} /> Back to Requests
                </button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-base-content leading-none">
                    Employee Balances
                  </h1>
                  <p className="text-sm opacity-60 mt-1">
                    Company-wide leave allocation and usage ledger.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-base-content leading-none">
                  Leave Management
                </h1>
                <p className="text-sm opacity-60 mt-1">
                  Track time off and manage employee requests.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-0">
            {canViewAll && currentView === "requests" && (
              <button 
                onClick={() => setCurrentView("balances")} 
                className="btn btn-sm bg-base-100 hover:bg-base-200 border-base-300 gap-2 flex-1 md:flex-none shadow-sm"
              >
                <Wallet size={16} className="text-primary" /> View Balances
              </button>
            )}
            {canManage && currentView === "requests" && (
              <button onClick={() => setIsAdminCreateModalOpen(true)} className="btn btn-sm btn-secondary gap-2 flex-1 md:flex-none shadow-sm">
                <UserPlus size={16} /> Assign Leave
              </button>
            )}
            {canCreate && currentView === "requests" && (
              <button onClick={() => setIsNewModalOpen(true)} className="btn btn-sm btn-primary gap-2 flex-1 md:flex-none shadow-sm">
                <Plus size={16} /> Request Leave
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid (Only show on Requests view) */}
        {currentView === "requests" && (
          <div className="pt-2">
            <LeaveStatsGrid leaves={leaves} isAdminView={canViewAll} />
          </div>
        )}
      </div>

      {/* DYNAMIC VIEWS */}
      <div className="flex-1 overflow-hidden min-h-[400px]">
        {currentView === "balances" ? (
          <LeaveBalanceTable balances={allBalances} isFetching={isFetchingBalances} />
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
            onViewReason={handleViewReason}
            canApprove={canApprove}
            canViewAll={canViewAll}
            canCreate={canCreate}
            authUser={authUser}
          />
        )}
      </div>

      {/* --- Modals --- */}
      <NewLeaveModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
      <AdminCreateLeaveModal isOpen={isAdminCreateModalOpen} onClose={() => setIsAdminCreateModalOpen(false)} />
      <EditLeaveModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <DeleteLeaveModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} leaveRequest={selectedLeave} isDeleting={isDeleting} />
      <ConfirmLeaveActionModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleApproveConfirm} actionData={actionData} isProcessing={isProcessingAction} />
      <LeaveRejectReasonModal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} onConfirm={handleRejectConfirm} isProcessing={isProcessingAction} />
      <ViewLeaveRejectReasonModal isOpen={isViewReasonModalOpen} onClose={() => setIsViewReasonModalOpen(false)} reason={viewReason} />
    </div>
  );
};

export default LeavePage;