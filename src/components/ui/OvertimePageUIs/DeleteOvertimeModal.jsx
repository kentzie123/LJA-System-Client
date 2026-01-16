import { AlertTriangle, Loader2, X } from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";

const DeleteOvertimeModal = ({ isOpen, onClose, request }) => {
  const { deleteOvertimeRequest, isDeleting } = useOvertimeStore();

  if (!isOpen || !request) return null;

  const handleDelete = async () => {
    const success = await deleteOvertimeRequest(request.id);
    if (success) {
      onClose();
    }
  };

  // Helper for better readability: "Jan 15, 2026"
  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-2xl shadow-xl border border-base-300 relative scale-in-95 duration-200 overflow-hidden">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-base-content/50 hover:text-base-content"
        >
          <X className="size-4" />
        </button>

        <div className="p-6 flex flex-col items-center text-center">
          <div className="size-14 rounded-full bg-error/10 flex items-center justify-center mb-4 text-error">
            <AlertTriangle className="size-7" />
          </div>

          <h3 className="text-lg font-bold text-base-content">
            Delete Request?
          </h3>

          {/* --- IMPROVED DESCRIPTION --- */}
          <div className="text-sm text-base-content/60 mt-2 mb-6">
            Are you sure you want to delete the request for:
            {/* Boxed details for clarity */}
            <div className="bg-base-200/50 rounded-lg p-3 mt-3 mb-1 border border-base-200">
              <div className="font-bold text-base-content">
                {request.fullname}
              </div>
              <div className="text-xs opacity-80">
                {formatDateLong(request.ot_date)} • {request.total_hours} hrs
              </div>
            </div>
            <span className="text-xs text-error/80 block mt-2">
              This action cannot be undone.
            </span>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="btn flex-1"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-error text-white flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOvertimeModal;
