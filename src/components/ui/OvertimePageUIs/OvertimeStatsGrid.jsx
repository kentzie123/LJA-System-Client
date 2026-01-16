import { useEffect } from "react";
import { Clock, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { useOvertimeStore } from "@/stores/useOvertimeStore";

const OvertimeGridCard = ({ data }) => {
  let Icon = data.icon;

  return (
    <div className="card flex-row gap-4 p-4 bg-base-100 shadow-sm border border-base-200">
      <div
        className={`${data.bg} p-3 flex items-center justify-center rounded-lg`}
      >
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

const OvertimeStatsGrid = () => {
  const { overtimeRequests, fetchAllOvertime } = useOvertimeStore();

  // Fetch data on mount to ensure stats are fresh
  useEffect(() => {
    fetchAllOvertime();
  }, [fetchAllOvertime]);

  // --- CALCULATIONS ---
  const currentYear = new Date().getFullYear();

  // 1. Status Counts
  const pendingCount = overtimeRequests.filter(
    (r) => r.status === "Pending"
  ).length;
  const approvedCount = overtimeRequests.filter(
    (r) => r.status === "Approved"
  ).length;
  const rejectedCount = overtimeRequests.filter(
    (r) => r.status === "Rejected"
  ).length;

  // 2. Total Hours (YTD) - Sum of 'total_hours' for Approved requests this year
  const totalHoursYTD = overtimeRequests
    .filter((r) => {
      const isApproved = r.status === "Approved";
      const isCurrentYear = new Date(r.ot_date).getFullYear() === currentYear;
      return isApproved && isCurrentYear;
    })
    .reduce((sum, r) => sum + Number(r.total_hours || 0), 0);

  const cardDatas = [
    {
      title: "Pending Requests",
      icon: Hourglass,
      value: pendingCount,
      bg: "bg-warning/10",
      txtColor: "text-warning",
    },
    {
      title: "Approved Requests",
      icon: CheckCircle,
      value: approvedCount,
      bg: "bg-success/10",
      txtColor: "text-success",
    },
    {
      title: "Rejected Requests",
      icon: XCircle,
      value: rejectedCount,
      bg: "bg-error/10",
      txtColor: "text-error",
    },
    {
      title: "Total Overtime (YTD)",
      icon: Clock,
      value: `${totalHoursYTD.toFixed(1)} hrs`,
      bg: "bg-primary/10",
      txtColor: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardDatas.map((data, i) => (
        <OvertimeGridCard key={i} data={data} />
      ))}
    </div>
  );
};

export default OvertimeStatsGrid;
