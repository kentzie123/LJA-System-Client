import React, { useState, useMemo } from "react";
import { Search, FileText, User, MoreVertical, Loader2 } from "lucide-react";
import { usePayrollStore } from "@/stores/usePayrollStore";

const PayrollTable = () => {
  const { activeRunRecords, activePayRun, isLoading } = usePayrollStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Helper: Money Formatter
  const formatMoney = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(parseFloat(val || 0));

  // Filter Logic (Client-side search)
  const filteredRecords = useMemo(() => {
    if (!activeRunRecords) return [];
    return activeRunRecords.filter(
      (rec) =>
        rec.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeRunRecords, searchTerm]);

  // --- EMPTY STATE: No Payroll Selected ---
  if (!activePayRun) {
    return (
      <div className="bg-base-100 rounded-xl border border-white/10 p-10 text-center flex flex-col items-center justify-center h-[400px] opacity-50">
        <FileText size={48} strokeWidth={1} className="mb-4 opacity-50" />
        <h3 className="text-lg font-bold">No Period Selected</h3>
        <p className="text-sm">
          Select a payroll period from the left to view details.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-100 rounded-xl border border-white/10 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* TOOLBAR */}
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-sm hidden md:block">
            Employee Breakdown
            <span className="ml-2 text-xs opacity-50 font-normal">
              ({filteredRecords.length} records)
            </span>
          </h3>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-40" />
            <input
              type="text"
              placeholder="Search employee..."
              className="input input-sm input-bordered bg-base-200/50 w-full pl-9 focus:outline-none focus:border-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto flex-1">
          <table className="table table-sm w-full">
            {/* Header */}
            <thead className="text-xs uppercase bg-base-200/30 text-base-content/60 font-bold sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="py-3 pl-6 text-xxs uppercase tracking-wide">Employee</th>
                <th className="text-right text-xxs uppercase tracking-wide">Basic</th>
                <th className="text-right text-xxs uppercase tracking-wide">Overtime</th>
                <th className="text-right text-error text-xxs uppercase tracking-wide">Deductions</th>
                <th className="text-right pr-6 text-xxs uppercase tracking-wide">Net Pay</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="text-sm divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <Loader2 className="animate-spin size-8 text-primary" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="h-64 text-center opacity-40">
                    <div className="flex flex-col items-center gap-2">
                      <User size={32} />
                      <span>No employees found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-base-200/40 transition-colors group"
                  >
                    <td className="pl-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-8">
                            <span className="text-xs">
                              {rec.fullname.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-sm">
                            {rec.fullname}
                          </div>
                          <div className="text-[10px] opacity-50 uppercase tracking-wide">
                            {rec.position || "Staff"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="text-right font-medium opacity-70">
                      {formatMoney(rec.basic_salary)}
                    </td>

                    <td className="text-right font-medium text-success">
                      {parseFloat(rec.overtime_pay) > 0 ? (
                        `+${formatMoney(rec.overtime_pay)}`
                      ) : (
                        <span className="opacity-20">-</span>
                      )}
                    </td>

                    <td className="text-right font-medium text-error">
                      {parseFloat(rec.deductions) > 0 ? (
                        `-${formatMoney(rec.deductions)}`
                      ) : (
                        <span className="opacity-20">-</span>
                      )}
                    </td>

                    <td className="text-right pr-6">
                      <div className="font-bold text-base text-base-content">
                        {formatMoney(rec.net_pay)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollTable;
