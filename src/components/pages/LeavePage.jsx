"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

// Components
import TopBar from "../layout/TopBar";
import LeaveStatsGrid from "../ui/LeavePageUIs/LeaveStatsGrid";
import LeaveRequestList from "../ui/LeavePageUIs/LeaveRequestTable";
import NewLeaveModal from "../ui/LeavePageUIs/NewLeaveModal";
import EditLeaveModal from "../ui/LeavePageUIs/EditLeaveModal";
import DeleteLeaveModal from "../ui/LeavePageUIs/DeleteLeaveModal";
import ConfirmLeaveActionModal from "../ui/LeavePageUIs/ConfirmLeaveActionModal"; // 1. Updated Import

const LeavePage = () => {
  const { authUser } = useAuthStore();
  const {
    fetchAllLeaves,
    leaves,
    isFetching,
    deleteLeaveRequest,
    updateLeaveStatus,
    selectedLeave,
  } = useLeaveStore();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("team");

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // New: Action Modal State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionData, setActionData] = useState(null); // { id, status, fullname }

  // Loading States
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    if (!authUser) router.push("/login");
    else fetchAllLeaves();
  }, [authUser, router, fetchAllLeaves]);

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

  const handleActionTrigger = (data) => {
    setActionData(data);
    setIsActionModalOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!actionData) return;
    setIsProcessingAction(true);
    await updateLeaveStatus(actionData.id, actionData.status);
    setIsProcessingAction(false);
    setIsActionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <TopBar title="Leave Management" />

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
        onAction={handleActionTrigger} // Pass trigger to table
      />

      {/* Modals */}
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

      {/* 2. Updated Component Usage */}
      <ConfirmLeaveActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onConfirm={handleActionConfirm}
        actionData={actionData}
        isProcessing={isProcessingAction}
      />
    </div>
  );
};

export default LeavePage;
