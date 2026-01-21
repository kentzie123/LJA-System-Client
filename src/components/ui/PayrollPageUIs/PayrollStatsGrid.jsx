import React, { useMemo } from "react";
import { usePayrollStore } from "@/stores/usePayrollStore";
import { Loader2 } from "lucide-react";

const PayrollStatsGrid = () => {
  const { activeRunRecords, isLoading } = usePayrollStore();

  // 1. Calculate Totals dynamically
  const stats = useMemo(() => {
    if (!activeRunRecords) return { overtime: 0, deductions: 0, net: 0 };

    return activeRunRecords.reduce(
      (acc, record) => {
        acc.overtime += parseFloat(record.overtime_pay || 0);
        acc.deductions += parseFloat(record.deductions || 0);
        acc.net += parseFloat(record.net_pay || 0);
        return acc;
      },
      { overtime: 0, deductions: 0, net: 0 }
    );
  }, [activeRunRecords]);

  // Helper to format money (PHP)
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-base-100 border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* CARD 1: OVERTIME COST */}
      <div className="bg-base-100 rounded-lg p-5 border border-white/10 shadow-sm flex flex-col justify-between h-24">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          Overtime Cost
        </div>
        <div className="text-2xl font-bold text-base-content tracking-tight">
          {formatMoney(stats.overtime)}
        </div>
      </div>

      {/* CARD 2: DEDUCTIONS (Red Text) */}
      <div className="bg-base-100 rounded-lg p-5 border border-white/10 shadow-sm flex flex-col justify-between h-24">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          Total Deductions
        </div>
        <div className="text-2xl font-bold text-error tracking-tight">
          {formatMoney(stats.deductions)}
        </div>
      </div>

      {/* CARD 3: NET DISBURSEMENT (Blue Background) */}
      <div className="bg-primary text-primary-content rounded-lg p-5 shadow-lg shadow-primary/20 flex flex-col justify-between h-24 border border-white/10">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          Net Disbursement
        </div>
        <div className="text-2xl font-bold tracking-tight">
          {formatMoney(stats.net)}
        </div>
      </div>

    </div>
  );
};

export default PayrollStatsGrid;