"use client";

// UI
import PayrollHeader from "../ui/PayrollPageUIs/PayrollHeader";
import PayrollStatsGrid from "../ui/PayrollPageUIs/PayrollStatsGrid";
import PayrollTable from "../ui/PayrollPageUIs/PayrollTable";
import PayrollDeductionList from "../ui/PayrollPageUIs/PayrollDeductionList";
import PayrollPeriodList from "../ui/PayrollPageUIs/PayrollPeriodList";
import PayrollTableSkeleton from "../ui/PayrollPageUIs/PayrollTableSkeleton";

// Hooks
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Store
import { useAuthStore } from "@/stores/useAuthStore";
import { usePayrollStore } from "@/stores/usePayrollStore";

const PayrollPage = () => {
  const { authUser } = useAuthStore();
  const { activePayRun } = usePayrollStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("payoutCycles");

  // --- PERMISSIONS ---
  const canViewPayroll = authUser?.role?.perm_payroll_view === true;
  const canManagePayroll = authUser?.role?.perm_payroll_manage === true;

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }

    // SECURITY REDIRECT
    if (!canViewPayroll) {
      router.push("/not-found");
    }
  }, [authUser, router, canViewPayroll]);

  // Prevent flash
  if (!authUser || !canViewPayroll) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PayrollHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "payoutCycles" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT: Period List */}
          <div className="lg:col-span-1">
            <PayrollPeriodList canManage={canManagePayroll} />
          </div>

          {/* RIGHT: Main Content Area */}
          <div className="lg:col-span-3">
            {/* CONDITIONAL RENDERING: Show Stats/Table ONLY if a run is selected */}
            {activePayRun ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <PayrollStatsGrid />

                {/* Wrapper to ensure table scrolls on mobile if needed */}
                <div className="overflow-hidden rounded-xl border border-base-200 shadow-sm bg-base-100">
                  <PayrollTable canManage={canManagePayroll} />
                </div>
              </div>
            ) : (
              <PayrollTableSkeleton />
            )}
          </div>
        </div>
      )}

      {/* DEDUCTIONS TAB */}
      {activeTab === "deductionRules" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <PayrollDeductionList canManage={canManagePayroll} />
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
