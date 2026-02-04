"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

// Components
import LeaveStatsGrid from "../ui/LeavePageUIs/LeaveStatsGrid";
import LeaveRequestList from "../ui/LeavePageUIs/LeaveRequestTable"; 
import NewLeaveModal from "../ui/LeavePageUIs/NewLeaveModal";
import EditLeaveModal from "../ui/LeavePageUIs/EditLeaveModal";
import DeleteLeaveModal from "../ui/LeavePageUIs/DeleteLeaveModal";
import ConfirmLeaveActionModal from "../ui/LeavePageUIs/ConfirmLeaveActionModal";

// Modals
import LeaveRejectReasonModal from "../ui/LeavePageUIs/LeaveRejectReasonModal";
import ViewLeaveRejectReasonModal from "../ui/LeavePageUIs/ViewLeaveRejectReasonModal";

const LeavePage = () => {
  const { authUser } = useAuthStore();
  const {
    fetchAllLeaves,
    fetchLeaveBalances, 
    leaves,
    isFetching,
    deleteLeaveRequest,
    updateLeaveStatus,
    selectedLeave,
  } = useLeaveStore();

  const router = useRouter();

  // --- PERMISSIONS ---
  // 1. Can they see the page at all? (NEW)
  const canAccessPage = authUser?.role?.perm_leave_view === true;

  // 2. Can they see everyone?
  const canViewAll = authUser?.role?.perm_leave_view_all === true; 
  
  // 3. Can they approve?
  const canApprove = authUser?.role?.perm_leave_approve === true;

  // TAB STATE: Managed here so we can filter the data before sending it to the table
  const [activeTab, setActiveTab] = useState(canViewAll ? "team" : "my");

  // Force reset tab if permission changes
  useEffect(() => {
    if (!canViewAll) setActiveTab("my");
  }, [canViewAll]);

  // --- MODAL STATES ---
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); 
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); 
  const [isViewReasonModalOpen, setIsViewReasonModalOpen] = useState(false); 

  // Data States
  const [actionData, setActionData] = useState(null); 
  const [viewReason, setViewReason] = useState(""); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // --- FETCH & SECURITY CHECK ---
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }

    // SECURITY: If they don't have basic view permission, kick them out
    if (!canAccessPage) {
      router.push("/not-found");
      return;
    }

    // Only fetch if allowed
    fetchAllLeaves();
    fetchLeaveBalances(); 
  }, [authUser, router, canAccessPage, fetchAllLeaves, fetchLeaveBalances]);

  // --- FILTER LOGIC ---
  const filteredLeaves = leaves.filter((leave) => {
    // 1. If user CANNOT view all, strict filter to own ID
    if (!canViewAll) return leave.user_id === authUser?.id;

    // 2. If user CAN view all, filter based on active Tab
    if (activeTab === "my") return leave.user_id === authUser?.id;
    
    // "team" shows everything
    return true; 
  });

  // --- HANDLERS ---
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

  // Prevent flash: Return null if not logged in OR no permission
  if (!authUser || !canAccessPage) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-sm opacity-60">
            Track and manage employee time off requests.
          </p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="size-4" /> New Leave Request
        </button>
      </div>

      {/* --- STATS GRID --- */}
      <LeaveStatsGrid leaves={leaves} isAdminView={canViewAll} />

      {/* List / Table */}
      <LeaveRequestList
        leaves={filteredLeaves}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        
        isFetching={isFetching}
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={() => setIsDeleteModalOpen(true)}
        onAction={handleActionTrigger}
        onViewReason={handleViewReason}
        
        // Permissions
        canApprove={canApprove}
        canViewAll={canViewAll}
        authUser={authUser}
      />

      {/* --- MODALS --- */}
      <NewLeaveModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
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
        isOpen={isViewReasonModalOpen}
        onClose={() => setIsViewReasonModalOpen(false)}
        reason={viewReason}
      />
    </div>
  );
};

export default LeavePage;