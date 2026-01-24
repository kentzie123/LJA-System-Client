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

  // 2. Loading State (Skeleton)
  if (isFetchingDetails) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-base-100 border border-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // 3. Extract totals safely (Default to 0 if no run is selected)
  const totals = activeRunDetails?.totals || { 
    total_overtime: 0, 
    total_deductions: 0, 
    total_net_pay: 0 
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* CARD 1: OVERTIME COST */}
      <div className="bg-base-100 rounded-lg p-5 border border-white/10 shadow-sm flex flex-col justify-between h-24">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          Overtime Cost
        </div>
        <div className="text-2xl font-bold text-base-content tracking-tight">
          {formatMoney(totals.total_overtime)}
        </div>
      </div>

      {/* CARD 2: DEDUCTIONS (Red Text) */}
      <div className="bg-base-100 rounded-lg p-5 border border-white/10 shadow-sm flex flex-col justify-between h-24">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          Total Deductions
        </div>
        <div className="text-2xl font-bold text-error tracking-tight">
          {formatMoney(totals.total_deductions)}
        </div>
      </div>

      {/* CARD 3: NET DISBURSEMENT (Blue Background) */}
      <div className="bg-primary text-primary-content rounded-lg p-5 shadow-lg shadow-primary/20 flex flex-col justify-between h-24 border border-white/10">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          Net Disbursement
        </div>
        <div className="text-2xl font-bold tracking-tight">
          {formatMoney(totals.total_net_pay)}
        </div>
      </div>
    </div>
  );
};

export default PayrollStatsGrid;