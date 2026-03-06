import React from "react";
import { 
  Clock, CheckCircle, XCircle, Users, BarChart3 
} from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";
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

const OvertimeStatsGrid = () => {
  // 1. Notice we removed fetchOvertimeStats! The Page handles fetching now.
  const { stats } = useOvertimeStore();
  const { authUser } = useAuthStore();
  
  const roleId = authUser?.role?.id;
  // Admin (1) or Super Admin (3)
  const isAdmin = roleId === 1 || roleId === 3;

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

      {/* 2. HOURS (Financial Impact) */}
      <StatCard 
        title={isAdmin ? "Total OT Hours" : "My OT Hours"}
        value={`${stats.approvedHoursMonth || 0}h`}
        icon={BarChart3}
        color="primary"
        subtext="Approved this month"
      />

      {/* 3. REJECTIONS (Quality Control) */}
      <StatCard 
        title={isAdmin ? "Rejections" : "My Rejections"}
        value={stats.rejectedCount || 0}
        icon={XCircle}
        color="error"
        subtext="Denied this month"
      />

      {/* 4. DYNAMIC CARD (Engagement vs History) */}
      {isAdmin ? (
        <StatCard 
          title="Active Employees"
          value={stats.activeRequesters || 0}
          icon={Users}
          color="info"
          subtext="Filed OT this month"
        />
      ) : (
        <StatCard 
          title="Total Approved"
          value={stats.totalApprovedCount || 0}
          icon={CheckCircle}
          color="success"
          subtext="Lifetime accepted requests"
        />
      )}

    </div>
  );
};

export default OvertimeStatsGrid;