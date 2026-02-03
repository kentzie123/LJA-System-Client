"use client"

import React from "react";
import { 
  Users, 
  DollarSign, 
  Clock, 
  Calendar, 
  Briefcase, 
  FileText, 
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatCurrency } from "@/utils/formatUtils"; // Assuming you have this helper

const DashboardPage = () => {
  const { authUser } = useAuthStore();
  const isAdmin = authUser?.role_id === 1 || authUser?.role_id === 3; // 1=Admin, 3=HR (Adjust IDs as needed)

  // --- 1. DYNAMIC STATS CONFIGURATION ---
  const adminStats = [
    { label: "Total Employees", value: "42", icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "On Leave Today", value: "3", icon: Calendar, color: "text-warning", bg: "bg-warning/10" },
    { label: "Late Arrivals", value: "5", icon: Clock, color: "text-error", bg: "bg-error/10" },
    { label: "Pending Approvals", value: "12", icon: FileText, color: "text-info", bg: "bg-info/10" },
  ];

  const staffStats = [
    { label: "Leave Balance", value: "10 Days", icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
    { label: "Attendance Rate", value: "98%", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { label: "Late Minutes (Feb)", value: "15m", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    { label: "Next Payout", value: "Feb 15", icon: DollarSign, color: "text-info", bg: "bg-info/10" },
  ];

  const stats = isAdmin ? adminStats : staffStats;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-base-content/60">
            Welcome back, <span className="text-primary font-semibold">{authUser?.fullname}</span>!
          </p>
        </div>
        
        {/* Quick Action Button (Role Based) */}
        <button className="btn btn-primary btn-sm">
          {isAdmin ? "+ Add Employee" : "+ File Leave"}
        </button>
      </div>

      {/* --- STATS GRID (Responsive) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
            <div className="card-body p-5 flex flex-row items-center justify-between">
              <div>
                <p className="text-xs font-bold opacity-60 uppercase tracking-wide">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MAIN CONTENT AREA (2 Columns) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3 width) - Charts or Tables */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Activity Table */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-0">
              <div className="p-4 border-b border-base-200 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase opacity-70">
                  {isAdmin ? "Recent Activities" : "My Recent Logs"}
                </h3>
                <button className="btn btn-xs btn-ghost">View All</button>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr className="bg-base-200/50 text-xs uppercase">
                      <th>Action / Type</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* MOCK DATA - Replace with mapped real data */}
                    <tr className="hover:bg-base-100">
                      <td className="font-medium">
                        {isAdmin ? "Kent Goc-ong filed for Vacation" : "Clocked In - Morning"}
                      </td>
                      <td className="opacity-70 text-xs">Feb 2, 8:00 AM</td>
                      <td><span className="badge badge-success badge-xs">Completed</span></td>
                    </tr>
                    <tr className="hover:bg-base-100">
                      <td className="font-medium">
                        {isAdmin ? "New Applicant Registered" : "Clocked Out - Afternoon"}
                      </td>
                      <td className="opacity-70 text-xs">Feb 1, 5:00 PM</td>
                      <td><span className="badge badge-info badge-xs">Logged</span></td>
                    </tr>
                    <tr className="hover:bg-base-100">
                      <td className="font-medium">
                        {isAdmin ? "Payroll Generated (Feb A)" : "Leave Request: Sick"}
                      </td>
                      <td className="opacity-70 text-xs">Jan 30, 2:00 PM</td>
                      <td><span className={`badge badge-xs ${isAdmin ? "badge-success" : "badge-warning"}`}>
                        {isAdmin ? "Sent" : "Pending"}
                      </span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3 width) - Notifications / Quick Info */}
        <div className="space-y-6">
          
          {/* Notice Board */}
          <div className="card bg-primary text-primary-content shadow-lg">
            <div className="card-body p-5">
              <h3 className="font-bold flex items-center gap-2">
                <AlertCircle size={18} /> Important Notice
              </h3>
              <p className="text-sm opacity-90 mt-1">
                System maintenance scheduled for Feb 5th at 10:00 PM. Please save your work.
              </p>
            </div>
          </div>

          {/* Quick List (Role Based) */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
             <div className="card-body p-5">
               <h3 className="font-bold text-sm uppercase opacity-70 mb-4">
                 {isAdmin ? "Pending Approvals" : "Upcoming Holidays"}
               </h3>
               
               <ul className="space-y-3">
                 {[1, 2, 3].map((i) => (
                   <li key={i} className="flex items-center gap-3 text-sm p-2 hover:bg-base-200 rounded-lg cursor-pointer transition-colors">
                     <div className="w-2 h-2 rounded-full bg-secondary"></div>
                     <span className="flex-1 font-medium">
                       {isAdmin ? `Leave Request #${100+i}` : `Holiday Event ${i}`}
                     </span>
                     <span className="text-xs opacity-50">Today</span>
                   </li>
                 ))}
               </ul>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;