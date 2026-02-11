"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardStore } from "@/stores/useDashboardStore";

// Components
import AdminStatsGrid from "../ui/DashboardPageUIs/AdminStatsGrid";
import EmployeeStatsGrid from "../ui/DashboardPageUIs/EmployeeStatsGrid";

const DashboardPage = () => {
  const router = useRouter();
  const { authUser, isLoading: authLoading } = useAuthStore();
  const { 
    adminStats, 
    employeeStats, 
    fetchAdminStats, 
    fetchEmployeeStats,
    isLoadingAdmin,
    isLoadingEmployee
  } = useDashboardStore();

  // Permissions Check
  const canViewAdminStats = authUser?.role?.perm_dashboard_view === true;

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
      return;
    }

    if (authUser) {
      // 1. Always fetch personal stats for everyone
      fetchEmployeeStats();

      // 2. Fetch Admin stats only if allowed
      if (canViewAdminStats) {
        fetchAdminStats();
      }
    }
  }, [authUser, authLoading, router, canViewAdminStats, fetchAdminStats, fetchEmployeeStats]);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-[1600px] mx-auto p-2 md:p-6">
      
      {/* 1. ADMIN SECTION (Conditional) */}
      {canViewAdminStats && (
        <section>
           <div className="flex items-center justify-between mb-4 px-1">
             <div>
               <h2 className="text-xl font-bold tracking-tight text-base-content/90">Company Overview</h2>
               <p className="text-xs opacity-60">Real-time metrics and financial insights.</p>
             </div>
             {/* Optional: Add Date Range Picker here later */}
             <div className="badge badge-ghost text-xs font-mono opacity-50">
               {new Date().toLocaleDateString()}
             </div>
           </div>

           {isLoadingAdmin ? (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
               {[1,2,3,4].map(i => <div key={i} className="h-32 bg-base-200 rounded-xl"></div>)}
             </div>
           ) : (
             <AdminStatsGrid stats={adminStats} />
           )}
        </section>
      )}

      {/* 2. PERSONAL SECTION (Always Visible) */}
      <section>
        {/* Only show header if Admin view is also present to separate sections */}
        {canViewAdminStats && (
          <div className="divider opacity-50 my-8 text-xs font-bold tracking-widest">MY DASHBOARD</div>
        )}

        {isLoadingEmployee ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
             <div className="md:col-span-3 h-48 bg-base-200 rounded-2xl"></div>
             {[1,2,3].map(i => <div key={i} className="h-64 bg-base-200 rounded-xl"></div>)}
           </div>
        ) : (
           <EmployeeStatsGrid stats={employeeStats} user={authUser} />
        )}
      </section>

    </div>
  );
};

export default DashboardPage;