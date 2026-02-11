import React, { useState } from "react";
import {
  MoreVertical,
  Users,
  Globe,
  Coins,
  CalendarDays,
  Trash2,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatUtils";
import { useAllowanceStore } from "@/stores/useAllowanceStore";
import { useAuthStore } from "@/stores/useAuthStore";

const AllowanceCard = ({ plan, onManage, onDelete }) => {
  const { toggleStatus } = useAllowanceStore();
  const { authUser } = useAuthStore();

  const subscribers = plan.subscribers || [];
  const isGlobal = plan.is_global;
  const isPaused = plan.status === "PAUSED";

  // Check if current user is assigned
  const isAssignedToMe =
    isGlobal || subscribers.some((sub) => sub.user_id === authUser?.id);
  const canManage = onManage !== undefined || onDelete !== undefined;

  // Theme Configuration
  const theme = {
    accent: isPaused
      ? "bg-gray-400"
      : isGlobal
        ? "bg-emerald-500"
        : "bg-teal-500",
    bg: isPaused ? "bg-gray-100" : isGlobal ? "bg-emerald-50" : "bg-teal-50",
    text: isPaused
      ? "text-gray-500"
      : isGlobal
        ? "text-emerald-700"
        : "text-teal-700",
  };

  // --- HELPER: Renders the name list nicely ---
  const renderSubscriberNames = () => {
    // 1. If I am an Employee (Viewer) AND I am assigned
    if (!canManage && isAssignedToMe) {
      return (
        <span className="font-bold text-emerald-600 flex items-center gap-1">
          <CheckCircle2 size={12} /> Applied to you
        </span>
      );
    }

    // 2. If I am an Employee (Viewer) AND NOT assigned
    if (!canManage && !isAssignedToMe) {
      return <span className="opacity-40 italic">Not applied to you</span>;
    }

    // 3. If I am a Manager
    if (subscribers.length === 0) return "No employees assigned yet.";

    const firstTwo = subscribers
      .slice(0, 2)
      .map((u) => u.fullname)
      .join(", ");
    const remainingCount = subscribers.length - 2;

    if (remainingCount > 0) {
      return (
        <div
          className="tooltip tooltip-bottom text-left cursor-help z-50"
          data-tip={subscribers.map((s) => s.fullname).join(", ")}
        >
          <span className="font-semibold text-xs">{firstTwo}</span>
          <span className="opacity-60 text-xs ml-1">
            {" "}
            + {remainingCount} others
          </span>
        </div>
      );
    }
    return <span className="font-semibold text-xs">{firstTwo}</span>;
  };

  return (
    <div
      className={`card bg-base-100 shadow-sm border border-base-200 relative overflow-visible group hover:shadow-md transition-all duration-300 ${isPaused ? "opacity-75 grayscale-[0.5]" : ""}`}
    >
      {/* Left Border Accent Stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${theme.accent}`}
      ></div>

      <div className="card-body p-5 pl-7 h-full flex flex-col justify-between">
        {/* --- HEADER --- */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="w-full pr-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {/* STATUS BADGE */}
                {isPaused ? (
                  <span className="badge badge-xs font-bold py-2 border-none bg-gray-200 text-gray-600 tracking-wider">
                    PAUSED
                  </span>
                ) : (
                  <span
                    className={`badge badge-xs font-bold py-2 border-none ${theme.bg} ${theme.text} tracking-wider`}
                  >
                    {isGlobal ? "GLOBAL" : "SPECIFIC"}
                  </span>
                )}
                <span className="text-[10px] font-medium opacity-40 flex items-center gap-1">
                  <CalendarDays size={10} /> {formatDate(plan.created_at)}
                </span>
              </div>
              <h3 className="card-title text-lg font-bold text-base-content leading-tight">
                {plan.name}
              </h3>
            </div>

            {/* Actions Dropdown */}
            {(onDelete || onManage) && (
              <div className="dropdown dropdown-end flex-shrink-0 -mr-2">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle btn-sm opacity-40 hover:opacity-100"
                >
                  <MoreVertical size={18} />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-1 shadow-xl bg-base-100 rounded-xl w-44 border border-base-200 text-xs mt-1"
                >
                  <li>
                    <a
                      onClick={() => toggleStatus(plan.id)}
                      className="py-2 gap-3 font-medium"
                    >
                      {isPaused ? (
                        <>
                          <PlayCircle size={14} className="text-emerald-600" />{" "}
                          Resume
                        </>
                      ) : (
                        <>
                          <PauseCircle size={14} className="text-warning" />{" "}
                          Pause
                        </>
                      )}
                    </a>
                  </li>

                  {/* MANAGED USERS REMOVED HERE */}

                  {onDelete && (
                    <>
                      <div className="divider my-0"></div>
                      <li>
                        <a
                          onClick={onDelete}
                          className="text-error py-2 gap-3 font-medium"
                        >
                          <Trash2 size={14} /> Delete
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* --- AMOUNT --- */}
          <div className="flex items-center gap-3 mt-4">
            <div className={`p-3 rounded-2xl ${theme.bg} ${theme.text}`}>
              <Coins size={24} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                Allowance Amount
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-base-content tabular-nums tracking-tight">
                  {formatCurrency(plan.amount)}
                </span>
                <span className="text-xs font-bold opacity-40">/ payroll</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER (DYNAMIC) --- */}
        <div className="mt-4 border-t border-base-200 pt-3 text-xs min-h-[40px] flex items-center">
          {isGlobal ? (
            <div className="flex items-center gap-2 opacity-50">
              <Globe size={14} />
              <p className="italic">
                {!canManage
                  ? "Applied to you (Global)"
                  : "All active employees included."}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-base-content/80 w-full">
              <Users size={14} className="mt-0.5 flex-shrink-0 opacity-50" />

              {/* Name List Container */}
              <div className="leading-tight flex-1">
                {renderSubscriberNames()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllowanceCard;
