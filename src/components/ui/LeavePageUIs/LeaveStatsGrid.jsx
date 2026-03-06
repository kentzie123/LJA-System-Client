import React, { useEffect } from "react";
import { 
  Clock, Calendar, CheckCircle, XCircle, Users, Briefcase, HeartPulse 
} from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";
import { useAuthStore } from "@/stores/useAuthStore";

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="stats shadow-sm border border-base-200 bg-base-100 w-full">
    <div className="stat p-4">
      <div className={`stat-figure text-${color} bg-${color}/10 p-2 rounded-full`}>
        <Icon size={24} />
      </div>
      <div className="stat-title text-xs font-medium uppercase tracking-wider opacity-70">
        {title}
      </div>
      <div className={`stat-value text-${color} text-2xl`}>{value}</div>
      {subtext && <div className="stat-desc mt-1">{subtext}</div>}
    </div>
  </div>
);

const LeaveStatsGrid = () => {
  // We DO NOT fetch stats here anymore. The parent LeavePage handles it!
  const { stats, leaveBalances, fetchLeaveBalances } = useLeaveStore();
  const { authUser } = useAuthStore();
  
  const roleId = authUser?.role?.id;
  const isAdmin = roleId === 1 || roleId === 3;

  useEffect(() => {
    // Balances don't change based on the month filter (they are annual), 
    // so we can safely fetch them here once on mount for employees.
    if (!isAdmin) {
      fetchLeaveBalances();
    }
  }, [fetchLeaveBalances, isAdmin]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. PENDING (Action Items) */}
      <StatCard 
        title={isAdmin ? "Pending Reviews" : "My Pending Requests"}
        value={stats.pendingCount || 0}
        icon={Clock}
        color="warning"
        subtext={isAdmin ? "Requires approval" : "Awaiting approval"}
      />

      {/* 2. SECOND SLOT: Approved (Admin) OR Vacation Balance (Employee) */}
      {isAdmin ? (
        <StatCard 
          title="Approved Leaves"
          value={stats.approvedCountMonth || 0}
          icon={Calendar}
          color="primary"
          subtext="Scheduled for this month"
        />
      ) : (
        <StatCard 
          title="Vacation Balance"
          value={leaveBalances?.vacationRemaining || 0}
          icon={Briefcase}
          color="primary"
          subtext="Available days"
        />
      )}

      {/* 3. THIRD SLOT: Rejections (Admin) OR Sick Balance (Employee) */}
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

      {/* 4. DYNAMIC CARD (Engagement vs History) */}
      {isAdmin ? (
        <StatCard 
          title="Employees on Leave"
          value={stats.activeOnLeave || 0}
          icon={Users}
          color="info"
          subtext="Active leaves this month"
        />
      ) : (
        <StatCard 
          title="Total Approved"
          value={stats.totalApprovedCount || 0}
          icon={CheckCircle}
          color="success"
          subtext="All time accepted requests"
        />
      )}

    </div>
  );
};

export default LeaveStatsGrid;