"use client";

import React, { useState, useMemo } from "react";
import { Search, Loader2, Umbrella, Stethoscope, Briefcase } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";

// --- SUB-COMPONENT: Visual Progress Bar (Ultra-Compact) ---
const LeaveStatBar = ({ used, allocated, remaining }) => {
  const percentage = allocated > 0 ? (used / allocated) * 100 : 0;
  
  // Color code the bar based on how much they've used
  const barColor = 
    percentage >= 90 ? "bg-error" : 
    percentage >= 70 ? "bg-warning" : "bg-primary";

  return (
    <div className="flex flex-col items-center w-full max-w-[100px] mx-auto gap-0.5">
      <div className="flex items-end justify-center gap-1 w-full relative">
        <span className="text-[13px] font-black tracking-tight leading-none text-base-content tabular-nums">
          {remaining}
        </span>
        <span className="text-[8px] font-bold uppercase text-base-content/40 mb-[1px]">Left</span>
      </div>
      
      {/* Progress Bar Container - Very Thin */}
      <div className="w-full h-1 bg-base-300/50 rounded-full overflow-hidden mt-0.5">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <span className="text-[8px] font-bold text-base-content/40 uppercase tracking-widest mt-0.5">
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
    <div className="w-full h-full bg-base-100 rounded-xl shadow-sm border border-base-200 flex flex-col overflow-hidden relative antialiased-text">
      
      {/* TOOLBAR: Compact h-8 inputs */}
      <div className="p-3 flex flex-col md:flex-row justify-between items-center gap-3 bg-base-100 shrink-0 border-b border-base-200">
        <div className="font-black text-[12px] uppercase tracking-wider text-base-content/80 px-1 hidden md:block">
          Company Leave Ledger
        </div>
        <div className="relative w-full md:w-64">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50 z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by employee name..."
            className="input input-sm h-8 min-h-0 pl-8 bg-base-200/50 border-base-300 text-[11px] focus:bg-base-100 focus:border-primary w-full rounded-md transition-colors placeholder:text-base-content/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE: High Density Row Heights */}
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="table table-xs w-full min-w-[600px]">
          <thead className="bg-base-200/50 text-[9px] font-black text-base-content/50 uppercase tracking-[0.2em] sticky top-0 z-10">
            <tr>
              <th className="py-2.5 pl-4 bg-transparent border-b border-base-200">Employee Details</th>
              <th className="text-center bg-transparent border-b border-base-200">
                <div className="flex items-center justify-center gap-1">
                  <Umbrella size={10} className="opacity-60" /> Vacation Leave
                </div>
              </th>
              <th className="text-center bg-transparent border-b border-base-200">
                <div className="flex items-center justify-center gap-1">
                  <Stethoscope size={10} className="opacity-60" /> Sick Leave
                </div>
              </th>
              <th className="text-center pr-4 bg-transparent border-b border-base-200">Total Available</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-base-200">
            {isFetching ? (
              <tr>
                <td colSpan="4" className="h-[300px] text-center">
                  <Loader2 className="animate-spin size-6 text-primary/50 mx-auto" />
                </td>
              </tr>
            ) : groupedBalances.length === 0 ? (
              <tr>
                <td colSpan="4" className="h-[300px] text-center opacity-40">
                  <Briefcase size={32} className="mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">No records found</h3>
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
                    <td className="pl-4 py-2">
                      <div className="flex items-center gap-2.5 w-fit">
                        <div className="avatar shrink-0">
                          <div className="w-8 h-8 relative overflow-hidden rounded-full border border-base-300 bg-base-200 shadow-sm">
                            <Image
                              src={emp.profile_picture ? getImageUrl(emp.profile_picture) : "/images/default_profile.jpg"}
                              alt={emp.fullname}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="font-bold text-[12px] leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                             {emp.fullname}
                           </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Vacation Progress */}
                    <td className="text-center py-2 align-middle">
                      <LeaveStatBar 
                        used={vl.used} 
                        allocated={vl.allocated} 
                        remaining={vl.remaining} 
                      />
                    </td>

                    {/* 3. Sick Leave Progress */}
                    <td className="text-center py-2 align-middle">
                      <LeaveStatBar 
                        used={sl.used} 
                        allocated={sl.allocated} 
                        remaining={sl.remaining} 
                      />
                    </td>

                    {/* 4. Total Badge */}
                    <td className="text-center pr-4 py-2 align-middle">
                      <div 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest uppercase border ${
                          totalRemaining <= 3 
                            ? 'bg-error/10 text-error border-error/20' 
                            : 'bg-success/10 text-success border-success/20'
                        }`}
                      >
                        {totalRemaining} <span className="opacity-50 ml-1">Days</span>
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