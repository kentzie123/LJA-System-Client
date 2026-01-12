import { Trash2 } from "lucide-react";

const DeleteLeaveModal = ({
  isOpen,
  onClose,
  onConfirm,
  leaveRequest, // Changed from 'record' to 'leaveRequest' for clarity
  isDeleting,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "...";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl border border-base-300 p-6 flex flex-col items-center text-center">
        {/* Icon Circle */}
        <div className="size-14 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <Trash2 className="size-7 text-error" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-base-content mb-2">
          Delete Request?
        </h3>

        {/* Description */}
        <p className="text-sm text-base-content/60 mb-8 leading-relaxed">
          You are about to delete the
          <strong className="text-base-content font-semibold">
            {" "}
            {leaveRequest?.leave_type}{" "}
          </strong>
          request for{" "}
          <strong className="text-base-content font-semibold">
            {leaveRequest?.fullname || "this employee"}
          </strong>{" "}
          starting on{" "}
          <strong className="text-base-content font-semibold">
            {formatDate(leaveRequest?.start_date)}
          </strong>
          . This cannot be undone.
        </p>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-error w-full rounded-xl text-white font-bold hover:brightness-90 border-none"
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-sm text-white"></span>
            ) : (
              "Yes, Delete Request"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="btn bg-base-200 hover:bg-base-300 text-base-content w-full rounded-xl border-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteLeaveModal;
