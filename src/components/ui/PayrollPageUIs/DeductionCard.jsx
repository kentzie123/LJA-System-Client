import React from "react";
import { 
  MoreVertical, 
  History, 
  Globe, 
  Wallet,
  CalendarDays,
  PauseCircle 
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatUtils";

const DeductionCard = ({ plan, onToggle, onDelete }) => {
  const isGlobal = plan.is_global;
  const isPaused = plan.status === "PAUSED";
  
  // --- SAFELY PARSE NUMBERS ---
  const totalLimit = parseFloat(plan.total_amount || 0);
  const totalCollected = parseFloat(plan.total_collected || 0);
  const isLoan = totalLimit > 0;

  // Percentage Math
  const progressPercent = isLoan 
    ? Math.min(100, Math.max(0, Math.round((totalCollected / totalLimit) * 100))) 
    : 0;

  // --- DYNAMIC LABEL ---
  let planLabel = "COMPANY WIDE";
  if (!isGlobal) {
    const count = parseInt(plan.subscriber_count || 0);
    const names = plan.subscriber_names || [];
    
    if (count === 1 && names.length > 0) {
      planLabel = `LOAN FOR ${names[0].toUpperCase()}`;
    } else if (count > 0) {
      planLabel = `GROUP: ${count} EMPLOYEES`;
    } else {
      planLabel = "NO SUBSCRIBERS";
    }
  }

  // --- THEME CONFIG ---
  const config = {
    color: isGlobal ? "bg-primary" : "bg-emerald-500",
    text: isGlobal ? "text-primary" : "text-emerald-600",
    bg: isGlobal ? "bg-primary/5" : "bg-emerald-50",
  };

  const Icon = isLoan ? History : (isGlobal ? Globe : Wallet);

  return (
    <div className={`card bg-base-100 shadow-sm border border-base-200 relative overflow-hidden group hover:shadow-md transition-all duration-300 ${isPaused ? "opacity-70 grayscale-[0.5]" : ""}`}>
      
      {/* Left Border Accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.color}`}></div>

      {/* Added 'pl-6' to ensure content doesn't touch the left border accent */}
      <div className="card-body p-6 pl-6 h-full flex flex-col justify-between">
        
        {/* --- TOP SECTION --- */}
        <div>
          {/* HEADER ROW */}
          <div className="flex justify-between items-start mb-4">
            
            {/* LEFT SIDE: Badge, Date, Title */}
            <div className="flex flex-col gap-1.5 w-full pr-2"> 
              
              {/* Badge & Date Container (Allows wrapping) */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge badge-xs font-bold py-2 border-none h-auto min-h-[1.25rem] whitespace-normal text-left leading-tight ${config.bg} ${config.text} tracking-wider`}>
                  {planLabel}
                </span>
                
                {/* Date - Now creates a new line if badge is too long */}
                <span className="text-[10px] font-medium opacity-40 flex items-center gap-1 whitespace-nowrap">
                  <CalendarDays size={10} /> {formatDate(plan.created_at)}
                </span>
              </div>
              
              {/* Title (Handles long words) */}
              <h3 className="card-title text-lg font-bold text-base-content leading-tight break-words">
                {plan.name}
              </h3>
            </div>

            {/* RIGHT SIDE: Menu (Prevent shrinking) */}
            <div className="dropdown dropdown-end flex-shrink-0 -mr-2">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm opacity-40 hover:opacity-100">
                <MoreVertical size={18} />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-1 shadow-lg bg-base-100 rounded-xl w-48 border border-base-200 text-sm mt-1">
                <li><a onClick={onToggle} className="gap-3 py-2 font-medium">{isPaused ? "Resume" : "Pause"}</a></li>
                <div className="divider my-0"></div>
                <li><a onClick={onDelete} className="text-error gap-3 py-2 font-medium">Delete</a></li>
              </ul>
            </div>
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

        {/* --- FOOTER (PROGRESS BAR) --- */}
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

              {/* Stats */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold opacity-60 uppercase text-[10px] tracking-wider">Payment Progress</span>
                <div className="font-mono font-bold text-sm text-base-content/80">
                  <span className="text-emerald-600">{formatCurrency(totalCollected)}</span>
                  <span className="opacity-40 mx-1">/</span>
                  <span>{formatCurrency(totalLimit)}</span>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-8 flex items-end border-t border-base-200/50 pt-2">
                <p className="text-xs font-medium opacity-40 italic">Recurring deduction</p>
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