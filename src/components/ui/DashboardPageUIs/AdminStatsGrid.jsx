import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend 
} from "recharts";
import { Users, Clock, AlertCircle, TrendingUp, DollarSign, Briefcase } from "lucide-react";
import { formatCurrency } from "@/utils/formatUtils"; 

// --- COLORS ---
const COLORS = {
  primary: "#005fb8",
  secondary: "#f6e72a",
  success: "#22c55e",
  warning: "#facc15",
  error: "#ef4444",
  slate: "#64748b"
};

// --- MINI STAT CARD ---
const MiniStatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="card bg-base-100 shadow-sm border border-base-200 p-5 hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black tabular-nums tracking-tight text-base-content">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={`badge badge-xs ${trend > 0 ? 'badge-success text-white' : 'badge-error text-white'} font-bold border-none`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="text-[10px] opacity-50">vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-current`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

const AdminStatsGrid = ({ stats }) => {
  if (!stats) return null;

  const { employees, attendance, pending_actions, last_payroll } = stats;

  // --- MOCK DATA (Ideally this comes from your backend service historical queries) ---
  
  // 1. Attendance History (Past 5 Days)
  const attendanceData = [
    { name: 'Mon', present: 45, late: 2, absent: 3 },
    { name: 'Tue', present: 48, late: 1, absent: 1 },
    { name: 'Wed', present: 44, late: 5, absent: 1 },
    { name: 'Thu', present: 47, late: 2, absent: 1 },
    { name: 'Fri', present: attendance?.present_today || 42, late: attendance?.late_today || 4, absent: attendance?.on_leave || 2 },
  ];

  // 2. Payroll Trend (Past 6 Months)
  const payrollTrend = [
    { month: 'Jan', amount: 420000 },
    { month: 'Feb', amount: 435000 },
    { month: 'Mar', amount: 430000 },
    { month: 'Apr', amount: 450000 },
    { month: 'May', amount: 465000 },
    { month: 'Jun', amount: last_payroll?.total_payout || 480000 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 1. TOP ROW - KPI METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard 
          title="Total Workforce" 
          value={employees.total_employees} 
          icon={Users} 
          colorClass="text-primary bg-primary"
          trend={2.5}
        />
        <MiniStatCard 
          title="On Time Today" 
          value={attendance.present_today} 
          icon={Clock} 
          colorClass="text-emerald-600 bg-emerald-100" 
        />
        <MiniStatCard 
          title="Pending Actions" 
          value={Number(pending_actions.pending_leaves) + Number(pending_actions.pending_ot) + Number(pending_actions.pending_attendance)} 
          icon={AlertCircle} 
          colorClass="text-warning bg-warning" 
        />
        <MiniStatCard 
          title="Last Payroll" 
          value={formatCurrency(last_payroll?.total_payout || 0)} 
          icon={DollarSign} 
          colorClass="text-purple-600 bg-purple-100" 
          trend={5.4}
        />
      </div>

      {/* 2. MIDDLE ROW - CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: WEEKLY ATTENDANCE (Stacked Bar) */}
        <div className="card bg-base-100 shadow-sm border border-base-200 lg:col-span-2">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users size={18} className="text-primary" /> Attendance Overview
                </h3>
                <p className="text-xs opacity-50">Weekly breakdown of employee presence</p>
              </div>
              <select className="select select-bordered select-xs">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="present" name="Present" stackId="a" fill={COLORS.primary} radius={[0, 0, 4, 4]} />
                  <Bar dataKey="late" name="Late" stackId="a" fill={COLORS.warning} />
                  <Bar dataKey="absent" name="On Leave/Absent" stackId="a" fill={COLORS.slate} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT: COST TREND (Area Chart) */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
             <div>
               <h3 className="font-bold text-lg flex items-center gap-2">
                 <TrendingUp size={18} className="text-purple-600" /> Cost Analysis
               </h3>
               <p className="text-xs opacity-50">6-Month Payroll History</p>
             </div>

             <div className="h-56 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={payrollTrend}>
                   <defs>
                     <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                       <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Tooltip 
                     formatter={(value) => formatCurrency(value)}
                     contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="amount" 
                     stroke={COLORS.primary} 
                     strokeWidth={3}
                     fill="url(#colorPayroll)" 
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>

             {/* Summary Footer */}
             <div className="mt-4 pt-4 border-t border-base-200">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold opacity-50">YTD TOTAL</span>
                   <span className="text-xl font-black tabular-nums">₱ 2.6M</span>
                </div>
                <progress className="progress progress-primary w-full mt-2" value="70" max="100"></progress>
                <p className="text-[10px] opacity-40 mt-1 text-right">70% of annual budget used</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminStatsGrid;