"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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
import ConfirmOvertimeActionModal from "../ui/OvertimePageUIs/ConfirmOvertimeActionModal";
import OvertimeRejectReasonModal from "../ui/OvertimePageUIs/OvertimeRejectReasonModal";

const OvertimePage = () => {
  const { authUser } = useAuthStore();
  const {
    overtimeRequests,
    fetchAllOvertime,
    updateOvertimeStatus,
    isUpdating,
  } = useOvertimeStore();

  const router = useRouter();

  // --- PERMISSIONS ---
  // 1. Can access the page?
  const canViewPage = authUser?.role?.perm_overtime_view === true;
  // 2. Can see everyone's requests? (false = only own)
  const canViewAll = authUser?.role?.perm_overtime_view_all === true;
  // 3. Can Approve/Reject?
  const canApprove = authUser?.role?.perm_overtime_approve === true;

  // --- MODAL STATES ---
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  // View Reason
  const [viewReasonState, setViewReasonState] = useState({
    isOpen: false,
    reason: "",
  });

  // Actions
  const [confirmActionState, setConfirmActionState] = useState({
    isOpen: false,
    request: null,
    status: "",
  });
  const [rejectReasonState, setRejectReasonState] = useState({
    isOpen: false,
    request: null,
  });

  // --- FETCH & SECURITY ---
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }

    // Security Redirect
    if (!canViewPage) {
      router.push("/not-found");
      return;
    }

    fetchAllOvertime();
  }, [fetchAllOvertime, router, authUser, canViewPage]);

  // --- FILTER LOGIC (Privacy) ---
  const filteredRequests = overtimeRequests.filter((req) => {
    // If Admin/HR, show everything
    if (canViewAll) return true;
    // Otherwise, strictly show only current user's requests
    return req.user_id === authUser?.id;
  });

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

  const handleAction = (request, status) => {
    // Security Guard: Prevent action if no permission
    if (!canApprove) return;

    if (status === "Approved") {
      setConfirmActionState({ isOpen: true, request, status: "Approved" });
    } else if (status === "Rejected") {
      setRejectReasonState({ isOpen: true, request });
    }
  };

  const handleConfirmAction = async () => {
    const { request, status } = confirmActionState;
    if (!request) return;
    const success = await updateOvertimeStatus(request.id, status, null);
    if (success !== false) {
      setConfirmActionState({ isOpen: false, request: null, status: "" });
    }
  };

  const handleConfirmRejection = async (reason) => {
    const { request } = rejectReasonState;
    if (!request) return;
    const success = await updateOvertimeStatus(request.id, "Rejected", reason);
    if (success !== false) {
      setRejectReasonState({ isOpen: false, request: null });
    }
  };

  // Prevent UI Flash
  if (!authUser || !canViewPage) return null;

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

      {/* Stats Grid - Uses Filtered Data */}
      <OvertimeStatsGrid requests={filteredRequests} />

      {/* Table - Uses Filtered Data & Permissions */}
      <OvertimeTableList
        requests={filteredRequests}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAction={handleAction}
        onViewReason={handleViewReason}
        canApprove={canApprove} // <--- Pass permission to hide/show buttons
        authUser={authUser} // <--- Pass user to check ownership
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

      <ConfirmOvertimeActionModal
        isOpen={confirmActionState.isOpen}
        actionData={confirmActionState}
        isProcessing={isUpdating}
        onClose={() =>
          setConfirmActionState({ ...confirmActionState, isOpen: false })
        }
        onConfirm={handleConfirmAction}
      />

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
