"use client";

// UI
import PayrollHeader from "../ui/PayrollPageUIs/PayrollHeader";
import PayrollStatsGrid from "../ui/PayrollPageUIs/PayrollStatsGrid";
import PayrollTable from "../ui/PayrollPageUIs/PayrollTable";
import PayrollDeductionList from "../ui/PayrollPageUIs/PayrollDeductionList";
import PayrollPeriodList from "../ui/PayrollPageUIs/PayrollPeriodList";

// Hooks
import { useEffect, useState } from "react";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

// Routing
import { useRouter } from "next/navigation";

const PayrollPage = () => {
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("payoutCycles");

  const router = useRouter();

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [authUser, router]);

  if (!authUser) return null;

  return (
    <div className="space-y-6">
      {/* Header handles its own responsiveness internally */}
      <PayrollHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "payoutCycles" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT: Period List (Sidebar on Desktop, Top Block on Mobile) */}
          <div className="lg:col-span-1">
            <PayrollPeriodList />
          </div>

          {/* RIGHT: Stats & Table (Main Content) */}
          <div className="lg:col-span-3 space-y-6">
            <PayrollStatsGrid />
            
            {/* Wrapper to ensure table scrolls on mobile if needed */}
            <div className="overflow-hidden rounded-xl border border-base-200 shadow-sm bg-base-100">
               <PayrollTable />
            </div>
          </div>
        </div>
      )}

      {/* DEDUCTIONS TAB */}
      {activeTab === "deductionRules" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <PayrollDeductionList />
        </div>
      )}
    </div>
  );
};

export default PayrollPage;