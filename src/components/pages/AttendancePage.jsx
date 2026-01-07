"use client";

import { useState, useEffect } from "react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";
import { useUserStore } from "@/stores/useUserStore";

import TopBar from "../layout/TopBar";
import ToggleListGrid from "../ui/Buttons/ToggleListGrid";
import AttendanceTableList from "../ui/AttendancePageUIs/AttendanceTableList";
import AddNewAttendanceModal from "../ui/AttendancePageUIs/AddNewAttendanceModal";
import { Plus } from "lucide-react";

const AttendancePage = () => {
  const { fetchAllAttendances, attendances, isFetchingAttendances } =
    useAttendanceStore();
  const { fetchAllUsers, users } = useUserStore();

  const [view, setView] = useState("list");
  // 1. New state to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAllAttendances();
    fetchAllUsers();
  }, [fetchAllAttendances, fetchAllUsers]);

  return (
    <div className="space-y-6">
      <TopBar title={"Attendance"} />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-base-content">
              Attendance
            </div>
            <div className="text-sm opacity-65 text-base-content">
              Verify employee photos and manage records.
            </div>
          </div>
          <div className="flex items-stretch space-x-2">
            {/* 2. Update onClick to set state to true */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary text-primary-content font-medium px-6"
            >
              <Plus className="size-4" /> <span>Add Record</span>
            </button>
            <ToggleListGrid setView={setView} view={view} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-200 shadow-sm">
          <AttendanceTableList
            attendances={attendances}
            isFetchingAttendances={isFetchingAttendances}
          />
        </div>
      </div>

      {/* 3. Pass isOpen and onClose props to the new Modal */}
      <AddNewAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
      />
    </div>
  );
};

export default AttendancePage;
