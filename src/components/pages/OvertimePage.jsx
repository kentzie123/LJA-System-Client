"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

// Store
import { useAuthStore } from "@/stores/useAuthStore";
import { useOvertimeStore } from "@/stores/useOvertimeStore";

// Layout
import OvertimeStatsGrid from "../ui/OvertimePageUIs/OvertimeStatsGrid";
import OvertimeTableList from "../ui/OvertimePageUIs/OvertimeTableList";

// Modals
import NewOvertimeModal from "../ui/OvertimePageUIs/NewOvertimeModal";
import EditOvertimeModal from "../ui/OvertimePageUIs/EditOvertimeModal";
import ViewOvertimeRejectReasonModal from "../ui/OvertimePageUIs/ViewOvertimeRejectReasonModal";
import DeleteOvertimeModal from "../ui/OvertimePageUIs/DeleteOvertimeModal";

// --- IMPORT THE NEW SEPARATE MODALS ---
import ConfirmOvertimeActionModal from "../ui/OvertimePageUIs/ConfirmOvertimeActionModal";
import OvertimeRejectReasonModal from "../ui/OvertimePageUIs/OvertimeRejectReasonModal";

import { useRouter } from "next/navigation";

const OvertimePage = () => {
  const { authUser } = useAuthStore();
  const {
    overtimeRequests,
    fetchAllOvertime,
    updateOvertimeStatus, // Action for API
    isUpdating, // Loading state from store
  } = useOvertimeStore();

  const router = useRouter();

  // --- MODAL STATES ---
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  // View Reason (For viewing rejected reason)
  const [viewReasonState, setViewReasonState] = useState({
    isOpen: false,
    reason: "",
  });

  // --- ACTION STATES (Approve vs Reject) ---
  // 1. For Approval (Simple Confirm)
  const [confirmActionState, setConfirmActionState] = useState({
    isOpen: false,
    request: null,
    status: "", // "Approved"
  });

  // 2. For Rejection (Reason Input)
  const [rejectReasonState, setRejectReasonState] = useState({
    isOpen: false,
    request: null,
  });

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    } else {
      fetchAllOvertime();
    }
  }, [fetchAllOvertime, router, authUser]);

  // --- HANDLERS ---
  const handleEdit = (request) => {
    setSelectedRequest(request);
    setIsEditModalOpen(true);
  };

  const handleDelete = (request) => {
    setRequestToDelete(request);
    setIsDeleteModalOpen(true);
  };

  const handleViewReason = (reason) => {
    setViewReasonState({ isOpen: true, reason });
  };

  // --- MAIN ACTION HANDLER (Triggered from Table) ---
  const handleAction = (request, status) => {
    if (status === "Approved") {
      // Open Simple Confirm Modal
      setConfirmActionState({
        isOpen: true,
        request,
        status: "Approved",
      });
    } else if (status === "Rejected") {
      // Open Reason Input Modal
      setRejectReasonState({
        isOpen: true,
        request,
      });
    }
  };

  // --- SUBMIT HANDLERS ---

  // 1. Submit Approval
  const handleConfirmAction = async () => {
    const { request, status } = confirmActionState;
    if (!request) return;

    const success = await updateOvertimeStatus(request.id, status, null);
    if (success !== false) {
      setConfirmActionState({ isOpen: false, request: null, status: "" });
    }
  };

  // 2. Submit Rejection
  const handleConfirmRejection = async (reason) => {
    const { request } = rejectReasonState;
    if (!request) return;

    const success = await updateOvertimeStatus(request.id, "Rejected", reason);
    if (success !== false) {
      setRejectReasonState({ isOpen: false, request: null });
    }
  };

  if (!authUser) return null;
  
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Overtime Requests</h1>
          <p className="text-sm opacity-60">
            Manage and approve employee overtime hours.
          </p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="size-4" /> New Overtime Request
        </button>
      </div>

      <OvertimeStatsGrid />

      <OvertimeTableList
        requests={overtimeRequests}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAction={handleAction}
        onViewReason={handleViewReason}
      />

      {/* --- MODALS --- */}
      <NewOvertimeModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <EditOvertimeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      <ViewOvertimeRejectReasonModal
        isOpen={viewReasonState.isOpen}
        reason={viewReasonState.reason}
        onClose={() =>
          setViewReasonState({ ...viewReasonState, isOpen: false })
        }
      />

      <DeleteOvertimeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRequestToDelete(null);
        }}
        request={requestToDelete}
      />

      {/* --- NEW SEPARATE MODALS --- */}

      {/* 1. Approval Modal */}
      <ConfirmOvertimeActionModal
        isOpen={confirmActionState.isOpen}
        actionData={confirmActionState}
        isProcessing={isUpdating}
        onClose={() =>
          setConfirmActionState({ ...confirmActionState, isOpen: false })
        }
        onConfirm={handleConfirmAction}
      />

      {/* 2. Rejection Modal */}
      <OvertimeRejectReasonModal
        isOpen={rejectReasonState.isOpen}
        isProcessing={isUpdating}
        onClose={() =>
          setRejectReasonState({ ...rejectReasonState, isOpen: false })
        }
        onConfirm={handleConfirmRejection}
      />
    </div>
  );
};

export default OvertimePage;
