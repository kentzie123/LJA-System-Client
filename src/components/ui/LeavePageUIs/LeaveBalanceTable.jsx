import React, { useState, useMemo } from "react";
import { Search, Loader2, User, Umbrella, Stethoscope } from "lucide-react";

// --- SUB-COMPONENT: Visual Progress Bar ---
const LeaveStatBar = ({ used, allocated, remaining }) => {
  const percentage = allocated > 0 ? (used / allocated) * 100 : 0;
  
  // Color code the bar based on how much they've used
  const barColor = 
    percentage >= 90 ? "bg-error" : 
    percentage >= 70 ? "bg-warning" : "bg-primary";

  return (
    <div className="flex flex-col items-center w-full max-w-[120px] mx-auto gap-1.5">
      <div className="flex items-end gap-1">
        <span className="text-sm font-black text-base-content">{remaining}</span>
        <span className="text-[10px] font-bold uppercase opacity-50 mb-[2px]">Left</span>
      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <span className="text-[9px] font-semibold opacity-40 uppercase tracking-wider">
        {used} / {allocated} Used
      </span>
    </div>
  );
};

const LeaveBalanceTable = ({ balances = [], isFetching = false }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const groupedBalances = useMemo(() => {
    const groups = {};
    
    balances.forEach((b) => {
      if (!groups[b.user_id]) {
        groups[b.user_id] = {
          fullname: b.fullname,
          profile_picture: b.profile_picture,
          leaves: {},
        };
      }
      
      const allocated = Number(b.allocated_days) || 0;
      const used = Number(b.used_days) || 0;
      
      groups[b.user_id].leaves[b.leave_name] = {
        allocated,
        used,
        remaining: allocated - used,
      };
    });
    
    return Object.values(groups).filter((emp) =>
      emp.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [balances, searchTerm]);

  return (
    <div className="w-full h-full bg-base-100 rounded-2xl shadow-sm border border-base-200 flex flex-col overflow-hidden relative">
      
      {/* TOOLBAR */}
      <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100 shrink-0 relative z-20">
        <div className="font-bold text-base-content/80 px-2 hidden md:block">
          Company Leave Ledger
        </div>
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 z-10" />
          <input
            type="text"
            placeholder="Search by employee name..."
            className="input input-sm pl-9 bg-base-200/50 border-transparent hover:bg-base-200 focus:bg-base-100 focus:border-primary w-full rounded-xl transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="table table-sm w-full min-w-[700px]">
          <thead className="bg-base-200/50 text-[10px] font-black text-base-content/50 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="py-4 pl-6 bg-transparent border-b border-base-200">Employee</th>
              <th className="text-center bg-transparent border-b border-base-200">
                <div className="flex items-center justify-center gap-1.5">
                  <Umbrella size={12} className="opacity-70" /> Vacation
                </div>
              </th>
              <th className="text-center bg-transparent border-b border-base-200">
                <div className="flex items-center justify-center gap-1.5">
                  <Stethoscope size={12} className="opacity-70" /> Sick Leave
                </div>
              </th>
              <th className="text-center pr-6 bg-transparent border-b border-base-200">Total Credits</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-base-200/60">
            {isFetching ? (
              <tr>
                <td colSpan="4" className="h-[400px] text-center">
                  <Loader2 className="animate-spin size-8 text-primary/40 mx-auto" />
                </td>
              </tr>
            ) : groupedBalances.length === 0 ? (
              <tr>
                <td colSpan="4" className="h-[400px] text-center opacity-50">
                  <User size={48} className="mx-auto mb-3 opacity-20" strokeWidth={1.5} />
                  <h3 className="text-sm font-bold">No employee records found.</h3>
                </td>
              </tr>
            ) : (
              groupedBalances.map((emp, idx) => {
                const vl = emp.leaves["Vacation Leave"] || { used: 0, allocated: 0, remaining: 0 };
                const sl = emp.leaves["Sick Leave"] || { used: 0, allocated: 0, remaining: 0 };
                const totalRemaining = vl.remaining + sl.remaining;

                return (
                  <tr key={idx} className="hover:bg-base-200/30 transition-colors group">
                    
                    {/* 1. Employee Profile */}
                    <td className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full ring-1 ring-base-300 ring-offset-2 ring-offset-base-100 group-hover:ring-primary/30 transition-all">
                            <img
                              src={emp.profile_picture || "/images/default_profile.jpg"}
                              alt={emp.fullname}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                           <span className="font-bold text-sm leading-none mb-1 text-base-content">{emp.fullname}</span>
                           <span className="text-[10px] font-semibold text-base-content/40 uppercase tracking-wider">Staff</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Vacation Progress */}
                    <td className="text-center py-4">
                      <LeaveStatBar 
                        used={vl.used} 
                        allocated={vl.allocated} 
                        remaining={vl.remaining} 
                      />
                    </td>

                    {/* 3. Sick Leave Progress */}
                    <td className="text-center py-4">
                      <LeaveStatBar 
                        used={sl.used} 
                        allocated={sl.allocated} 
                        remaining={sl.remaining} 
                      />
                    </td>

                    {/* 4. Total Badge */}
                    <td className="text-center pr-6 py-4">
                      <div 
                        className={`badge font-black py-3 px-3 shadow-sm ${
                          totalRemaining <= 3 
                            ? 'bg-error/10 text-error border-none' 
                            : 'bg-success/10 text-success border-none'
                        }`}
                      >
                        {totalRemaining} DAYS
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveBalanceTable;