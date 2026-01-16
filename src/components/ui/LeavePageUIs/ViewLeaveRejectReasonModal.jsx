import { X, Info } from "lucide-react";

const ViewLeaveRejectReasonModal = ({ isOpen, onClose, reason }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-2xl shadow-xl border border-base-300 p-6 relative scale-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-base-content/50 hover:text-base-content"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="size-12 rounded-full bg-base-200 flex items-center justify-center mb-4">
            <Info className="size-6 text-base-content/70" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold mb-4 text-base-content">
            Rejection Reason
          </h3>

          {/* Reason Text Box */}
          <div className="bg-base-200/50 p-4 rounded-xl w-full text-sm text-base-content/80 italic border border-base-200 leading-relaxed break-words whitespace-pre-wrap max-h-60 overflow-y-auto">
            "{reason || "No reason provided."}"
          </div>

          {/* Close Action */}
          <button
            onClick={onClose}
            className="btn btn-primary w-full mt-6 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveRejectReasonModal;
