import { useState } from "react";
import { AlertCircle } from "lucide-react";

const OvertimeRejectReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Validation removed: Reason is now optional
    onConfirm(reason);
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl border border-base-300 p-6 flex flex-col items-center scale-in-95 duration-200">
        {/* Icon */}
        <div className="size-14 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <AlertCircle className="size-7 text-error" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-base-content mb-2">
          Reject Request
        </h3>

        {/* Description */}
        <p className="text-sm text-base-content/60 mb-6 text-center leading-relaxed">
          Are you sure you want to reject this overtime request? You can provide
          an
          <span className="font-semibold text-base-content/80"> optional </span>
          reason below.
        </p>

        {/* Text Area */}
        <div className="w-full mb-6">
          <textarea
            className="textarea textarea-bordered w-full h-24 text-sm resize-none"
            placeholder="Reason for rejection (Optional)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          ></textarea>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="btn btn-error w-full rounded-xl text-white font-bold hover:brightness-90 border-none"
          >
            {isProcessing ? (
              <span className="loading loading-spinner loading-sm text-white"></span>
            ) : (
              "Confirm Rejection"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="btn bg-base-200 hover:bg-base-300 text-base-content w-full rounded-xl border-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OvertimeRejectReasonModal;
