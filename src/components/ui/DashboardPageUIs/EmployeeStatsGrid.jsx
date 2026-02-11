import React from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from "recharts";
import { 
  CalendarDays, Wallet, Clock, Smile, Umbrella, ArrowRight 
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatUtils";

const COLORS = ['#005fb8', '#e2e8f0']; // Brand Primary vs Base-200

const EmployeeStatsGrid = ({ stats, user }) => {
  if (!stats) return null;

  const { leave_balances, active_loans, attendance_summary, next_payday } = stats;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HERO SECTION: Welcome & Quick Summary */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-[#004a94] text-white rounded-2xl shadow-lg p-6 md:p-10">
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-20 w-24 h-24 bg-secondary opacity-20 rounded-full blur-xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
          <div className="avatar placeholder">
            <div className="bg-white/10 text-white backdrop-blur-sm rounded-full w-20 h-20 border-2 border-white/20 shadow-inner">
              <span className="text-3xl font-bold">{user?.fullname?.charAt(0)}</span>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Hello, {user?.fullname?.split(" ")[0]}!</h2>
            <p className="opacity-80 text-sm mt-1 max-w-md">
              You are doing great! You have attended <span className="font-bold text-secondary">{attendance_summary?.days_present || 0} days</span> this month.
              Your next payday is on <span className="font-bold border-b border-white/30">{next_payday !== "TBA" ? formatDate(next_payday) : "TBA"}</span>.
            </p>
          </div>
          <div className="hidden md:block ml-auto">
             <button className="btn bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md gap-2">
               View Profile <ArrowRight size={16} />
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 2. LEAVE BALANCES (Donut Charts) */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 opacity-70">
                  <Umbrella size={16} /> LEAVE BALANCE
                </h3>
             </div>
             
             {leave_balances.length === 0 ? (
               <div className="h-40 flex items-center justify-center opacity-40 text-sm italic">
                 No leave credits assigned.
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-4">
                  {leave_balances.slice(0, 2).map((leave, idx) => {
                    const data = [
                      { name: 'Remaining', value: parseInt(leave.remaining) },
                      { name: 'Used', value: parseInt(leave.used_days) },
                    ];
                    return (
                      <div key={idx} className="flex flex-col items-center bg-base-200/30 rounded-xl p-3">
                        <div className="h-20 w-20 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={data}
                                innerRadius={25}
                                outerRadius={35}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                startAngle={90}
                                endAngle={-270}
                              >
                                <Cell fill={leave.color_code || COLORS[0]} />
                                <Cell fill="#cbd5e1" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          {/* Centered Text */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold leading-none">{leave.remaining}</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-2 opacity-60 text-center truncate w-full">{leave.name}</p>
                      </div>
                    );
                  })}
               </div>
             )}
          </div>
        </div>

        {/* 3. ATTENDANCE (Stat Blocks) */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
           <div className="card-body p-6">
             <h3 className="text-sm font-bold flex items-center gap-2 opacity-70 mb-4">
               <Clock size={16} /> THIS MONTH
             </h3>
             <div className="flex flex-col h-full gap-3">
                
                {/* Present Block */}
                <div className="flex-1 bg-gradient-to-r from-emerald-50 to-base-100 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                   <div>
                      <div className="text-2xl font-black text-emerald-600">{attendance_summary?.days_present || 0}</div>
                      <div className="text-[10px] font-bold text-emerald-800 opacity-60 uppercase">Days Present</div>
                   </div>
                   <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                      <Smile size={20} />
                   </div>
                </div>

                {/* Late Block */}
                <div className="flex-1 bg-gradient-to-r from-orange-50 to-base-100 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                   <div>
                      <div className="text-2xl font-black text-orange-600">{attendance_summary?.late_count || 0}</div>
                      <div className="text-[10px] font-bold text-orange-800 opacity-60 uppercase">Late Arrivals</div>
                   </div>
                   <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                      <Clock size={20} />
                   </div>
                </div>

             </div>
           </div>
        </div>

        {/* 4. LOANS (Progress Bars) */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
           <div className="card-body p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 opacity-70">
                  <Wallet size={16} /> ACTIVE LOANS
                </h3>
                <span className="badge badge-xs badge-ghost">{active_loans.length} Active</span>
              </div>

              {active_loans.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center">
                   <div className="p-3 bg-base-200 rounded-full mb-2">
                     <Smile size={24} />
                   </div>
                   <p className="text-xs">No active loans. Good job!</p>
                </div>
              ) : (
                <div className="space-y-5 overflow-y-auto max-h-[200px] pr-2 scrollbar-thin">
                   {active_loans.map((loan, idx) => {
                     const percent = Math.min(100, Math.round((loan.paid_loan_amount / loan.total_loan_amount) * 100));
                     return (
                       <div key={idx} className="group">
                         <div className="flex justify-between text-xs mb-1.5">
                           <span className="font-bold group-hover:text-primary transition-colors">{loan.name}</span>
                           <span className="font-mono opacity-60">{formatCurrency(loan.balance)} left</span>
                         </div>
                         <div className="w-full bg-base-200 rounded-full h-2.5 overflow-hidden">
                           <div 
                             className="bg-primary h-full rounded-full transition-all duration-1000 ease-out relative" 
                             style={{ width: `${percent}%` }}
                           >
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                           </div>
                         </div>
                         <div className="flex justify-between mt-1">
                           <span className="text-[10px] opacity-40">{percent}% Paid</span>
                           <span className="text-[10px] opacity-40">{formatCurrency(loan.total_loan_amount)} Total</span>
                         </div>
                       </div>
                     );
                   })}
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeStatsGrid;