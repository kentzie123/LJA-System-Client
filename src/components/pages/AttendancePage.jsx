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
  SlidersHorizontal,
  Download,
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
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pb-10 relative">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-6 border-b border-base-300 pb-5 sm:pb-6">
        <div className="w-full md:w-auto">
          <h1 className="text-[32px] sm:text-3xl font-bold text-base-content tracking-tight leading-[1.1] mb-2 sm:mb-1">
            Attendance <br className="block sm:hidden" /> Management
          </h1>

          <div className="flex items-center p-1 sm:p-1.5 bg-base-200 sm:bg-base-300 rounded-xl sm:rounded-lg w-full md:w-fit mt-3 sm:mt-4 border border-base-300 sm:border-white/5 shadow-inner">
            <button
              onClick={() => setCurrentView("grid")}
              className={`flex-1 md:flex-none px-2 sm:px-4 py-2.5 sm:py-1.5 text-[11px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-md transition-all ${
                currentView === "grid"
                  ? "bg-primary text-white shadow-md"
                  : "text-base-content/50 hover:text-base-content/80"
              }`}
            >
              Daily Grid
            </button>
            <button
              onClick={() => setCurrentView("calendar")}
              className={`flex-1 md:flex-none px-2 sm:px-4 py-2.5 sm:py-1.5 text-[11px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-md transition-all ${
                currentView === "calendar"
                  ? "bg-primary text-white shadow-md"
                  : "text-base-content/50 hover:text-base-content/80"
              }`}
            >
              Monthly Calendar
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          {todayStatus.status === "idle" && (
            <button
              onClick={() => setIsClockInModalOpen(true)}
              className="btn btn-primary flex-1 md:flex-none shadow-sm shadow-primary/20 font-bold uppercase tracking-widest text-xs h-[48px] sm:h-10"
            >
              <Clock size={18} className="mr-1.5 sm:mr-2" /> Clock In
            </button>
          )}
          {todayStatus.status === "clocked_in" && (
            <button
              onClick={() => setIsClockOutModalOpen(true)}
              className="btn btn-error text-white flex-1 md:flex-none shadow-sm shadow-error/20 font-bold uppercase tracking-widest text-xs h-[48px] sm:h-10"
            >
              <LogOut size={18} className="mr-1.5 sm:mr-2" /> Clock Out
            </button>
          )}
          {todayStatus.status === "completed" && (
            <button
              disabled
              className="btn btn-success btn-outline opacity-50 cursor-not-allowed flex-1 md:flex-none font-bold uppercase tracking-widest text-xs h-[48px] sm:h-10"
            >
              <CheckCircle size={18} className="mr-1.5 sm:mr-2" /> Completed
            </button>
          )}
          {canManualEntry && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn bg-base-200 hover:bg-base-300 border-base-300 hover:border-base-300 flex-1 md:flex-none text-base-content shadow-sm font-bold uppercase tracking-widest text-xs h-[48px] sm:h-10"
            >
              <Plus size={18} className="mr-1 sm:mr-1.5 opacity-70" />
              <span>
                Manual<span className="hidden sm:inline"> Entry</span>
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

      {/* 3. COMMAND BAR (Date Range Filters) */}
      {currentView === "grid" && (
        <div className="bg-base-200/50 border border-base-300 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center shadow-sm animate-in fade-in duration-300">
          {/* --- FILTERS SECTION --- */}
          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end gap-3 w-full xl:w-auto flex-1">
            {/* Filter Label (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2 text-base-content/50 pr-2 border-r border-base-300 pb-2 shrink-0">
              <SlidersHorizontal size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Filters
              </span>
            </div>

            {/* Date Pickers (Grid on mobile, Row on tablet+) */}
            <div className="grid grid-cols-2 sm:flex w-full sm:w-auto gap-2 sm:gap-3">
              <div className="w-full sm:w-[140px] md:w-[150px]">
                <CustomDatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                />
              </div>
              <div className="w-full sm:w-[140px] md:w-[150px]">
                <CustomDatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>
            </div>

            {/* Employee Dropdown (Full width mobile, auto on tablet+) */}
            {canVerify && (
              <div className="w-full sm:w-auto sm:min-w-[220px] md:w-[280px] flex-1 lg:flex-none">
                <EmployeeFilterDropdown
                  users={users}
                  selectedEmployees={selectedEmployees}
                  setSelectedEmployees={setSelectedEmployees}
                />
              </div>
            )}

            {/* Loading State */}
            {isFetchingAttendances && (
              <div className="flex items-center gap-2 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest py-1 md:py-0 md:pb-2 shrink-0">
                <Loader className="animate-spin size-4" />
                <span>Fetching...</span>
              </div>
            )}
          </div>

          {/* --- ACTIONS & RECORD COUNT SECTION --- */}
          <div className="flex flex-row flex-wrap items-center justify-between sm:justify-end gap-4 w-full xl:w-auto pt-4 xl:pt-0 border-t xl:border-t-0 border-base-300 xl:border-l xl:pl-4 shrink-0">
            {showExportButton && (
              <button
                onClick={() => setIsDtrModalOpen(true)}
                className="btn btn-sm btn-success text-success-content shadow-sm gap-2 flex-1 sm:flex-none font-bold uppercase tracking-widest text-[10px]"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export DTR</span>
                <span className="sm:hidden">Export</span>
              </button>
            )}

            <div className="text-xs font-bold text-base-content/50 uppercase tracking-widest whitespace-nowrap shrink-0 text-right">
              {filteredAttendances.length} Record
              {filteredAttendances.length !== 1 ? "s" : ""}
            </div>
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
