import { useEffect } from "react";
import { Clock, CircleCheck, Briefcase, HeartPulse } from "lucide-react";
import { useLeaveStore } from "@/stores/useLeaveStore";

const LeaveGridCard = ({ data }) => {
  let Icon = data.icon;

  return (
    <div className="card flex-row gap-4 p-4 bg-base-100 shadow-sm border border-base-200">
      <div className={`${data.bg} p-3 flex items-center justify-center rounded-lg`}>
        <Icon className={`${data.txtColor} size-6`} />
      </div>
      <div>
        <div className="tracking-wider uppercase text-xxs font-bold opacity-60">
          {data.title}
        </div>
        <div className="font-bold text-2xl">{data.value}</div>
      </div>
    </div>
  );
};

const LeaveStatsGrid = () => {
  const { leaves, fetchAllLeaves, leaveBalances, fetchLeaveBalances } = useLeaveStore();

  // Load data on mount
  useEffect(() => {
    fetchAllLeaves();
    if (fetchLeaveBalances) fetchLeaveBalances(); // Only runs if you add the balance logic below
  }, [fetchAllLeaves, fetchLeaveBalances]);

  // 1. Calculate Status Counts from the 'leaves' array
  const pendingCount = leaves.filter((l) => l.status === "Pending").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;

  // 2. Get Balances (handling safely if data isn't there yet)
  // Assuming leaveBalances looks like: { vacationUsed: 2, vacationTotal: 15, ... }
  const vacationBal = leaveBalances?.vacationRemaining || 0; 
  const sickBal = leaveBalances?.sickRemaining || 0;

  const cardDatas = [
    {
      title: "Pending Requests",
      icon: Clock,
      value: pendingCount,
      bg: "bg-primary/10",
      txtColor: "text-primary",
    },
    {
      title: "Approved (Total)",
      icon: CircleCheck,
      value: approvedCount,
      bg: "bg-success/10",
      txtColor: "text-success",
    },
    {
      title: "Vacation Balance",
      icon: Briefcase,
      value: vacationBal, 
      bg: "bg-warning/10",
      txtColor: "text-warning",
    },
    {
      title: "Sick Leave Balance",
      icon: HeartPulse,
      value: sickBal, 
      bg: "bg-error/10",
      txtColor: "text-error",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardDatas.map((data, i) => (
        <LeaveGridCard key={i} data={data} />
      ))}
    </div>
  );
};

export default LeaveStatsGrid;