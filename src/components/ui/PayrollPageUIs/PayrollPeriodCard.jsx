// Icons
import { ChevronRight, Users, Trash2 } from "lucide-react";

// Store
import { usePayrollStore } from "@/stores/usePayrollStore";

const PayrollPeriodCard = ({ run, isActive, onClick, onDelete }) => {
  const { setActiveRun } = usePayrollStore();

  // Format dates
  const payDate = new Date(run.pay_date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const s = new Date(run.start_date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const e = new Date(run.end_date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const cutoffLabel = `${s} - ${e}`;

  const onDeletePayrun = () => {
    setActiveRun(run);
    onDelete();
  };

  // Status Badge Logic
  const getStatusStyles = (status) => {
    switch (status) {
      case "Paid":
        return "text-success border-success/20 bg-success/10";
      case "Approved":
        return "text-info border-info/20 bg-info/10";
      case "Draft":
        return "text-warning border-warning/20 bg-warning/10";
      default:
        return "text-base-content/40 border-base-content/10 bg-base-content/5";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg border transition-all duration-200 group relative
        flex flex-col gap-1
        ${
          isActive
            ? "bg-primary/5 border-primary shadow-[0_0_15px_-5px_rgba(var(--p)/0.2)]"
            : "bg-base-100 border-white/5 hover:bg-base-200 hover:border-white/10"
        }
      `}
    >
      {/* DELETE BUTTON (Visible on Hover) */}
      <div
        onClick={onDeletePayrun}
        className="absolute cursor-pointer top-2 right-2 p-2 text-base-content/30 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20"
        title="Delete Payroll"
      >
        <Trash2 size={14} />
      </div>

      {/* Top Row: Title & Badge */}
      <div className="flex justify-between items-start w-full mb-1 pr-6">
        <span
          className={`text-sm font-bold ${
            isActive ? "text-primary" : "text-base-content"
          }`}
        >
          {payDate}
        </span>

        <span
          className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${getStatusStyles(
            run.status
          )}`}
        >
          {run.status}
        </span>
      </div>

      {/* Middle Row: Date Range */}
      <div className="text-xs opacity-50 font-medium">
        Cut-off: {cutoffLabel}
      </div>

      {/* Bottom Row: Employee Count */}
      <div className="flex items-center gap-1.5 mt-2 opacity-40">
        <Users size={12} />
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {/* Placeholder for now, later we map this to real count */}3
          Employees
        </span>
      </div>

      {/* Active Arrow Indicator */}
      {isActive && (
        <ChevronRight
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-80"
          size={16}
        />
      )}
    </button>
  );
};

export default PayrollPeriodCard;
