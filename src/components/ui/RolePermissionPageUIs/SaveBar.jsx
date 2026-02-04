import { AlertCircle, RotateCcw, Save } from "lucide-react";

const SaveBar = ({ hasChanges, isUpdating, onReset, onSave }) => {
  return (
    <div className={`fixed bottom-6 left-0 right-0 z-50 px-4 transition-all duration-300 transform ${hasChanges ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}>
      <div className="max-w-2xl mx-auto bg-base-300 text-base-content px-6 py-3 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-base-content/10 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-warning size-5 shrink-0" />
          <span className="font-medium text-sm">You have unsaved changes.</span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={onReset} className="btn btn-sm btn-ghost text-base-content/70 hover:bg-base-content/10 flex-1 sm:flex-none">
            <RotateCcw className="size-4 mr-1" /> Reset
          </button>
          <button onClick={onSave} disabled={isUpdating} className="btn btn-sm btn-primary text-primary-content px-6 shadow-md flex-1 sm:flex-none">
            {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : <Save className="size-4 mr-1" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveBar;