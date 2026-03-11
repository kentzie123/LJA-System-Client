"use client";

import { useState, useEffect, useMemo } from "react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "next/navigation";

// Icons
import {
  Loader,
  Plus,
  Clock,
  Users,
  CheckCircle,
  Timer,
  AlertCircle,
  LogOut,
  Download,
  LayoutGrid,
  Calendar,
} from "lucide-react";

// Views & Modals
import AttendanceGridList from "../ui/AttendancePageUIs/AttendanceGridList";
import AttendanceCalendarView from "../ui/AttendancePageUIs/AttendanceCalendarView";
import AddNewAttendanceModal from "../ui/AttendancePageUIs/AddNewAttendanceModal";
import DeleteAttendanceModal from "../ui/AttendancePageUIs/DeleteAttendanceModal";
import EditAttendanceModal from "../ui/AttendancePageUIs/EditAttendanceModal";
import ClockInModal from "../ui/AttendancePageUIs/ClockInModal";
import ClockOutModal from "../ui/AttendancePageUIs/ClockOutModal";

// Extracted UI Components
import StatCard from "../ui/AttendancePageUIs/StatCard";
import EmployeeFilterDropdown from "../ui/AttendancePageUIs/EmployeeFilterDropdown";
import ExportDtrModal from "../ui/AttendancePageUIs/ExportDtrModal";
import CustomDatePicker from "../ui/Selections/CustomDatePicker";

const AttendancePage = () => {
  const { authUser, socket } = useAuthStore();
  const router = useRouter();

  // --- STORES ---
  const {
    fetchAllAttendances,
    attendances,
    isFetchingAttendances,
    deleteAttendance,
    isDeletingAttendance,
    verifyWorkday,
    checkTodayStatus,
    todayStatus,
    subscribeToAttendanceUpdates,
    unsubscribeFromAttendanceUpdates,
  } = useAttendanceStore();

  const { fetchAllUsers, users } = useUserStore();

  // --- PERMISSIONS ---
  const canView = authUser?.role?.perm_attendance_view === true;
  const canManualEntry = authUser?.role?.perm_attendance_manual === true;
  const canVerify = authUser?.role?.perm_attendance_verify === true;
  const canExport = authUser?.role?.perm_attendance_export === true;

  // --- STATE (Date Range initialized to current month) ---
  const today = new Date();
  const firstDayOfMonth = today.toLocaleDateString("en-CA");
  const currentDay = today.toLocaleDateString("en-CA");

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(currentDay);

  // INDEPENDENT SELECTION STATES
  const [selectedEmployees, setSelectedEmployees] = useState([]); // For Grid View
  const [selectedCalendarUserId, setSelectedCalendarUserId] = useState(""); // For Calendar View

  const [currentView, setCurrentView] = useState("grid");

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState(false);
  const [isDtrModalOpen, setIsDtrModalOpen] = useState(false);

  // --- INITIALIZE DATA ON MOUNT ---
  useEffect(() => {
    if (!authUser) return router.push("/login");
    if (!canView) return router.push("/not-found");

    fetchAllUsers();
    checkTodayStatus();
  }, [authUser, router, canView, fetchAllUsers, checkTodayStatus]);

  // --- SOCKET LISTENER ---
  useEffect(() => {
    if (socket?.connected) subscribeToAttendanceUpdates();
    return () => unsubscribeFromAttendanceUpdates();
  }, [socket, subscribeToAttendanceUpdates, unsubscribeFromAttendanceUpdates]);

  // --- AUTO-FETCH WHEN FILTERS CHANGE (GRID ONLY) ---
  useEffect(() => {
    if (!authUser || !canView) return;

    const targetUserId =
      selectedEmployees.length === 1 ? selectedEmployees[0] : undefined;

    const debounceTimer = setTimeout(() => {
      fetchAllAttendances({
        startDate,
        endDate,
        userId: targetUserId,
      });
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [
    startDate,
    endDate,
    selectedEmployees.length === 1 ? selectedEmployees[0] : "all",
    authUser,
    canView,
    fetchAllAttendances,
  ]);

  // --- FILTER LOGIC (Applied to data already fetched from backend) ---
  const filteredAttendances = useMemo(() => {
    if (!authUser) return [];
    let data = attendances;

    if (!canVerify) {
      data = data.filter((record) => record.user_id === authUser.id);
    } else if (selectedEmployees.length > 0) {
      data = data.filter((record) =>
        selectedEmployees.includes(record.user_id),
      );
    }

    return data;
  }, [attendances, canVerify, authUser, selectedEmployees]);

  // --- STATS LOGIC ---
  const checkTimeFlag = (timeString, type) => {
    if (!timeString) return false;
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    return type === "in" ? totalMinutes > 495 : totalMinutes < 1020;
  };

  const stats = useMemo(() => {
    const total = filteredAttendances.length;
    const late = filteredAttendances.filter((a) =>
      checkTimeFlag(a.time_in, "in"),
    ).length;
    const undertime = filteredAttendances.filter(
      (a) => a.time_out && checkTimeFlag(a.time_out, "out"),
    ).length;
    return { total, late, onTime: total - late, undertime };
  }, [filteredAttendances]);

  // --- CALENDAR ACTIVE USER LOGIC (UPDATED FOR INDEPENDENT STATE) ---
  const activeCalendarUser = useMemo(() => {
    if (selectedCalendarUserId) {
      return users.find((u) => String(u.id) === String(selectedCalendarUserId));
    }
    if (!canVerify) return authUser;
    return users?.[0] || null;
  }, [selectedCalendarUserId, users, canVerify, authUser]);

  // --- HANDLERS ---
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

  if (!authUser || !canView) return null;

  const showExportButton =
    canExport && (!canVerify || selectedEmployees.length === 1);

  return (
    <div className="space-y-6 pb-10 relative">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-base-300 pb-4 mb-6">
        {/* LEFT: TITLE & VIEW SWITCHER */}
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-base-content tracking-tight leading-tight">
              Attendance Management
            </h1>
            <p className="text-[10px] sm:text-[11px] font-medium opacity-50 uppercase tracking-wider mt-0.5">
              Monitor employee logs
            </p>
          </div>

          {/* COMPACT VIEW SWITCHER - Full width on mobile, auto on desktop */}
          <div className="flex items-center p-1 bg-base-200 rounded-lg w-full sm:w-fit border border-base-300">
            <button
              onClick={() => setCurrentView("grid")}
              className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                currentView === "grid"
                  ? "bg-base-100 text-primary shadow-sm"
                  : "text-base-content/50 hover:text-base-content"
              }`}
            >
              <LayoutGrid size={12} />
              Grid
            </button>
            <button
              onClick={() => setCurrentView("calendar")}
              className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                currentView === "calendar"
                  ? "bg-base-100 text-primary shadow-sm"
                  : "text-base-content/50 hover:text-base-content"
              }`}
            >
              <Calendar size={12} />
              Calendar
            </button>
          </div>
        </div>

        {/* RIGHT: ACTION BUTTONS - 2x2 Grid on mobile, Flex row on desktop */}
        <div
          className={`grid gap-2 w-full lg:w-auto sm:flex sm:items-center ${canManualEntry ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {/* PRIMARY ACTION: CLOCK IN/OUT */}
          <div className="sm:contents">
            {todayStatus.status === "idle" && (
              <button
                onClick={() => setIsClockInModalOpen(true)}
                className="btn btn-primary btn-sm h-8 min-h-0 w-full sm:w-auto shadow-sm font-bold uppercase tracking-widest text-[10px] px-4"
              >
                <Clock size={14} className="shrink-0" />
                <span>Clock In</span>
              </button>
            )}

            {todayStatus.status === "clocked_in" && (
              <button
                onClick={() => setIsClockOutModalOpen(true)}
                className="btn btn-error btn-sm h-8 min-h-0 text-white w-full sm:w-auto shadow-sm font-bold uppercase tracking-widest text-[10px] px-4"
              >
                <LogOut size={14} className="shrink-0" />
                <span>Clock Out</span>
              </button>
            )}

            {todayStatus.status === "completed" && (
              <button
                disabled
                className="btn btn-success btn-outline btn-sm h-8 min-h-0 opacity-50 w-full sm:w-auto font-bold uppercase tracking-widest text-[10px] px-4"
              >
                <CheckCircle size={14} className="shrink-0" />
                <span className="hidden xs:inline">Done</span>
              </button>
            )}
          </div>

          {/* SECONDARY ACTION: MANUAL ENTRY */}
          {canManualEntry && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn hover:bg-base-300 btn-sm h-8 min-h-0 w-full sm:w-auto text-base-content border border-base-300 font-bold uppercase tracking-widest text-[10px] px-3"
            >
              <Plus size={14} className="shrink-0" />
              <span className="truncate">
                Manual<span className="hidden md:inline"> Entry</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. STATS DASHBOARD */}
      {currentView === "grid" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <StatCard
            icon={<Users />}
            label={canVerify ? "Total Fetched" : "My Attendance"}
            value={stats.total}
          />
          <StatCard
            icon={<CheckCircle />}
            label="On Time"
            value={stats.onTime}
            textClass="text-success"
          />
          <StatCard
            icon={<Timer />}
            label="Late"
            value={stats.late}
            textClass="text-error"
          />
          <StatCard
            icon={<AlertCircle />}
            label="Undertime"
            value={stats.undertime}
            textClass="text-warning"
          />
        </div>
      )}

      {/* 3. COMPACT COMMAND BAR */}
      {currentView === "grid" && (
        <div className="bg-base-200/40 border border-base-300 rounded-lg p-2 flex flex-col lg:flex-row gap-3 items-center justify-between shadow-sm animate-in fade-in duration-300">
          {/* --- LEFT: FILTERS (TIGHT FLOW) --- */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Date Pickers - Using the new h-8 standard */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <div className="w-1/2 sm:w-[130px]">
                <CustomDatePicker
                  label="From" // Shorter label
                  value={startDate}
                  onChange={setStartDate}
                />
              </div>
              <div className="w-1/2 sm:w-[130px]">
                <CustomDatePicker
                  label="To" // Shorter label
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>
            </div>

            {/* Employee Multi-Select */}
            {canVerify && (
              <div className="w-full sm:w-[200px] md:w-[240px] flex flex-col">
                {/* ADDED LABEL HERE */}
                <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-0.5 ml-1">
                  Employee
                </label>
                <EmployeeFilterDropdown
                  users={users}
                  selectedEmployees={selectedEmployees}
                  setSelectedEmployees={setSelectedEmployees}
                />
              </div>
            )}

            {/* Inline Loader */}
            {isFetchingAttendances && (
              <div className="flex items-center gap-1.5 text-primary text-[9px] font-black uppercase tracking-widest pl-2">
                <Loader className="animate-spin size-3" />
                <span className="hidden md:inline">Syncing...</span>
              </div>
            )}
          </div>

          {/* --- RIGHT: STATS & ACTIONS (SINGLE ROW) --- */}
          <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-base-300 pt-2 lg:pt-0 lg:pl-4">
            {/* Record Counter - Smaller font */}
            <div className="text-[10px] font-bold text-base-content/40 uppercase tracking-[0.1em] whitespace-nowrap">
              {filteredAttendances.length}{" "}
              <span className="hidden sm:inline">Records Found</span>
              <span className="sm:hidden">Results</span>
            </div>

            {showExportButton && (
              <button
                onClick={() => setIsDtrModalOpen(true)}
                className="btn btn-xs h-8 min-h-0 btn-success text-success-content px-3 font-bold uppercase tracking-widest text-[9px] rounded-md"
              >
                <Download size={12} className="mr-1" />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. MAIN DATA CONTENT */}
      <div className="min-h-[400px]">
        {currentView === "grid" ? (
          isFetchingAttendances && attendances.length === 0 ? (
            <div className="flex h-[50vh] w-full items-center justify-center">
              <div className="flex flex-col items-center gap-4 opacity-50">
                <Loader className="animate-spin size-10 text-primary" />
                <p className="text-sm font-medium tracking-widest uppercase">
                  Loading Records...
                </p>
              </div>
            </div>
          ) : filteredAttendances.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-base-300 rounded-2xl bg-base-100/50 animate-in fade-in duration-300">
              <Users size={40} className="text-base-content/20 mb-3" />
              <p className="text-base-content/60 font-medium text-sm text-center px-4">
                No attendance records found for this range.
              </p>
            </div>
          ) : (
            <AttendanceGridList
              attendances={filteredAttendances}
              onVerifyDay={verifyWorkday}
              onDelete={handleDeleteClick}
              canManualEntry={canManualEntry}
              canVerify={canVerify}
            />
          )
        ) : (
          <AttendanceCalendarView
            users={users}
            selectedEmployee={activeCalendarUser}
            onSelectEmployee={(id) => setSelectedCalendarUserId(id)}
            onExport={() => setIsDtrModalOpen(true)}
            showExport={canExport}
            canVerify={canVerify}
            canManualEntry={canManualEntry}
            authUser={authUser}
          />
        )}
      </div>

      {/* MODALS */}
      <ExportDtrModal
        isOpen={isDtrModalOpen}
        onClose={() => setIsDtrModalOpen(false)}
        authUser={authUser}
        users={users}
        canVerify={canVerify}
        selectedEmployees={
          currentView === "calendar" && activeCalendarUser
            ? [activeCalendarUser.id]
            : selectedEmployees
        }
        // Removed unnecessary props (attendances, leaves, overtimeRequests)
      />
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
        onSuccess={() => fetchAllAttendances({ startDate, endDate })}
      />
      <ClockOutModal
        isOpen={isClockOutModalOpen}
        onClose={() => setIsClockOutModalOpen(false)}
      />
    </div>
  );
};

export default AttendancePage;
