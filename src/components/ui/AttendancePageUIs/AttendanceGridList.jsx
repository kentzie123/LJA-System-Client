import { useState, useMemo } from "react";
import {
  Check,
  Trash,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

const AttendanceGridList = ({ attendances, onVerify, onDelete }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());

  // --- 1. TIME CHECK LOGIC (New) ---
  const checkTimeFlag = (timeString, type) => {
    if (!timeString) return false;

    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;

    // Late: If Clock In > 8:15 AM (495 mins)
    if (type === "in") {
      return totalMinutes > 495;
    }

    // Undertime: If Clock Out < 5:00 PM (1020 mins)
    if (type === "out") {
      return totalMinutes < 1020;
    }

    return false;
  };

  // --- 2. FLATTEN DATA ---
  const gridItems = useMemo(() => {
    const items = [];
    attendances.forEach((record) => {
      if (record.time_in) {
        items.push({
          uniqueKey: `${record.id}-in`,
          id: record.id,
          type: "in",
          time: record.time_in,
          photo: record.photo_in,
          status: record.status_in,
          fullname: record.fullname,
          initials: record.initials,
          email: record.email,
        });
      }
      if (record.time_out) {
        items.push({
          uniqueKey: `${record.id}-out`,
          id: record.id,
          type: "out",
          time: record.time_out,
          photo: record.photo_out,
          status: record.status_out,
          fullname: record.fullname,
          initials: record.initials,
          email: record.email,
        });
      }
    });
    return items;
  }, [attendances]);

  // --- SELECTION LOGIC ---
  const toggleSelection = (uniqueKey) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(uniqueKey)) newSet.delete(uniqueKey);
    else newSet.add(uniqueKey);
    setSelectedItems(newSet);
  };

  const toggleSelectPending = () => {
    const newSet = new Set();
    const pendingItems = gridItems.filter((i) => i.status === "Pending");
    const allPendingSelected = pendingItems.every((i) =>
      selectedItems.has(i.uniqueKey)
    );

    if (!allPendingSelected) {
      pendingItems.forEach((i) => newSet.add(i.uniqueKey));
    }
    setSelectedItems(newSet);
  };

  // --- BULK ACTIONS ---
  const handleBulkAction = (actionStatus) => {
    Array.from(selectedItems).forEach((uniqueKey) => {
      const [id, type] = uniqueKey.split("-");
      if (onVerify) {
        onVerify(parseInt(id), type, actionStatus);
      }
    });
    setSelectedItems(new Set());
  };

  // --- HELPER: Status Color ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Verified":
        return "bg-success text-success-content";
      case "Rejected":
        return "bg-error text-error-content";
      default:
        return "bg-warning text-warning-content";
    }
  };

  return (
    <div className="space-y-4">
      {/* --- BULK ACTION BAR --- */}
      <div className="navbar bg-base-200 rounded-xl px-4 min-h-[3rem] border border-base-300 gap-4 transition-all">
        <div className="flex-1 gap-4 items-center">
          <button
            onClick={toggleSelectPending}
            className="btn btn-sm btn-ghost gap-2 normal-case"
          >
            <div
              className={`checkbox checkbox-sm ${
                selectedItems.size > 0 ? "checkbox-primary" : ""
              }`}
              readOnly
              checked={
                selectedItems.size > 0 &&
                gridItems
                  .filter((i) => i.status === "Pending")
                  .every((i) => selectedItems.has(i.uniqueKey))
              }
            />
            Select Pending
          </button>

          {selectedItems.size > 0 && (
            <span className="text-sm font-bold text-primary animate-in fade-in slide-in-from-left-2">
              {selectedItems.size} selected
            </span>
          )}
        </div>

        {selectedItems.size > 0 && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
            <button
              onClick={() => handleBulkAction("Rejected")}
              className="btn btn-sm btn-outline btn-error gap-2"
            >
              <XCircle className="size-4" /> Reject Selected
            </button>
            <button
              onClick={() => handleBulkAction("Verified")}
              className="btn btn-sm btn-primary gap-2"
            >
              <CheckCircle className="size-4" /> Verify Selected
            </button>
          </div>
        )}
      </div>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {gridItems.map((item) => {
          const isSelected = selectedItems.has(item.uniqueKey);

          // Calculate Flag for this specific card
          const isFlagged = checkTimeFlag(item.time, item.type);
          const flagLabel = item.type === "in" ? "LATE" : "UNDERTIME";

          return (
            <div
              key={item.uniqueKey}
              onClick={() => toggleSelection(item.uniqueKey)}
              className={`
                group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200
                ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 scale-[0.98]"
                    : "border-base-300 hover:border-base-content/20"
                }
              `}
            >
              {/* 1. Background Photo */}
              {item.photo ? (
                <img
                  src={item.photo}
                  alt="Proof"
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full bg-neutral flex flex-col items-center justify-center text-neutral-content/30">
                  <Clock className="size-10 mb-2" />
                  <span className="text-xs">No Photo</span>
                </div>
              )}

              {/* 2. Overlays (Gradient) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 p-3 flex flex-col justify-between">
                {/* Top Row: Checkbox + Status */}
                <div className="flex justify-between items-start">
                  <div
                    className={`
                    rounded-full p-1 transition-colors
                    ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-black/40 text-white/50 group-hover:bg-white/20"
                    }
                  `}
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </div>

                  <span
                    className={`badge badge-sm font-bold border-none ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Bottom Row: Details */}
                <div className="space-y-1">
                  <div className="flex justify-between items-end">
                    <div>
                      {/* Label + Late/Undertime Badge */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                          CLOCK {item.type.toUpperCase()}
                        </p>

                        {/* --- NEW BADGE --- */}
                        {isFlagged && (
                          <span className="flex items-center gap-1 bg-error text-white px-1.5 py-[1px] rounded-[3px] text-[8px] font-bold uppercase tracking-wide">
                            <AlertTriangle className="size-2" />
                            {flagLabel}
                          </span>
                        )}
                      </div>

                      <p className="text-xl font-black text-white tracking-tight">
                        {new Date(`1970-01-01T${item.time}`).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit", hour12: false }
                        )}
                      </p>
                    </div>

                    {/* Delete Button (Visible on Hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="btn btn-ghost btn-xs btn-circle text-white/40 hover:text-error hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash className="size-4" />
                    </button>
                  </div>

                  {/* Employee Mini Profile */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-6 h-6 text-[10px]">
                        <span>{item.initials || "U"}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-white truncate">
                      {item.fullname}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {gridItems.length === 0 && (
        <div className="text-center py-20 text-base-content/50">
          No verification records found.
        </div>
      )}
    </div>
  );
};

export default AttendanceGridList;
