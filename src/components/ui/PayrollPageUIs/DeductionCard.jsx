import React from "react";
import { 
  MoreVertical, 
  History, 
  Globe, 
  Wallet,
  CalendarDays,
  PauseCircle,
  PlayCircle,
  Trash2,
  CheckCircle2,
  Users,
  TrendingUp 
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatUtils";
import { useAuthStore } from "@/stores/useAuthStore";

const DeductionCard = ({ plan, onToggle, onDelete }) => {
  const { authUser } = useAuthStore();
  
  const isGlobal = plan.is_global;
  const isPaused = plan.status === "PAUSED";
  const subscribers = plan.subscribers || [];
  
  // --- STRICT ROLE CHECK ---
  const roleId = authUser?.role?.id || authUser?.role_id;
  const isAdmin = roleId === 1 || roleId === 3;

  // --- PERSONALIZATION LOGIC ---
  const mySubscription = !isAdmin 
    ? subscribers.find(s => s.user_id === authUser?.id) 
    : null;

  const isAssignedToMe = isGlobal || !!mySubscription;

  // --- CALCULATE LOAN VALUES ---
  let displayLimit = 0;
  let displayCollected = 0;
  let displayLabel = "COMPANY WIDE";

  if (isAdmin) {
    displayLimit = parseFloat(plan.total_loan_value || 0);
    displayCollected = parseFloat(plan.total_collected || 0);
    if (!isGlobal) displayLabel = "SPECIFIC EMPLOYEES";
  } else {
    if (isGlobal) {
       displayLabel = "APPLIED TO YOU (GLOBAL)";
    } else {
       displayLimit = parseFloat(mySubscription?.loan_total || 0);
       displayCollected = parseFloat(mySubscription?.loan_paid || 0);
       displayLabel = isAssignedToMe ? "APPLIED TO YOU" : "NOT APPLIED";
    }
  }

  const isLoan = displayLimit > 0;
  
  const progressPercent = isLoan 
    ? Math.min(100, Math.max(0, (displayCollected / displayLimit) * 100)) 
    : 0;

  const isComplete = progressPercent >= 100;
  const progressColor = isComplete ? "bg-success" : "bg-primary";
  const progressText = isComplete ? "text-success" : "text-primary";

  // --- THEME CONFIG ---
  const config = {
    color: isGlobal ? "bg-primary" : "bg-emerald-500",
    text: isGlobal ? "text-primary" : "text-emerald-600",
    bg: isGlobal ? "bg-primary/10" : "bg-emerald-500/10",
  };

  const Icon = isLoan ? History : (isGlobal ? Globe : Wallet);

  // --- HELPER: Subscriber Names ---
  const renderSubscriberNames = () => {
    if (!isAdmin) {
        if (isAssignedToMe) {
            return (
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Applied to you
                </span>
            );
        } else {
             return <span className="opacity-40 italic">Not applied to you</span>;
        }
    }

    if (subscribers.length === 0) return "No employees assigned yet.";

    const firstTwo = subscribers.slice(0, 2).map(u => u.fullname).join(", ");
    const remainingCount = subscribers.length - 2;

    if (remainingCount > 0) {
      return (
        <div className="dropdown dropdown-hover dropdown-top dropdown-end z-50">
          <div tabIndex={0} className="cursor-help flex items-center flex-wrap">
            <span className="font-semibold text-xs text-base-content/80 whitespace-nowrap">
              {firstTwo}
            </span>
            <span className="font-bold text-[10px] ml-1 bg-base-200 hover:bg-base-300 transition-colors px-1.5 py-0.5 rounded text-base-content/60 whitespace-nowrap">
              +{remainingCount} more
            </span>
          </div>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow-2xl bg-base-100 rounded-xl w-56 border border-base-300 max-h-56 overflow-y-auto custom-scrollbar flex-nowrap z-[100] mb-2">
            <li className="menu-title px-2 py-1 text-[10px] uppercase opacity-60 tracking-wider">
              Assigned ({subscribers.length})
            </li>
            {subscribers.map((sub) => (
              <li key={sub.user_id}>
                <span className="py-1.5 px-2 text-xs font-medium">{sub.fullname}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return <span className="font-semibold text-xs text-base-content/80">{firstTwo}</span>;
  };

  return (
    <div className={`card bg-base-100 shadow-sm hover:shadow-md border border-base-200/60 relative group transition-all duration-300 flex flex-col ${isPaused ? "opacity-70 grayscale-[0.5]" : ""}`}>
      
      {/* Left Accent Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${isLoan ? "bg-primary" : config.color}`}></div>

      <div className="card-body p-5 pl-6 flex flex-col flex-1">
        
        {/* --- 1. TOP HEADER & AMOUNT --- */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col gap-1.5 pr-2"> 
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge badge-sm font-bold border-none ${isLoan ? 'bg-primary/10 text-primary' : config.bg + ' ' + config.text}`}>
                  {isLoan ? "LOAN DEDUCTION" : displayLabel}
                </span>
                <span className="text-[10px] font-medium opacity-40 flex items-center gap-1">
                  <CalendarDays size={10} /> {formatDate(plan.created_at)}
                </span>
              </div>
              <h3 className="card-title text-lg font-bold text-base-content leading-tight">
                {plan.name}
              </h3>
            </div>

            {/* DROPDOWN MENU */}
            {(onDelete || onToggle) && (
              <div className="dropdown dropdown-end flex-shrink-0 -mr-2 z-50">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm opacity-40 hover:opacity-100">
                  <MoreVertical size={18} />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-1 shadow-xl bg-base-100 rounded-xl w-44 border border-base-200 text-xs mt-1">
                  {onToggle && (
                    <li>
                      <a onClick={onToggle} className="py-2 gap-3 font-medium">
                        {isPaused ? (
                          <><PlayCircle size={14} className="text-emerald-600" /> Resume</>
                        ) : (
                          <><PauseCircle size={14} className="text-warning" /> Pause</>
                        )}
                      </a>
                    </li>
                  )}
                  {onDelete && (
                    <>
                      <div className="divider my-0"></div>
                      <li>
                        <a onClick={onDelete} className="text-error py-2 gap-3 font-medium">
                          <Trash2 size={14} /> Delete
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isLoan ? 'bg-primary/10 text-primary' : config.bg + ' ' + config.text}`}>
              <Icon size={24} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-0.5">Deducting</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-base-content tracking-tight">
                  {plan.deduction_type === "PERCENTAGE" ? `${plan.amount}%` : formatCurrency(plan.amount)}
                </span>
                <span className="text-[11px] font-bold opacity-40 uppercase">/ Pay period</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. MIDDLE: LOAN PROGRESS BAR --- */}
        {isLoan && (
          <div className="w-full bg-base-200/50 p-3 rounded-xl border border-base-200 mt-4">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-60">
                <TrendingUp size={12} />
                Total Progress
              </div>
              <span className={`text-xs font-black ${progressText}`}>
                {progressPercent.toFixed(0)}%
              </span>
            </div>

            <div className="relative h-2 w-full bg-base-300 rounded-full overflow-hidden mb-2 shadow-inner">
              <div 
                className={`absolute top-0 left-0 h-full ${progressColor} transition-all duration-1000 ease-out`} 
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-30"></div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-1">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase opacity-40 tracking-wider">Paid</span>
                <span className="text-xs font-black text-base-content">{formatCurrency(displayCollected)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase opacity-40 tracking-wider">Total</span>
                <span className="text-xs font-black text-base-content/60">{formatCurrency(displayLimit)}</span>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. BOTTOM: SUBSCRIBER LIST --- */}
        <div className="mt-auto pt-4">
          <div className="border-t border-base-200/60 pt-3 flex items-center min-h-[36px]">
            {isGlobal ? (
               <div className="flex items-center gap-2 text-primary/70 bg-primary/5 px-3 py-1.5 rounded-lg w-full">
                 <Globe size={14} />
                 <span className="text-xs font-semibold">
                   {!isAdmin ? "Applied to you (Global)" : "Applied to all active employees."}
                 </span>
               </div>
            ) : (
              <div className="flex items-start gap-2 bg-base-200/30 px-3 py-2 rounded-lg w-full border border-base-200/50">
                <Users size={14} className="mt-0.5 flex-shrink-0 text-base-content/40" />
                <div className="leading-tight flex-1">
                   {renderSubscriberNames()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PAUSED OVERLAY */}
        {isPaused && (
          <div className="absolute top-4 right-14 badge badge-warning gap-1 font-bold shadow-sm animate-pulse border-none">
            <PauseCircle size={12} /> PAUSED
          </div>
        )}

      </div>
    </div>
  );
};

export default DeductionCard;