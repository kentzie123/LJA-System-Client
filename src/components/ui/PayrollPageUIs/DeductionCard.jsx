import React from "react";
import { 
  MoreVertical, 
  History, 
  Globe, 
  Wallet,
  CalendarDays,
  PauseCircle,
  PlayCircle, // Added
  Trash2,     // Added
  CheckCircle2,
  Users 
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatUtils";
import { useAuthStore } from "@/stores/useAuthStore";

const DeductionCard = ({ plan, onToggle, onDelete }) => {
  const { authUser } = useAuthStore();
  
  // Basic Props
  const isGlobal = plan.is_global;
  const isPaused = plan.status === "PAUSED";
  const subscribers = plan.subscribers || [];
  
  // Permission Check
  // If handlers are missing, we assume user cannot manage
  const canManage = onToggle || onDelete;

  // --- 1. PERSONALIZATION LOGIC ---
  const mySubscription = !canManage 
    ? subscribers.find(s => s.user_id === authUser?.id) 
    : null;

  const isAssignedToMe = isGlobal || !!mySubscription;

  // --- 2. CALCULATE VALUES ---
  let displayLimit = 0;
  let displayCollected = 0;
  let displayLabel = "COMPANY WIDE";

  if (canManage) {
    // ADMIN VIEW: Show Company Totals
    displayLimit = parseFloat(plan.total_amount || 0);
    displayCollected = parseFloat(plan.total_collected || 0);
    
    if (!isGlobal) {
      displayLabel = "SPECIFIC EMPLOYEES";
    }
  } else {
    // EMPLOYEE VIEW: Show Personal Totals
    if (isGlobal) {
       displayLabel = "APPLIED TO YOU (GLOBAL)";
    } else {
       displayLimit = parseFloat(mySubscription?.loan_total || 0);
       displayCollected = parseFloat(mySubscription?.loan_paid || 0);
       displayLabel = isAssignedToMe ? "APPLIED TO YOU" : "NOT APPLIED";
    }
  }

  // --- 3. PROGRESS MATH ---
  const isLoan = displayLimit > 0;
  const progressPercent = isLoan 
    ? Math.min(100, Math.max(0, Math.round((displayCollected / displayLimit) * 100))) 
    : 0;

  // --- THEME CONFIG ---
  const config = {
    color: isGlobal ? "bg-primary" : "bg-emerald-500",
    text: isGlobal ? "text-primary" : "text-emerald-600",
    bg: isGlobal ? "bg-primary/5" : "bg-emerald-50",
  };

  const Icon = isLoan ? History : (isGlobal ? Globe : Wallet);

  // --- HELPER: Renders the name list nicely ---
  const renderSubscriberNames = () => {
    // 1. Employee View (Assigned)
    if (!canManage && isAssignedToMe) {
        return (
            <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={12} /> Applied to you
            </span>
        );
    }
    
    // 2. Employee View (Not Assigned)
    if (!canManage && !isAssignedToMe) {
         return <span className="opacity-40 italic">Not applied to you</span>;
    }

    // 3. Manager View (Show List)
    if (subscribers.length === 0) return "No employees assigned yet.";

    const firstTwo = subscribers.slice(0, 2).map(u => u.fullname).join(", ");
    const remainingCount = subscribers.length - 2;

    if (remainingCount > 0) {
      return (
        <div className="tooltip tooltip-bottom text-left cursor-help z-50" data-tip={subscribers.map(s => s.fullname).join(", ")}>
          <span className="font-semibold text-xs">{firstTwo}</span>
          <span className="opacity-60 text-xs ml-1"> + {remainingCount} others</span>
        </div>
      );
    }
    return <span className="font-semibold text-xs">{firstTwo}</span>;
  };

  return (
    <div className={`card bg-base-100 shadow-sm border border-base-200 relative overflow-hidden group hover:shadow-md transition-all duration-300 ${isPaused ? "opacity-70 grayscale-[0.5]" : ""}`}>
      
      {/* Left Border Accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.color}`}></div>

      <div className="card-body p-6 pl-6 h-full flex flex-col justify-between">
        
        {/* --- TOP SECTION --- */}
        <div>
          {/* HEADER ROW */}
          <div className="flex justify-between items-start mb-4">
            
            {/* LEFT SIDE: Badge, Date, Title */}
            <div className="flex flex-col gap-1.5 w-full pr-2"> 
              
              {/* Badge & Date Container */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge badge-xs font-bold py-2 border-none h-auto min-h-[1.25rem] whitespace-normal text-left leading-tight ${config.bg} ${config.text} tracking-wider`}>
                  {displayLabel}
                </span>
                
                <span className="text-[10px] font-medium opacity-40 flex items-center gap-1 whitespace-nowrap">
                  <CalendarDays size={10} /> {formatDate(plan.created_at)}
                </span>
              </div>
              
              {/* Title */}
              <h3 className="card-title text-lg font-bold text-base-content leading-tight break-words">
                {plan.name}
              </h3>
            </div>

            {/* RIGHT SIDE: Menu (Exact Copy of Allowance Design) */}
            {(onDelete || onToggle) && (
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
                  {onToggle && (
                    <li>
                      <a
                        onClick={onToggle}
                        className="py-2 gap-3 font-medium"
                      >
                        {isPaused ? (
                          <>
                            <PlayCircle size={14} className="text-emerald-600" />
                            Resume
                          </>
                        ) : (
                          <>
                            <PauseCircle size={14} className="text-warning" />
                            Pause
                          </>
                        )}
                      </a>
                    </li>
                  )}

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

          {/* AMOUNT ROW */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${config.bg} ${config.text}`}>
              <Icon size={24} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Deduction</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-base-content tabular-nums tracking-tight">
                  {plan.deduction_type === "PERCENTAGE" ? `${plan.amount}%` : formatCurrency(plan.amount)}
                </span>
                <span className="text-xs font-semibold opacity-40">/ payroll</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER (PROGRESS BAR or USER LIST) --- */}
        <div className="mt-2">
          {isLoan ? (
            <div className="w-full">
              {/* Progress Bar */}
              <div className="relative h-2.5 w-full bg-base-200 rounded-full overflow-hidden mb-2">
                <div 
                  className={`absolute top-0 left-0 h-full ${config.color} transition-all duration-1000 ease-out`} 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Stats - Dynamic Text based on Role */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold opacity-60 uppercase text-[10px] tracking-wider">
                   {canManage ? "Total Collected" : "Your Paid Balance"}
                </span>
                <div className="font-mono font-bold text-sm text-base-content/80">
                  <span className="text-emerald-600">{formatCurrency(displayCollected)}</span>
                  <span className="opacity-40 mx-1">/</span>
                  <span>{formatCurrency(displayLimit)}</span>
                </div>
              </div>
            </div>
          ) : (
             // Non-Loan Footer: WITH DIVIDER
             <div className="border-t border-base-200 pt-3 text-xs min-h-[30px] flex items-center">
                {isGlobal ? (
                   <div className="flex items-center gap-2 opacity-50">
                     <Globe size={14} />
                     <p className="italic">
                       {!canManage ? "Applied to you (Global)" : "All active employees included."}
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
          )}
        </div>

        {/* PAUSED OVERLAY */}
        {isPaused && (
          <div className="absolute top-4 right-14 badge badge-warning gap-1 font-bold shadow-sm animate-pulse">
            <PauseCircle size={12} /> PAUSED
          </div>
        )}

      </div>
    </div>
  );
};

export default DeductionCard;