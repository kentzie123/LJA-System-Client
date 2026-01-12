"use client";

import { useState, useEffect } from "react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";

// Stores
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";

// Routing
import { useRouter } from "next/navigation";

// Icons
import { Loader, Plus, Clock } from "lucide-react";

// UI Components
import TopBar from "../layout/TopBar";
import ToggleListGrid from "../ui/Buttons/ToggleListGrid";

// Views
import AttendanceTableList from "../ui/AttendancePageUIs/AttendanceTableList";
import AttendanceGridList from "../ui/AttendancePageUIs/AttendanceGridList"; // <--- 1. Import Grid

// Modals
import AddNewAttendanceModal from "../ui/AttendancePageUIs/AddNewAttendanceModal";
import DeleteAttendanceModal from "../ui/AttendancePageUIs/DeleteAttendanceModal";
import EditAttendanceModal from "../ui/AttendancePageUIs/EditAttendanceModal";
import ClockInModal from "../ui/AttendancePageUIs/ClockInModal";

const AttendancePage = () => {
  const { authUser } = useAuthStore();
  const {
    fetchAllAttendances,
    attendances,
    isFetchingAttendances,
    deleteAttendance,
    isDeletingAttendance,
    verifyAttendance,
  } = useAttendanceStore();

  const router = useRouter();
  const { fetchAllUsers, users } = useUserStore();

  // State for View Toggle ('list' or 'grid')
  const [view, setView] = useState("list");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    } else {
      fetchAllAttendances();
      fetchAllUsers();
    }
  }, [fetchAllAttendances, fetchAllUsers, authUser, router]);

  const handleDeleteClick = (id) => {
    const record = attendances.find((r) => r.id === id);
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      await deleteAttendance(recordToDelete.id);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleEditClick = (record) => {
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  const handleVerify = (id, type, status) => {
    verifyAttendance(id, type, status);
  };

  if (isFetchingAttendances) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  if (!authUser) return null;

  return (
    <div className="space-y-6">
      <TopBar title={"Attendance"} />

      <div className="space-y-4">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-base-content">
              Attendance
            </div>
            <div className="text-sm opacity-65 text-base-content">
              Verify employee photos and manage records.
            </div>
          </div>
          <div className="flex items-stretch gap-2">
            {/* Clock In Button */}
            <button
              onClick={() => setIsClockInModalOpen(true)}
              className="btn btn-secondary text-secondary-content font-medium px-4 shadow-sm"
            >
              <Clock className="size-4" /> <span>Clock In/Out</span>
            </button>

            {/* Manual Entry Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary text-primary-content font-medium px-4"
            >
              <Plus className="size-4" /> <span>Manual Entry</span>
            </button>

            {/* View Toggle Button */}
            <ToggleListGrid setView={setView} view={view} />
          </div>
        </div>

        {/* --- CONDITIONAL RENDERING FOR VIEWS --- */}
        {view === "list" ? (
          // LIST VIEW (Table)
          <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-200 shadow-sm">
            <AttendanceTableList
              attendances={attendances}
              isFetchingAttendances={isFetchingAttendances}
              onDelete={handleDeleteClick}
              onEdit={handleEditClick}
              onVerify={handleVerify}
            />
          </div>
        ) : (
          // GRID VIEW (Cards)
          <AttendanceGridList
            attendances={attendances}
            onVerify={handleVerify}
            onDelete={(id) => handleDeleteClick(id)}
          />
        )}
      </div>

      {/* --- MODALS --- */}
      <AddNewAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
      />

      <DeleteAttendanceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        record={recordToDelete}
        isDeleting={isDeletingAttendance}
      />

      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        users={users}
        record={recordToEdit}
      />

      <ClockInModal
        isOpen={isClockInModalOpen}
        onClose={() => setIsClockInModalOpen(false)}
        users={users}
        onSuccess={fetchAllAttendances}
      />
    </div>
  );
};

export default AttendancePage;
