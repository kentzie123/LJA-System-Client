"use client";

import React from "react";
import { usePayrollStore } from "@/stores/usePayrollStore";

const PayrollStatsGrid = () => {
  // 1. Get the FULL details object (meta, records, totals)
  const { activeRunDetails, isFetchingDetails } = usePayrollStore();

  // Helper to format money (PHP)
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);

  // 2. Loading State (Skeleton - Matched to Command Center sizing)
  if (isFetchingDetails) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 w-full antialiased-text">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-base-100 rounded-xl p-3 sm:p-3.5 border border-base-200 shadow-sm flex flex-col justify-between min-h-[76px] animate-pulse"
          >
            <div className="h-2 w-20 bg-base-300 rounded-full"></div>
            <div className="h-4 w-28 bg-base-300 rounded-full mt-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  // 3. Extract totals safely (Default to 0 if no run is selected)
  const totals = activeRunDetails?.totals || { 
    total_overtime: 0, 
    total_allowances: 0, 
    total_deductions: 0, 
    total_net_pay: 0 
  };

  return (
    // Command Center Grid: 2 columns on mobile, 4 on desktop, tight gaps
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 w-full antialiased-text">
      
      {/* CARD 1: OVERTIME COST */}
      <div className="bg-base-100 rounded-xl p-3 sm:p-3.5 border border-base-200 shadow-sm flex flex-col justify-between min-h-[76px] group hover:border-warning/30 transition-colors">
        <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-base-content/50 leading-none truncate">
          Overtime Cost
        </div>
        <div className="text-base sm:text-lg font-black text-warning tracking-tighter tabular-nums leading-none mt-2">
          {formatMoney(totals.total_overtime)}
        </div>
      </div>

      {/* CARD 2: TOTAL ALLOWANCES */}
      <div className="bg-base-100 rounded-xl p-3 sm:p-3.5 border border-base-200 shadow-sm flex flex-col justify-between min-h-[76px] group hover:border-success/30 transition-colors">
        <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-base-content/50 leading-none truncate">
          Total Allowances
        </div>
        <div className="text-base sm:text-lg font-black text-success tracking-tighter tabular-nums leading-none mt-2">
          {formatMoney(totals.total_allowances)}
        </div>
      </div>

      {/* CARD 3: DEDUCTIONS */}
      <div className="bg-base-100 rounded-xl p-3 sm:p-3.5 border border-base-200 shadow-sm flex flex-col justify-between min-h-[76px] group hover:border-error/30 transition-colors">
        <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-base-content/50 leading-none truncate">
          Total Deductions
        </div>
        <div className="text-base sm:text-lg font-black text-error tracking-tighter tabular-nums leading-none mt-2">
          {formatMoney(totals.total_deductions)}
        </div>
      </div>

      {/* CARD 4: NET DISBURSEMENT */}
      <div className="bg-primary text-primary-content rounded-xl p-3 sm:p-3.5 shadow-lg shadow-primary/20 flex flex-col justify-between min-h-[76px] border border-primary/50 relative overflow-hidden group">
        {/* Decorative background flare */}
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
        
        <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-80 leading-none truncate relative z-10">
          Net Disbursement
        </div>
        <div className="text-lg sm:text-xl font-black tracking-tighter tabular-nums leading-none mt-2 relative z-10">
          {formatMoney(totals.total_net_pay)}
        </div>
      </div>
      
    </div>
  );
};

export default PayrollStatsGrid;