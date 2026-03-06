import React, { useState, useMemo } from "react";
import { Search, FileText, User, Loader2, Eye, CheckCircle } from "lucide-react";
import { usePayrollStore } from "@/stores/usePayrollStore";
import PayslipTemplate from "./PayslipTemplate";
import ApprovePayrollModal from "./ApprovePayrollModal"; // <-- 1. IMPORT THE NEW MODAL

const PayrollTable = ({ canManage = false, canViewAll = false, currentUserId }) => {
  const { activeRunDetails, activePayRun, isFetchingDetails, approvePayRun, isFinalizing } = usePayrollStore();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  
  // <-- 2. ADD STATE FOR THE APPROVE MODAL
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false); 

  const formatMoney = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(parseFloat(val || 0));

  const filteredRecords = useMemo(() => {
    let records = activeRunDetails?.records || [];
    if (!records.length) return [];

    if (!canViewAll) {
      records = records.filter((rec) => rec.user_id === currentUserId);
    }

    return records.filter(
      (rec) =>
        rec.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.position?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [activeRunDetails, searchTerm, canViewAll, currentUserId]);

  const handleViewPayslip = (record) => {
    // ... (Keep your existing handleViewPayslip code exactly the same) ...
    const details = record.details || {};
    const attendance = details.attendance_summary || {};
    const allowanceList = details.allowance_breakdown || [];
    const deductionList = details.deduction_breakdown || [];
    const otList = details.overtime_breakdown || [];

    const hourlyRate = attendance.hourly_rate || 0;
    const totalPaidHours = (attendance.total_worked_hours || 0) + (attendance.paid_leave_hours || 0);

    const earnings = [];

    if (parseFloat(record.basic_salary) > 0) {
      earnings.push({
        label: "Basic Salary",
        amount: record.basic_salary,
        units: `${totalPaidHours} hrs × ₱${hourlyRate.toFixed(2)}/hr`, 
      });
    }

    if (otList.length > 0) {
      otList.forEach(ot => {
        const rateForThisOT = hourlyRate * (ot.multiplier || 1);
        earnings.push({
          label: `OT: ${ot.type}`,
          amount: ot.amount,
          units: `${ot.hours} hrs × ₱${rateForThisOT.toFixed(2)}/hr`, 
        });
      });
    } else if (parseFloat(record.overtime_pay) > 0) {
      earnings.push({
        label: "Overtime",
        amount: record.overtime_pay,
        units: "Approved OT",
      });
    }

    allowanceList.forEach(item => {
      earnings.push({
        label: item.name,
        amount: item.amount,
        units: "Fixed",
      });
    });

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
        tin: record.tin_number || "-",
        sss: record.sss_number || "-",
        philhealth: record.philhealth_number || "-",
        pagibig: record.pag_ibig_number || "-",
      },
      earnings: earnings,
      deductions: deductionList.map((d) => ({
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
      details: details, 
    };

    setSelectedPayslip(formattedData);
    setIsPayslipOpen(true);
  };

  // <-- 3. UPDATE THE APPROVE FUNCTIONS
  const handleOpenApproveModal = () => {
    if (!activeRunDetails?.meta?.id) return;
    setIsApproveModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!activeRunDetails?.meta?.id) return;
    const success = await approvePayRun(activeRunDetails.meta.id);
    if (success) {
      setIsApproveModalOpen(false); // Close modal on success
    }
  };

  if (!activePayRun) {
    return (
      <div className="bg-base-100 rounded-xl border border-white/10 p-10 text-center flex flex-col items-center justify-center h-[400px] opacity-50">
        <FileText size={48} strokeWidth={1} className="mb-4 opacity-50" />
        <h3 className="text-lg font-bold">No Period Selected</h3>
        <p className="text-sm">Select a payroll period from the left to view details.</p>
      </div>
    );
  }

  const isDraft = activeRunDetails?.meta?.status === 'Draft';

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="bg-base-100 rounded-xl border border-white/10 shadow-sm flex flex-col h-[calc(100vh-220px)] md:min-h-[500px]">
        
        {/* --- TOOLBAR --- */}
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100 z-20">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-sm hidden md:flex items-center gap-2">
              {canViewAll ? "Employee Breakdown" : "My Payslip"}
              <span className="text-xs opacity-50 font-normal">
                ({filteredRecords.length} records)
              </span>
            </h3>
            
            {activeRunDetails?.meta?.status && (
              <div className={`badge badge-sm font-bold border-none ${isDraft ? 'badge-warning text-warning-content' : 'badge-success text-success-content'}`}>
                {activeRunDetails.meta.status.toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {canViewAll && (
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
            )}

            {/* <-- 4. UPDATE BUTTON ONCLICK --> */}
            {canManage && isDraft && (
              <button 
                onClick={handleOpenApproveModal}
                disabled={isFinalizing}
                className="btn btn-sm btn-primary shadow-sm gap-2"
              >
                {isFinalizing ? <Loader2 className="animate-spin size-4" /> : <CheckCircle size={16} />}
                <span className="hidden sm:inline">Approve Payroll</span>
              </button>
            )}
          </div>
        </div>

        {/* --- SCROLLABLE TABLE CONTAINER --- */}
        <div className="overflow-auto flex-1 custom-scrollbar relative">
           {/* ... (Keep your table exactly the same) ... */}
           <table className="table table-sm w-full">
            <thead className="text-xs uppercase bg-base-200 text-base-content/60 font-bold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-3 pl-6 text-xxs uppercase tracking-wide">Employee</th>
                <th className="text-right text-xxs uppercase tracking-wide">Basic</th>
                <th className="text-right text-xxs uppercase tracking-wide">Overtime</th>
                <th className="text-right text-xxs uppercase tracking-wide text-emerald-600">Allowances</th>
                <th className="text-right text-error text-xxs uppercase tracking-wide">Deductions</th>
                <th className="text-right text-xxs uppercase tracking-wide">Net Pay</th>
                <th className="text-center pr-6 text-xxs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {isFetchingDetails ? (
                <tr>
                  <td colSpan="7" className="h-64 text-center">
                    <Loader2 className="animate-spin size-8 text-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="h-64 text-center opacity-40">
                    <User size={32} className="mx-auto" /> No employees found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-base-200/40 transition-colors group">
                    <td className="pl-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 rounded-full bg-base-300">
                            <img 
                              src={rec.profile_picture || "/images/default_profile.jpg"} 
                              alt={rec.fullname} 
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "/images/default_profile.jpg";
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-xs">{rec.fullname}</div>
                          <div className="text-xxs opacity-50 uppercase tracking-wide">{rec.position || "Staff"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-medium opacity-70 text-xxs whitespace-nowrap">{formatMoney(rec.basic_salary)}</td>
                    <td className="text-right font-medium text-xxs whitespace-nowrap">
                      {parseFloat(rec.overtime_pay) > 0 ? `+${formatMoney(rec.overtime_pay)}` : "-"}
                    </td>
                    <td className="text-right font-medium text-emerald-600 text-xxs whitespace-nowrap">
                        {parseFloat(rec.allowances) > 0 ? `+${formatMoney(rec.allowances)}` : "-"}
                    </td>
                    <td className="text-right font-medium text-error text-xxs whitespace-nowrap">
                      {parseFloat(rec.deductions) > 0 ? `-${formatMoney(rec.deductions)}` : "-"}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="font-bold text-base text-base-content text-xxs">{formatMoney(rec.net_pay)}</div>
                    </td>
                    <td className="text-center pr-6 whitespace-nowrap">
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

      {/* <-- 5. RENDER THE NEW MODAL --> */}
      <ApprovePayrollModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={confirmApprove}
        isFinalizing={isFinalizing}
        runName={activeRunDetails?.meta?.run_name}
      />
    </div>
  );
};

export default PayrollTable;