"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { 
  CalendarDays, 
  CreditCard, 
  Coins 
} from "lucide-react"; 

const PayrollHeader = ({ activeTab, setActiveTab }) => {
  const { authUser } = useAuthStore();

  // --- PERMISSION CHECKS ---
  const canViewPayroll = authUser?.role?.perm_payroll_view === true;
  const canViewDeductions = authUser?.role?.perm_deduction_view === true;
  const canViewAllowances = authUser?.role?.perm_allowance_view === true;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 antialiased-text">
      
      {/* TITLE & DESCRIPTION */}
      <div className="flex flex-col">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content leading-none mb-1">
          Payroll & Finance
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
          Orchestration, deductions & allowances
        </p>
      </div>

      {/* SEGMENTED CONTROL (TABS) */}
      <div className="bg-base-200 border border-base-300 p-1 rounded-lg flex items-center w-full md:w-auto overflow-x-auto shrink-0 custom-scrollbar">
        
        {/* TAB 1: Payout Cycles */}
        {canViewPayroll && (
          <button
            onClick={() => setActiveTab("payoutCycles")}
            className={`flex items-center justify-center gap-1.5 flex-1 md:flex-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${
              activeTab === "payoutCycles"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/50 hover:text-base-content"
            }`}
          >
            <CalendarDays size={12} className={activeTab === "payoutCycles" ? "text-primary" : "opacity-70"} />
            Payout Cycles
          </button>
        )}

        {/* TAB 2: Deduction Rules */}
        {canViewDeductions && (
          <button
            onClick={() => setActiveTab("deductionRules")}
            className={`flex items-center justify-center gap-1.5 flex-1 md:flex-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${
              activeTab === "deductionRules"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/50 hover:text-base-content"
            }`}
          >
            <CreditCard size={12} className={activeTab === "deductionRules" ? "text-primary" : "opacity-70"} />
            Deductions
          </button>
        )}

        {/* TAB 3: Allowances */}
        {canViewAllowances && (
          <button
            onClick={() => setActiveTab("allowances")}
            className={`flex items-center justify-center gap-1.5 flex-1 md:flex-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${
              activeTab === "allowances"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/50 hover:text-base-content"
            }`}
          >
            <Coins size={12} className={activeTab === "allowances" ? "text-primary" : "opacity-70"} />
            Allowances
          </button>
        )}
      </div>
      
    </div>
  );
};

export default PayrollHeader;