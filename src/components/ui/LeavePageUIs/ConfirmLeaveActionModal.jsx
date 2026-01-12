import { CheckCircle, X } from "lucide-react";

const ConfirmLeaveActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionData, // { id, status, fullname }
  isProcessing,
}) => {
  if (!isOpen || !actionData) return null;

  const isApprove = actionData.status === "Approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl border border-base-300 p-6 flex flex-col items-center text-center">
        
        {/* Dynamic Icon Circle */}
        <div
          className={`size-14 rounded-full flex items-center justify-center mb-4 ${
            isApprove ? "bg-success/10 text-success" : "bg-error/10 text-error"
          }`}
        >
          {isApprove ? <CheckCircle className="size-7" /> : <X className="size-7" />}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-base-content mb-2">
          {isApprove ? "Approve Request?" : "Reject Request?"}
        </h3>

        {/* Description */}
        <p className="text-sm text-base-content/60 mb-8 leading-relaxed">
          Are you sure you want to 
          <strong className={isApprove ? "text-success" : "text-error"}>
            {isApprove ? " APPROVE " : " REJECT "}
          </strong>
          the leave request for <br />
          <strong className="text-base-content font-semibold">
            {actionData.fullname}
          </strong>?
        </p>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`btn w-full rounded-xl text-white font-bold border-none hover:brightness-90 ${
              isApprove ? "btn-success" : "btn-error"
            }`}
          >
            {isProcessing ? (
              <span className="loading loading-spinner loading-sm text-white"></span>
            ) : (
              isApprove ? "Yes, Approve It" : "Yes, Reject It"
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

export default ConfirmLeaveActionModal;