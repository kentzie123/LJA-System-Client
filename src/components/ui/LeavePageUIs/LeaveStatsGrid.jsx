import { useEffect } from "react";
import { 
  Clock, 
  CircleCheck, 
  Briefcase, 
  HeartPulse, 
  Calendar, 
  XCircle 
} from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";

const LeaveGridCard = ({ data }) => {
  let Icon = data.icon;

  return (
    <div className="card flex-row gap-4 p-4 bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
      <div className={`${data.bg} p-3 flex items-center justify-center rounded-lg`}>
        <Icon className={`${data.txtColor} size-6`} />
      </div>
      <div>
        <div className="tracking-wider uppercase text-xxs font-bold opacity-60">
          {data.title}
        </div>
        <div className="font-bold text-2xl">{data.value}</div>
        {data.desc && (
          <div className="text-xs opacity-50 font-medium mt-1">{data.desc}</div>
        )}
      </div>
    </div>
  );
};

const LeaveStatsGrid = ({ leaves = [], isAdminView = false }) => {
  // Use leaveBalances from your specific store structure
  const { leaveBalances } = useLeaveStore();

  // --- 1. ADMIN STATS (Company Wide) ---
  if (isAdminView) {
    const pendingCount = leaves.filter((l) => l.status === "Pending").length;
    const approvedCount = leaves.filter((l) => l.status === "Approved").length;
    const rejectedCount = leaves.filter((l) => l.status === "Rejected").length;

    // Calculate "On Leave Today"
    // Checks if today falls between start_date and end_date (inclusive)
    const today = new Date().toISOString().split("T")[0];
    const onLeaveTodayCount = leaves.filter((l) => {
      return (
        l.status === "Approved" && l.start_date <= today && l.end_date >= today
      );
    }).length;

    const adminCards = [
      {
        title: "Pending Requests",
        icon: Clock,
        value: pendingCount,
        bg: "bg-warning/10",
        txtColor: "text-warning",
        desc: "Requires action"
      },
      {
        title: "On Leave Today",
        icon: Calendar,
        value: onLeaveTodayCount,
        bg: "bg-primary/10",
        txtColor: "text-primary",
        desc: "Active now"
      },
      {
        title: "Total Approved",
        icon: CircleCheck,
        value: approvedCount,
        bg: "bg-success/10",
        txtColor: "text-success",
        desc: "This year"
      },
      {
        title: "Total Rejected",
        icon: XCircle,
        value: rejectedCount,
        bg: "bg-error/10",
        txtColor: "text-error",
        desc: "This year"
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminCards.map((data, i) => (
          <LeaveGridCard key={i} data={data} />
        ))}
      </div>
    );
  }

  // --- 2. EMPLOYEE STATS (Personal Balances) ---
  // Using the structure from your store: { vacationRemaining: X, sickRemaining: Y }
  const vacationBal = leaveBalances?.vacationRemaining || 0;
  const sickBal = leaveBalances?.sickRemaining || 0;

  const employeeCards = [
    {
      title: "Vacation Balance",
      icon: Briefcase,
      value: vacationBal,
      bg: "bg-blue-500/10",
      txtColor: "text-blue-500",
      desc: "Days remaining"
    },
    {
      title: "Sick Leave Balance",
      icon: HeartPulse,
      value: sickBal,
      bg: "bg-rose-500/10",
      txtColor: "text-rose-500",
      desc: "Days remaining"
    },
    {
        title: "Pending Requests",
        icon: Clock,
        value: leaves.filter(l => l.status === "Pending").length,
        bg: "bg-warning/10",
        txtColor: "text-warning",
        desc: "Awaiting approval"
    },
    {
        title: "Approved History",
        icon: CircleCheck,
        value: leaves.filter(l => l.status === "Approved").length,
        bg: "bg-success/10",
        txtColor: "text-success",
        desc: "All time"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {employeeCards.map((data, i) => (
        <LeaveGridCard key={i} data={data} />
      ))}
    </div>
  );
};

export default LeaveStatsGrid;