"use client";

import { useState, useEffect, useMemo } from "react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "next/navigation";

// Icons & UI
import {
  Loader,
  Plus,
  Clock,
  Calendar,
  X,
  Users,
  CheckCircle,
  Timer,
  AlertCircle,
  LogOut,
} from "lucide-react";
import ToggleListGrid from "../ui/Buttons/ToggleListGrid";

// Views & Modals
import AttendanceTableList from "../ui/AttendancePageUIs/AttendanceTableList";
import AttendanceGridList from "../ui/AttendancePageUIs/AttendanceGridList";
import AddNewAttendanceModal from "../ui/AttendancePageUIs/AddNewAttendanceModal";
import DeleteAttendanceModal from "../ui/AttendancePageUIs/DeleteAttendanceModal";
import EditAttendanceModal from "../ui/AttendancePageUIs/EditAttendanceModal";
import ClockInModal from "../ui/AttendancePageUIs/ClockInModal";
import ClockOutModal from "../ui/AttendancePageUIs/ClockOutModal";

const AttendancePage = () => {
  const { authUser, socket } = useAuthStore(); // Get socket from Auth Store
  
  const {
    fetchAllAttendances,
    attendances,
    isFetchingAttendances,
    deleteAttendance,
    isDeletingAttendance,
    verifyWorkday,
    checkTodayStatus,
    todayStatus,
    // --- SOCKET ACTIONS ---
    subscribeToAttendanceUpdates,
    unsubscribeFromAttendanceUpdates,
  } = useAttendanceStore();

  const router = useRouter();
  const { fetchAllUsers, users } = useUserStore();
  const [view, setView] = useState("grid");

  // --- PERMISSIONS ---
  const canView = authUser?.role?.perm_attendance_view === true;
  const canManualEntry = authUser?.role?.perm_attendance_manual === true;
  const canVerify = authUser?.role?.perm_attendance_verify === true;

  // --- DEFAULT DATE (LOCAL) ---
  const [filterDate, setFilterDate] = useState(() => {
    return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local
  });

  // --- INITIAL DATA LOAD & SECURITY ---
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }
    if (!canView) {
      router.push("/not-found");
      return;
    }

    fetchAllAttendances();
    fetchAllUsers();
    checkTodayStatus();
  }, [
    fetchAllAttendances,
    fetchAllUsers,
    checkTodayStatus,
    authUser,
    router,
    canView,
  ]);

  // --- REAL-TIME LISTENER SETUP ---
  useEffect(() => {
    // Only subscribe if socket is connected (Admin/Super Admin only)
    if (socket?.connected) {
      subscribeToAttendanceUpdates();
    }

    // Cleanup: Unsubscribe when user leaves this page
    return () => {
      unsubscribeFromAttendanceUpdates();
    };
  }, [socket, subscribeToAttendanceUpdates, unsubscribeFromAttendanceUpdates]);

  // --- FILTERING LOGIC ---
  const filteredAttendances = useMemo(() => {
    if (!authUser) return [];

    let data = attendances;

    // If standard user, only show their own records
    if (!canVerify) {
      data = data.filter((record) => record.user_id === authUser.id);
    }

    // Timezone Aware Date Filter
    if (filterDate) {
      data = data.filter((record) => {
        if (!record.date) return false;
        // Convert DB UTC string -> Local JS Date -> Local String YYYY-MM-DD
        const recordDateString = new Date(record.date).toLocaleDateString(
          "en-CA"
        );
        return recordDateString === filterDate;
      });
    }

    return data;
  }, [attendances, filterDate, canVerify, authUser]);

  // --- STATS CALCULATION ---
  const checkTimeFlag = (timeString, type) => {
    if (!timeString) return false;
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    return type === "in" ? totalMinutes > 495 : totalMinutes < 1020;
  };

  const stats = useMemo(() => {
    const total = filteredAttendances.length;
    const late = filteredAttendances.filter((a) =>
      checkTimeFlag(a.time_in, "in")
    ).length;
    const undertime = filteredAttendances.filter(
      (a) => a.time_out && checkTimeFlag(a.time_out, "out")
    ).length;
    const onTime = total - late;
    return { total, late, onTime, undertime };
  }, [filteredAttendances]);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState(false);

  const handleDeleteClick = (id) => {
    setRecordToDelete(attendances.find((r) => r.id === id));
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      await deleteAttendance(recordToDelete.id);
      setIsDeleteModalOpen(false);
    }
  };

  // --- RENDER ---
  if (isFetchingAttendances) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  if (!authUser || !canView) return null;

  return (
    <div className="space-y-6">
      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users />}
          label={canVerify ? "Total Present" : "My Attendance"}
          value={stats.total}
          color="primary"
        />
        <StatCard
          icon={<CheckCircle />}
          label="On Time"
          value={stats.onTime}
          color="success"
        />
        <StatCard
          icon={<Timer />}
          label="Late"
          value={stats.late}
          color="error"
        />
        <StatCard
          icon={<AlertCircle />}
          label="Undertime"
          value={stats.undertime}
          color="warning"
        />
      </div>

      <div className="space-y-4">
        {/* HEADER CONTROLS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-base-content tracking-tight">
              Attendance
            </h1>
            <p className="text-sm opacity-60 text-base-content">
              {filterDate
                ? `Viewing records for ${filterDate}`
                : "Viewing all history"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* DATE PICKER */}
            <div className="bg-base-100 border border-base-300 rounded-lg px-3 flex items-center h-10 group relative transition-all hover:border-primary/50">
              <Calendar size={16} className="opacity-50 mr-2" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-base-content/80"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="btn btn-ghost btn-xs btn-circle ml-1 hover:bg-base-300"
                  title="Show All Dates"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* DYNAMIC CLOCK IN/OUT BUTTONS */}
            {todayStatus.status === "idle" && (
              <button
                onClick={() => setIsClockInModalOpen(true)}
                className="btn btn-secondary btn-sm h-10 px-4"
              >
                <Clock size={16} className="mr-2" /> Clock In
              </button>
            )}

            {todayStatus.status === "clocked_in" && (
              <button
                onClick={() => setIsClockOutModalOpen(true)}
                className="btn btn-error text-white btn-sm h-10 px-4"
              >
                <LogOut size={16} className="mr-2" /> Clock Out
              </button>
            )}

            {todayStatus.status === "completed" && (
              <button
                disabled
                className="btn btn-success btn-outline btn-sm h-10 px-4 opacity-50 cursor-not-allowed"
              >
                <CheckCircle size={16} className="mr-2" /> Completed
              </button>
            )}

            {canManualEntry && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary btn-sm h-10 px-4"
              >
                <Plus size={16} className="mr-2" /> Manual Entry
              </button>
            )}

            <ToggleListGrid setView={setView} view={view} />
          </div>
        </div>

        {/* DATA VIEWS */}
        {view === "list" ? (
          <AttendanceTableList
            attendances={filteredAttendances}
            onVerifyDay={verifyWorkday}
            onDelete={handleDeleteClick}
            onEdit={(r) => {
              setRecordToEdit(r);
              setIsEditModalOpen(true);
            }}
            canManualEntry={canManualEntry}
            canVerify={canVerify}
          />
        ) : (
          <AttendanceGridList
            attendances={filteredAttendances}
            onVerifyDay={verifyWorkday}
            onDelete={handleDeleteClick}
            canManualEntry={canManualEntry}
            canVerify={canVerify}
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

      <ClockOutModal
        isOpen={isClockOutModalOpen}
        onClose={() => setIsClockOutModalOpen(false)}
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`bg-${color}/10 p-3 rounded-xl text-${color}`}>{icon}</div>
    <div>
      <p className="text-xs opacity-50 font-bold uppercase tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  </div>
);

export default AttendancePage;