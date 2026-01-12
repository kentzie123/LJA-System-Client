import { X, CheckCircle, XCircle, ImageIcon } from "lucide-react";

const AttendanceVerificationModal = ({ isOpen, onClose, onVerify, data }) => {
  if (!isOpen || !data) return null;

  const { recordId, type, photo, time, currentStatus, employeeName } = data;

  // Helper: Badge Color
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

  // Helper: Format Time
  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <div>
            <h3 className="font-bold text-lg">
              Verify {type === "in" ? "Clock In" : "Clock Out"}
            </h3>
            <p className="text-xs opacity-60">Employee: {employeeName}</p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 items-center">
          {/* Time & Status */}
          <div className="text-center">
            <span className="text-3xl font-mono font-black tracking-tight">
              {formatTime(time)}
            </span>
            <div
              className={`badge ml-2 ${getVerificationBadge(currentStatus)}`}
            >
              {currentStatus}
            </div>
          </div>

          {/* Photo Preview */}
          <div className="relative rounded-xl overflow-hidden border-4 border-base-300 shadow-inner bg-black w-full aspect-[4/3]">
            {photo ? (
              <img
                src={photo}
                alt="Attendance Proof"
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-base-content/30">
                <ImageIcon className="size-12 mb-2" />
                <span>No Photo Evidence</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-base-200/50 border-t border-base-200 flex justify-between gap-3">
          <button
            onClick={() => onVerify(recordId, type, "Rejected")}
            className="btn btn-error flex-1 text-white shadow-sm"
          >
            <XCircle className="size-5" /> Reject
          </button>
          <button
            onClick={() => onVerify(recordId, type, "Verified")}
            className="btn btn-success flex-1 text-white shadow-sm"
          >
            <CheckCircle className="size-5" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceVerificationModal;
