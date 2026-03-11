"use client";

import React from "react";
import { 
  Clock, CheckCircle, XCircle, Users, BarChart3 
} from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";
import { useAuthStore } from "@/stores/useAuthStore";

// Explicit color mapping for the Command Center aesthetic
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
    // Ultra-tight padding (p-2.5) and smaller rounded corners
    <div className={`bg-base-100 border border-base-200 rounded-lg p-2.5 sm:p-3 flex flex-col shadow-sm antialiased-text transition-all duration-200 group ${theme.border}`}>
      
      {/* Header: Title and Icon inline */}
      <div className="flex justify-between items-center gap-2 mb-1.5">
        <h3 className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-base-content/50 leading-none truncate">
          {title}
        </h3>
        {/* Minimalist Icon styling */}
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

const OvertimeStatsGrid = () => {
  const { stats } = useOvertimeStore();
  const { authUser } = useAuthStore();
  
  const roleId = authUser?.role?.id;
  // Admin (1) or Super Admin (3)
  const isAdmin = roleId === 1 || roleId === 3;

  return (
    // Tightened grid gap (gap-2 sm:gap-3) to fit the micro-aesthetic
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 w-full">
      
      {/* 1. PENDING (Action Items) */}
      <StatCard 
        title={isAdmin ? "Pending Reviews" : "My Pending Requests"}
        value={stats.pendingCount || 0}
        icon={Clock}
        color="warning"
        subtext={isAdmin ? "Requires action" : "Awaiting approval"}
      />

      {/* 2. HOURS (Financial Impact) */}
      <StatCard 
        title={isAdmin ? "Total OT Hours" : "My OT Hours"}
        value={`${stats.approvedHoursMonth || 0}h`}
        icon={BarChart3}
        color="success" // Changed to Success (Green) for positive accrual
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
          color="info" // Blue for general info
          subtext="Filed OT this month"
        />
      ) : (
        <StatCard 
          title="Total Approved"
          value={stats.totalApprovedCount || 0}
          icon={CheckCircle}
          color="primary" // Blue/Primary for historical data
          subtext="Lifetime accepted requests"
        />
      )}

    </div>
  );
};

export default OvertimeStatsGrid;