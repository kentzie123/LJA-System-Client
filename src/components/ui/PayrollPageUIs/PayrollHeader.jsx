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
  
  // UPDATE: Use the specific permission we created in the backend
  const canViewAllowances = authUser?.role?.perm_allowance_view === true;

  // Helper to determine icon classes based on active state
  const getIconClass = (tabName) => 
    activeTab === tabName ? "text-primary-content" : "opacity-70";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Payroll & Finance</h1>
        <p className="text-sm opacity-60">
          Payroll orchestration, audit logs, deductions, and benefits.
        </p>
      </div>

      <div className="bg-base-100 border border-base-300 p-1 rounded-lg flex gap-1 items-center w-full md:w-auto overflow-x-auto">
        
        {/* TAB 1: Payout Cycles */}
        {canViewPayroll && (
          <button
            onClick={() => setActiveTab("payoutCycles")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "payoutCycles"
                ? "bg-primary text-primary-content shadow-sm"
                : "opacity-60 hover:opacity-100 hover:bg-base-200"
            }`}
          >
            <CalendarDays size={16} className={getIconClass("payoutCycles")} />
            Payout Cycles
          </button>
        )}

        {/* TAB 2: Deduction Rules */}
        {canViewDeductions && (
          <button
            onClick={() => setActiveTab("deductionRules")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "deductionRules"
                ? "bg-primary text-primary-content shadow-sm"
                : "opacity-60 hover:opacity-100 hover:bg-base-200"
            }`}
          >
            <CreditCard size={16} className={getIconClass("deductionRules")} />
            Deductions
          </button>
        )}

        {/* TAB 3: Allowances */}
        {canViewAllowances && (
          <button
            onClick={() => setActiveTab("allowances")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "allowances"
                ? "bg-primary text-primary-content shadow-sm"
                : "opacity-60 hover:opacity-100 hover:bg-base-200"
            }`}
          >
            <Coins size={16} className={getIconClass("allowances")} />
            Allowances
          </button>
        )}
      </div>
    </div>
  );
};

export default PayrollHeader;