"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

// Components
import TopBar from "../layout/TopBar";
import LeaveStatsGrid from "../ui/LeavePageUIs/LeaveStatsGrid";
import LeaveRequestList from "../ui/LeavePageUIs/LeaveRequestTable"; // Ensure filename matches (Table vs List)
import NewLeaveModal from "../ui/LeavePageUIs/NewLeaveModal";
import EditLeaveModal from "../ui/LeavePageUIs/EditLeaveModal";
import DeleteLeaveModal from "../ui/LeavePageUIs/DeleteLeaveModal";
import ConfirmLeaveActionModal from "../ui/LeavePageUIs/ConfirmLeaveActionModal";

// 1. IMPORT NEW MODALS
import LeaveRejectReasonModal from "../ui/LeavePageUIs/LeaveRejectReasonModal";
import ViewLeaveRejectReasonModal from "../ui/LeavePageUIs/ViewLeaveRejectReasonModal";

const LeavePage = () => {
  const { authUser } = useAuthStore();
  const {
    fetchAllLeaves,
    fetchLeaveBalances, // Don't forget to fetch balances!
    leaves,
    isFetching,
    deleteLeaveRequest,
    updateLeaveStatus,
    selectedLeave,
  } = useLeaveStore();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("team");

  // --- MODAL STATES ---
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Action Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // For Approve
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // For Reject Input
  const [isViewReasonModalOpen, setIsViewReasonModalOpen] = useState(false); // For Viewing Reason

  // Data States
  const [actionData, setActionData] = useState(null); // { id, status, fullname }
  const [viewReason, setViewReason] = useState(""); // Text to view in ViewModal

  // Loading States
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    } else {
      fetchAllLeaves();
      fetchLeaveBalances(); // Ensure balances are loaded
    }
  }, [authUser, router, fetchAllLeaves, fetchLeaveBalances]);

  const filteredLeaves = leaves.filter((leave) => {
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

  // 1. Handle Action Trigger (from Table)
  const handleActionTrigger = (data) => {
    setActionData(data);

    // If Status is Rejected -> Open Input Modal
    if (data.status === "Rejected") {
      setIsRejectModalOpen(true);
    }
    // If Status is Approved -> Open Simple Confirm Modal
    else {
      setIsConfirmModalOpen(true);
    }
  };

  // 2. Handle View Reason Trigger
  const handleViewReason = (reason) => {
    setViewReason(reason);
    setIsViewReasonModalOpen(true);
  };

  // 3. Confirm Approval
  const handleApproveConfirm = async () => {
    if (!actionData) return;
    setIsProcessingAction(true);
    await updateLeaveStatus(actionData.id, "Approved"); // No reason needed
    setIsProcessingAction(false);
    setIsConfirmModalOpen(false);
  };

  // 4. Confirm Rejection (With Reason)
  const handleRejectConfirm = async (reason) => {
    if (!actionData) return;
    setIsProcessingAction(true);
    // Pass reason to store/backend
    await updateLeaveStatus(actionData.id, "Rejected", reason);
    setIsProcessingAction(false);
    setIsRejectModalOpen(false);
  };

  if (!authUser) return null;
  return (
    <div className="space-y-6">
      <TopBar />

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

      <LeaveStatsGrid leaves={leaves} />

      {/* List / Table */}
      <LeaveRequestList
        leaves={filteredLeaves}
        isFetching={isFetching}
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={() => setIsDeleteModalOpen(true)}
        onAction={handleActionTrigger} // Pass action trigger
        onViewReason={handleViewReason} // Pass view trigger
      />

      {/* --- CRUD MODALS --- */}
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

      {/* --- ACTION MODALS --- */}

      {/* 1. Approve Confirmation */}
      <ConfirmLeaveActionModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleApproveConfirm}
        actionData={actionData}
        isProcessing={isProcessingAction}
      />

      {/* 2. Reject Reason Input */}
      <LeaveRejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        isProcessing={isProcessingAction}
      />

      {/* 3. View Reason */}
      <ViewLeaveRejectReasonModal
        isOpen={isViewReasonModalOpen}
        onClose={() => setIsViewReasonModalOpen(false)}
        reason={viewReason}
      />
    </div>
  );
};

export default LeavePage;
