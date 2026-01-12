import { useState } from "react";
import {
  ImageIcon,
  Pencil,
  Trash,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import AttendanceVerificationModal from "./AttendanceVerificationModal";

const AttendanceTableList = ({
  attendances,
  isFetchingAttendances,
  onEdit,
  onDelete,
  onVerify,
}) => {
  const [modalData, setModalData] = useState({
    isOpen: false,
    recordId: null,
    type: null,
    photo: null,
    time: null,
    currentStatus: null,
    employeeName: null,
  });

  // --- HELPER FUNCTIONS ---
  const formatTime = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case "Verified":
        return "badge-success text-white border-none";
      case "Rejected":
        return "badge-error text-white border-none";
      default:
        return "badge-warning text-warning-content";
    }
  };

  // --- ACTIONS ---
  const openVerificationModal = (record, type) => {
    const isTimeIn = type === "in";
    setModalData({
      isOpen: true,
      recordId: record.id,
      type: type,
      photo: isTimeIn ? record.photo_in : record.photo_out,
      time: isTimeIn ? record.time_in : record.time_out,
      currentStatus: isTimeIn ? record.status_in : record.status_out,
      employeeName: record.fullname,
    });
  };

  const closeModal = () => setModalData({ ...modalData, isOpen: false });

  const handleVerificationAction = (id, type, status) => {
    if (onVerify) onVerify(id, type, status);
    closeModal();
  };

  // --- NEW LOGIC: Check Time Thresholds ---
  const checkTimeFlag = (timeString, type) => {
    if (!timeString) return false;

    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;

    // 1. Late: If Clock In > 8:15 AM
    // 8:15 AM = (8 * 60) + 15 = 495 minutes
    if (type === "in") {
      return totalMinutes > 495;
    }

    // 2. Undertime: If Clock Out < 5:00 PM (17:00)
    // 17:00 = 17 * 60 = 1020 minutes
    if (type === "out") {
      return totalMinutes < 1020;
    }

    return false;
  };

  // --- TABLE CELL RENDERER ---
  const TimeCell = ({ record, type }) => {
    const isTimeIn = type === "in";
    const time = isTimeIn ? record.time_in : record.time_out;
    const status = isTimeIn ? record.status_in : record.status_out;
    const photo = isTimeIn ? record.photo_in : record.photo_out;

    // Check for Late or Undertime
    const isFlagged = checkTimeFlag(time, type);
    const flagLabel = type === "in" ? "LATE" : "UNDERTIME";

    if (!time)
      return (
        <span className="text-base-content/30 italic text-xs">-- : --</span>
      );

    return (
      <div className="flex flex-col gap-1.5 items-start">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs">
            {formatTime(time)}
          </span>
          {/* Verification Badge */}
          <span
            className={`badge badge-xs text-[10px] font-bold uppercase tracking-wider ${getVerificationBadge(
              status
            )}`}
          >
            {status || "Pending"}
          </span>
        </div>

        {/* --- NEW: Late / Undertime Badge --- */}
        {isFlagged && (
          <div className="flex items-center gap-1 text-error bg-error/10 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
            <AlertTriangle className="size-3" />
            {flagLabel}
          </div>
        )}

        <div className="flex items-center gap-1">
          {photo ? (
            <div className="tooltip" data-tip="Verify Photo">
              <button
                onClick={() => openVerificationModal(record, type)}
                className={`btn btn-xs btn-square h-6 w-6 min-h-0 rounded-md transition-colors ${
                  status === "Pending"
                    ? "btn-warning text-warning-content animate-pulse"
                    : "btn-ghost bg-base-200 text-base-content/60"
                }`}
              >
                <ImageIcon className="size-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-error flex items-center gap-1 opacity-70">
              <AlertCircle className="size-3" /> No Photo
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="overflow-hidden border border-base-200 rounded-xl">
        <table className="table w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-base-200 text-base-content/60 uppercase text-xxs tracking-wider font-bold">
              <th className="py-4 pl-6 border-b border-base-300">Employee</th>
              <th className="py-4 border-b border-base-300">Date</th>
              <th className="py-4 border-b border-base-300">Clock In</th>
              <th className="py-4 border-b border-base-300">Clock Out</th>
              <th className="py-4 border-b border-base-300 text-center">
                Summary
              </th>
              <th className="py-4 pr-6 border-b border-base-300 text-center">
                Manage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300 bg-base-100">
            {isFetchingAttendances ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-16 text-center text-base-content/50"
                >
                  <span className="loading loading-spinner loading-md"></span>
                </td>
              </tr>
            ) : attendances.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-16 text-center text-base-content/50"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              attendances.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-base-200/40 transition-colors group"
                >
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-9 h-9">
                          <span className="text-xs font-bold">
                            {record.initials || getInitials(record.fullname)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-base-content">
                          {record.fullname}
                        </span>
                        <span className="text-xs text-base-content/50">
                          {record.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-xs font-medium text-base-content/80">
                    {formatDate(record.date)}
                  </td>
                  <td className="py-4">
                    <TimeCell record={record} type="in" />
                  </td>
                  <td className="py-4">
                    <TimeCell record={record} type="out" />
                  </td>
                  <td className="py-4 text-center">
                    <span
                      className={`badge badge-sm font-bold border-none ${
                        record.attendance_status === "Present"
                          ? "bg-success/15 text-success"
                          : "bg-base-300 text-base-content/60"
                      }`}
                    >
                      {record.attendance_status || "Present"}
                    </span>
                  </td>
                  <td className="py-4 pr-6">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit && onEdit(record)}
                        className="btn btn-ghost btn-square btn-sm"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(record.id)}
                        className="btn btn-ghost btn-square btn-sm hover:text-error"
                      >
                        <Trash className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AttendanceVerificationModal
        isOpen={modalData.isOpen}
        data={modalData}
        onClose={closeModal}
        onVerify={handleVerificationAction}
      />
    </>
  );
};

export default AttendanceTableList;
