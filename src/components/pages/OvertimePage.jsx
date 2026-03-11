"use client";
import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

// Store
import { useAuthStore } from "@/stores/useAuthStore";
import { useOvertimeStore } from "@/stores/useOvertimeStore";

// Utils
import { getCurrentMonth } from "@/utils/formatUtils";

// Layout
import OvertimeStatsGrid from "../ui/OvertimePageUIs/OvertimeStatsGrid";
import OvertimeTableList from "../ui/OvertimePageUIs/OvertimeTableList";

// Modals
import NewOvertimeModal from "../ui/OvertimePageUIs/NewOvertimeModal";
import AdminCreateOvertimeModal from "../ui/OvertimePageUIs/AdminCreateOvertimeModal";
import EditOvertimeModal from "../ui/OvertimePageUIs/EditOvertimeModal";
import ViewOvertimeRejectReasonModal from "../ui/OvertimePageUIs/ViewOvertimeRejectReasonModal";
import DeleteOvertimeModal from "../ui/OvertimePageUIs/DeleteOvertimeModal";
import ConfirmOvertimeActionModal from "../ui/OvertimePageUIs/ConfirmOvertimeActionModal";
import OvertimeRejectReasonModal from "../ui/OvertimePageUIs/OvertimeRejectReasonModal";
import ViewOvertimeReasonModal from "../ui/OvertimePageUIs/ViewOvertimeReasonModal"; // <-- NEW IMPORT

const OvertimePage = () => {
  const { authUser, socket } = useAuthStore();
  const {
    overtimeRequests,
    fetchAllOvertime,
    fetchOvertimeStats,
    updateOvertimeStatus,
    isUpdating,
    subscribeToOvertimeUpdates,
    unsubscribeFromOvertimeUpdates,
  } = useOvertimeStore();

  const router = useRouter();

  // --- PERMISSIONS ---
  const canViewPage = authUser?.role?.perm_overtime_view === true;
  const canViewAll = authUser?.role?.perm_overtime_view_all === true;
  const canApprove = authUser?.role?.perm_overtime_approve === true;
  const canCreate = authUser?.role?.perm_overtime_create === true;
  const canManage = authUser?.role?.perm_overtime_manage === true;

  // --- FILTER & TAB STATES ---
  const [activeTab, setActiveTab] = useState(() => (canApprove ? "team" : "my"));
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState(getCurrentMonth());

  // --- MODAL STATES ---
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAdminCreateModalOpen, setIsAdminCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  // Split View Reason States
  const [viewRejectReasonState, setViewRejectReasonState] = useState({
    isOpen: false,
    reason: "",
  });
  
  const [viewOvertimeReasonState, setViewOvertimeReasonState] = useState({
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
    if (!canViewPage) {
      router.push("/not-found");
      return;
    }

    const params = {
      status: filterStatus !== "All" ? filterStatus : undefined,
    };

    if (filterDate) {
      const [year, month] = filterDate.split("-");
      params.year = year;
      params.month = month;
    }

    if (activeTab === "my" || !canViewAll) {
      params.targetUserId = authUser.id;
    }

    fetchAllOvertime(params);
    fetchOvertimeStats(params);
  }, [
    fetchAllOvertime, 
    fetchOvertimeStats, 
    router, 
    authUser, 
    canViewPage, 
    filterStatus, 
    filterDate, 
    activeTab, 
    canViewAll
  ]);

  // --- REAL-TIME LISTENER SETUP ---
  useEffect(() => {
    if (socket?.connected) {
      subscribeToOvertimeUpdates();
    }
    return () => {
      unsubscribeFromOvertimeUpdates();
    };
  }, [socket, subscribeToOvertimeUpdates, unsubscribeFromOvertimeUpdates]);

  // --- HANDLERS ---
  const handleEdit = (request) => {
    setSelectedRequest(request);
    setIsEditModalOpen(true);
  };

  const handleDelete = (request) => {
    setRequestToDelete(request);
    setIsDeleteModalOpen(true);
  };

  // Splitted Reason Handlers
  const handleViewRejectReason = (reason) => {
    setViewRejectReasonState({ isOpen: true, reason });
  };

  const handleViewOvertimeReason = (reason) => {
    setViewOvertimeReasonState({ isOpen: true, reason });
  };

  const handleAction = (request, status) => {
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

  if (!authUser || !canViewPage) return null;

  return (
    <div className="space-y-4 h-auto lg:h-[calc(100vh-100px)] flex flex-col antialiased-text">
      
      {/* HIGH-DENSITY HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-base-300 pb-4 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content leading-none mb-1">
            Overtime Requests
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
            Manage and approve extra hours
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {canManage && (
            <button
              onClick={() => setIsAdminCreateModalOpen(true)}
              className="btn btn-sm h-8 min-h-0 btn-secondary text-secondary-content text-[10px] font-bold uppercase tracking-widest gap-1.5 flex-1 sm:flex-none shadow-sm px-3"
            >
              <UserPlus size={12} /> Assign OT
            </button>
          )}

          {canCreate && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="btn btn-sm h-8 min-h-0 btn-primary text-primary-content text-[10px] font-bold uppercase tracking-widest gap-1.5 flex-1 sm:flex-none shadow-sm px-3"
            >
              <Plus size={12} /> Request OT
            </button>
          )}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="shrink-0">
        <OvertimeStatsGrid />
      </div>

      {/* DYNAMIC LIST VIEW */}
      <div className="flex-1 overflow-hidden min-h-[400px]">
        <OvertimeTableList
          requests={overtimeRequests}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAction={handleAction}
          
          // Passed Both Handlers
          onViewRejectReason={handleViewRejectReason}
          onViewOvertimeReason={handleViewOvertimeReason}
          
          canApprove={canApprove}
          canCreate={canCreate}
          authUser={authUser}
        />
      </div>

      {/* --- MODALS --- */}
      <NewOvertimeModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <AdminCreateOvertimeModal
        isOpen={isAdminCreateModalOpen}
        onClose={() => setIsAdminCreateModalOpen(false)}
      />

      <EditOvertimeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      {/* Reject Reason Viewer */}
      <ViewOvertimeRejectReasonModal
        isOpen={viewRejectReasonState.isOpen}
        reason={viewRejectReasonState.reason}
        onClose={() =>
          setViewRejectReasonState({ ...viewRejectReasonState, isOpen: false })
        }
      />

      {/* Overtime Reason Viewer */}
      <ViewOvertimeReasonModal
        isOpen={viewOvertimeReasonState.isOpen}
        reason={viewOvertimeReasonState.reason}
        onClose={() =>
          setViewOvertimeReasonState({ ...viewOvertimeReasonState, isOpen: false })
        }
      />

      <DeleteOvertimeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRequestToDelete(null);
        }}
        request={requestToDelete}
        userRole={authUser.role_id}
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