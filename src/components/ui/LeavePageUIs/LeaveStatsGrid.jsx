"use client";

import React, { useEffect } from "react";
import { 
  Clock, Calendar, CheckCircle, XCircle, Users, Briefcase, HeartPulse 
} from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useAuthStore } from "@/stores/useAuthStore";

// Explicit color mapping
const themeMap = {
  warning: { border: "hover:border-warning/40", text: "text-warning" },
  primary: { border: "hover:border-primary/40", text: "text-primary" },
  error: { border: "hover:border-error/40", text: "text-error" },
  info: { border: "hover:border-info/40", text: "text-info" },
  success: { border: "hover:border-success/40", text: "text-success" },
};

const StatCard = ({ title, value, icon: Icon, color = "primary", subtext }) => {
  const theme = themeMap[color];

  return (
    <div className={`bg-base-100 border border-base-200 rounded-lg p-2.5 sm:p-3 flex flex-col shadow-sm antialiased-text transition-all duration-200 group ${theme.border}`}>
      
      {/* Header: Title and Icon inline */}
      <div className="flex justify-between items-center gap-2 mb-1.5">
        <h3 className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-base-content/50 leading-none truncate">
          {title}
        </h3>
        <Icon size={12} strokeWidth={3} className={`${theme.text} opacity-60 group-hover:opacity-100 transition-opacity shrink-0`} />
      </div>
      
      {/* Body: Value and Subtext */}
      <div className="mt-auto flex flex-col pt-0.5">
        <span className={`text-lg sm:text-xl font-black tracking-tighter tabular-nums leading-none ${theme.text}`}>
          {value}
        </span>
        {subtext && (
          <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-widest text-base-content/30 mt-1 truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

const LeaveStatsGrid = () => {
  const { stats, leaveBalances, fetchLeaveBalances } = useLeaveStore();
  const { authUser } = useAuthStore();
  
  const roleId = authUser?.role?.id;
  const isAdmin = roleId === 1 || roleId === 3;

  useEffect(() => {
    if (!isAdmin) {
      fetchLeaveBalances();
    }
  }, [fetchLeaveBalances, isAdmin]);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 w-full">
      
      {/* PENDING: WARNING (Orange/Yellow) */}
      <StatCard 
        title={isAdmin ? "Pending Reviews" : "My Pending Requests"}
        value={stats.pendingCount || 0}
        icon={Clock}
        color="warning"
        subtext={isAdmin ? "Requires action" : "Awaiting approval"}
      />

      {/* APPROVED / VACATION: SUCCESS (Green) */}
      {isAdmin ? (
        <StatCard 
          title="Approved Leaves"
          value={stats.approvedCountMonth || 0}
          icon={Calendar}
          color="success" // Changed from primary to success
          subtext="Scheduled this month"
        />
      ) : (
        <StatCard 
          title="Vacation Balance"
          value={leaveBalances?.vacationRemaining || 0}
          icon={Briefcase}
          color="success" // Changed from primary to success
          subtext="Available days"
        />
      )}

      {/* REJECTIONS / SICK: ERROR (Red) */}
      {isAdmin ? (
        <StatCard 
          title="Rejections"
          value={stats.rejectedCount || 0}
          icon={XCircle}
          color="error"
          subtext="Denied this month"
        />
      ) : (
        <StatCard 
          title="Sick Leave Balance"
          value={leaveBalances?.sickRemaining || 0}
          icon={HeartPulse}
          color="error"
          subtext="Available days"
        />
      )}

      {/* TEAM INFO / TOTALS: INFO (Blue) */}
      {isAdmin ? (
        <StatCard 
          title="Employees on Leave"
          value={stats.activeOnLeave || 0}
          icon={Users}
          color="info"
          subtext="Active today"
        />
      ) : (
        <StatCard 
          title="Total Approved"
          value={stats.totalApprovedCount || 0}
          icon={CheckCircle}
          color="primary" // Changed to primary for variety since vacation is success
          subtext="Lifetime accepted"
        />
      )}

    </div>
  );
};

export default LeaveStatsGrid;