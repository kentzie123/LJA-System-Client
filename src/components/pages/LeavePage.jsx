"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useRouter } from "next/navigation";
import { Plus, UserPlus } from "lucide-react"; // Added UserPlus icon

// Components
import LeaveStatsGrid from "../ui/LeavePageUIs/LeaveStatsGrid";
import LeaveRequestList from "../ui/LeavePageUIs/LeaveRequestTable"; 
import NewLeaveModal from "../ui/LeavePageUIs/NewLeaveModal";
import EditLeaveModal from "../ui/LeavePageUIs/EditLeaveModal";
import DeleteLeaveModal from "../ui/LeavePageUIs/DeleteLeaveModal";
import ConfirmLeaveActionModal from "../ui/LeavePageUIs/ConfirmLeaveActionModal";
import AdminCreateLeaveModal from "../ui/LeavePageUIs/AdminCreateLeaveModal"; // NEW IMPORT

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
  const canAccessPage = authUser?.role?.perm_leave_view === true;
  const canViewAll = authUser?.role?.perm_leave_view_all === true; 
  const canApprove = authUser?.role?.perm_leave_approve === true;
  
  // NEW PERMISSIONS
  const canCreate = authUser?.role?.perm_leave_create === true;
  const canManage = authUser?.role?.perm_leave_manage === true;

  // TAB STATE
  const [activeTab, setActiveTab] = useState(canViewAll ? "team" : "my");

  // Force reset tab if permission changes
  useEffect(() => {
    if (!canViewAll) setActiveTab("my");
  }, [canViewAll]);

  // --- MODAL STATES ---
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAdminCreateModalOpen, setIsAdminCreateModalOpen] = useState(false); // NEW STATE
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

    if (!canAccessPage) {
      router.push("/not-found");
      return;
    }

    fetchAllLeaves();
    fetchLeaveBalances(); 
  }, [authUser, router, canAccessPage, fetchAllLeaves, fetchLeaveBalances]);

  // --- FILTER LOGIC ---
  const filteredLeaves = leaves.filter((leave) => {
    if (!canViewAll) return leave.user_id === authUser?.id;
    if (activeTab === "my") return leave.user_id === authUser?.id;
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
        
        <div className="flex gap-2">
          {/* 1. ADMIN CREATE BUTTON (Only if canManage) */}
          {canManage && (
            <button
              onClick={() => setIsAdminCreateModalOpen(true)}
              className="btn btn-secondary gap-2"
            >
              <UserPlus className="size-4" /> Assign Leave (Admin)
            </button>
          )}

          {/* 2. STANDARD REQUEST BUTTON (Only if canCreate) */}
          {canCreate && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="btn btn-primary gap-2"
            >
              <Plus className="size-4" /> Request Leave
            </button>
          )}
        </div>
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
      
      {/* Standard Modal */}
      <NewLeaveModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {/* Admin Modal (New) */}
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