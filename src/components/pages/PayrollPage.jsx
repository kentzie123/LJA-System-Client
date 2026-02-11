"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Store
import { useAuthStore } from "@/stores/useAuthStore";
import { usePayrollStore } from "@/stores/usePayrollStore";

// UI Components
import PayrollHeader from "@/components/ui/PayrollPageUIs/PayrollHeader";
import PayrollStatsGrid from "@/components/ui/PayrollPageUIs/PayrollStatsGrid";
import PayrollTable from "@/components/ui/PayrollPageUIs/PayrollTable";
import PayrollDeductionList from "@/components/ui/PayrollPageUIs/PayrollDeductionList";
import PayrollPeriodList from "@/components/ui/PayrollPageUIs/PayrollPeriodList";
import AllowanceList from "@/components/ui/AllowancePageUIs/AllowanceList";

// Define Tabs as Constants
const TABS = {
  PAYOUT: "payoutCycles",
  DEDUCTIONS: "deductionRules",
  ALLOWANCES: "allowances",
};

const PayrollPage = () => {
  const { authUser, isLoading } = useAuthStore();
  const { activePayRun } = usePayrollStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 1. TAB STATE MANAGEMENT ---
  const initialTab = searchParams.get("tab") || TABS.PAYOUT;
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/payroll?tab=${tab}`, { scroll: false });
  };

  // --- 2. PERMISSIONS ---
  const role = authUser?.role;
  const permissions = {
    canViewPayroll: role?.perm_payroll_view === true,
    canManagePayroll: role?.perm_payroll_manage === true,
    canViewDeductions: role?.perm_deduction_view === true,
    canManageDeductions: role?.perm_deduction_manage === true,
    canViewAllowances: role?.perm_allowance_view === true,
    canManageAllowances: role?.perm_allowance_manage === true,
  };

  const canViewAllPayslips = role?.perm_payroll_view_all === true || permissions.canManagePayroll;

  // --- 3. SECURITY CHECK ---
  useEffect(() => {
    if (!isLoading) {
      if (!authUser) {
        router.push("/login");
      } else if (!permissions.canViewPayroll) {
        router.push("/not-found");
      }
    }
  }, [authUser, isLoading, router, permissions.canViewPayroll]);

  // --- 4. LOADING STATE ---
  if (isLoading || !authUser) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!permissions.canViewPayroll) return null;

  return (
    // ROOT: Height auto on mobile to allow scrolling, Fixed on Desktop for "App feel"
    <div className="flex flex-col gap-6 h-auto lg:h-[calc(100vh-100px)]">
      
      {/* HEADER */}
      <PayrollHeader activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* CONTENT WRAPPER: Column on mobile, Row on Desktop */}
      <div className="flex flex-col lg:flex-row flex-1 gap-6 lg:overflow-hidden">
        
        {/* --- LEFT COLUMN (Sidebar / Period List) --- */}
        {activeTab === TABS.PAYOUT && (
          <div className="w-full lg:w-1/4 lg:min-w-[300px] flex flex-col gap-6 animate-in slide-in-from-left-4 duration-300">
            {/* Height: Fixed 80 (320px) on mobile so it doesn't trap scroll, Full on desktop */}
            <div className="h-80 lg:h-full bg-base-100 rounded-xl border border-base-200 shadow-sm overflow-hidden p-4">
              <PayrollPeriodList canManage={permissions.canManagePayroll} />
            </div>
          </div>
        )}

        {/* --- RIGHT COLUMN (Main Content) --- */}
        {/* Overflow: Visible on mobile (page scroll), Hidden on desktop (inner scroll) */}
        <div className="flex-1 flex flex-col gap-6 overflow-visible lg:overflow-hidden min-h-[500px]">
          
          {/* TAB 1: PAYOUT CYCLES */}
          {activeTab === TABS.PAYOUT && (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              
              {/* Stats Grid */}
              {activePayRun && canViewAllPayslips && (
                <div className="flex-shrink-0">
                  <PayrollStatsGrid activePayRun={activePayRun} />
                </div>
              )}

              {/* Main Payroll Table */}
              <div className="flex-1 overflow-hidden bg-base-100 rounded-xl border border-base-200 shadow-sm min-h-[400px]">
                <PayrollTable
                  canManage={permissions.canManagePayroll}
                  canViewAll={canViewAllPayslips}
                />
              </div>
            </div>
          )}

          {/* TAB 2: DEDUCTIONS */}
          {activeTab === TABS.DEDUCTIONS && permissions.canViewDeductions && (
            // Height full on desktop, auto on mobile
            <div className="h-auto lg:h-full overflow-y-auto pr-2 animate-in slide-in-from-bottom-4 duration-300 custom-scrollbar">
              <PayrollDeductionList canManage={permissions.canManageDeductions} />
            </div>
          )}

          {/* TAB 3: ALLOWANCES */}
          {activeTab === TABS.ALLOWANCES && permissions.canViewAllowances && (
            <div className="h-auto lg:h-full overflow-y-auto pr-2 animate-in slide-in-from-bottom-4 duration-300 custom-scrollbar">
              <AllowanceList canManage={permissions.canManageAllowances} />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;