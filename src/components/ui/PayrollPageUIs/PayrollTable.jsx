import React, { useState, useMemo } from "react";
import { Search, FileText, User, Loader2, Eye } from "lucide-react";
import { usePayrollStore } from "@/stores/usePayrollStore";
import PayslipTemplate from "./PayslipTemplate";

const PayrollTable = ({ canManage = false }) => {
  // <--- 1. ACCEPT PROP
  const { activeRunDetails, activePayRun, isFetchingDetails } =
    usePayrollStore();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  const formatMoney = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(parseFloat(val || 0));

  const filteredRecords = useMemo(() => {
    const records = activeRunDetails?.records || [];
    if (!records.length) return [];
    return records.filter(
      (rec) =>
        rec.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.position?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [activeRunDetails, searchTerm]);

  const handleViewPayslip = (record) => {
    const formattedData = {
      payrollRun: {
        startDate: activeRunDetails.meta.start_date,
        endDate: activeRunDetails.meta.end_date,
        paymentDate: activeRunDetails.meta.pay_date,
      },
      employee: {
        id: `EMP-${record.user_id.toString().padStart(3, "0")}`,
        name: record.fullname,
        position: record.position || "Employee",
        department: "LJA Power",
        tin: record.email,
        sss: "-",
        philhealth: "-",
        pagibig: "-",
      },
      earnings: [
        {
          label: "Basic Salary",
          amount: record.basic_salary,
          units: "Attendance",
        },
        {
          label: "Overtime",
          amount: record.overtime_pay,
          units: "Approved OT",
        },
        { label: "Allowances", amount: record.allowances },
      ],
      deductions: record.details.deduction_breakdown.map((d) => ({
        label: d.name,
        amount: d.amount,
      })),
      loans: [],
      totals: {
        gross:
          parseFloat(record.basic_salary) +
          parseFloat(record.overtime_pay) +
          parseFloat(record.allowances),
        total_deductions: parseFloat(record.deductions),
        net_pay: parseFloat(record.net_pay),
      },
    };

    setSelectedPayslip(formattedData);
    setIsPayslipOpen(true);
  };

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
        {/* --- TOOLBAR --- */}
        {/* If you have buttons like "Process Payroll" or "Recalculate", hide them using canManage */}
        {/* Example: {canManage && <button>Process</button>} */}

        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-sm hidden md:block">
            Employee Breakdown
            <span className="ml-2 text-xs opacity-50 font-normal">
              ({filteredRecords.length} records)
            </span>
          </h3>
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

        {/* --- TABLE --- */}
        <div className="overflow-x-auto flex-1">
          <table className="table table-sm w-full">
            <thead className="text-xs uppercase bg-base-200/30 text-base-content/60 font-bold sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="py-3 pl-6 text-xxs uppercase tracking-wide">
                  Employee
                </th>
                <th className="text-right text-xxs uppercase tracking-wide">
                  Basic
                </th>
                <th className="text-right text-xxs uppercase tracking-wide">
                  Overtime
                </th>
                <th className="text-right text-error text-xxs uppercase tracking-wide">
                  Deductions
                </th>
                <th className="text-right text-xxs uppercase tracking-wide">
                  Net Pay
                </th>
                <th className="text-center pr-6 text-xxs uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {isFetchingDetails ? (
                <tr>
                  <td colSpan="6" className="h-64 text-center">
                    <Loader2 className="animate-spin size-8 text-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="h-64 text-center opacity-40">
                    <User size={32} className="mx-auto" /> No employees found.
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
                          <div className="font-semibold text-xs">
                            {rec.fullname}
                          </div>
                          <div className="text-xxs opacity-50 uppercase tracking-wide">
                            {rec.position || "Staff"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-medium opacity-70 text-xxs">
                      {formatMoney(rec.basic_salary)}
                    </td>
                    <td className="text-right font-medium text-success text-xxs">
                      {parseFloat(rec.overtime_pay) > 0
                        ? `+${formatMoney(rec.overtime_pay)}`
                        : "-"}
                    </td>
                    <td className="text-right font-medium text-error">
                      {parseFloat(rec.deductions) > 0
                        ? `-${formatMoney(rec.deductions)}`
                        : "-"}
                    </td>
                    <td className="text-right">
                      <div className="font-bold text-base text-base-content text-xxs">
                        {formatMoney(rec.net_pay)}
                      </div>
                    </td>

                    {/* ACTION COLUMN */}
                    <td className="text-center pr-6">
                      <button
                        onClick={() => handleViewPayslip(rec)}
                        className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 gap-2"
                      >
                        <Eye size={16} />
                        <span className="hidden md:inline">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PayslipTemplate
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        data={selectedPayslip}
      />
    </div>
  );
};

export default PayrollTable;
