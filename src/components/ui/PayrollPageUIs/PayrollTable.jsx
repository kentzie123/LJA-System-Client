"use client";

import React, { useState, useMemo } from "react";
import { Search, FileText, User, Loader2, Eye, CheckCircle } from "lucide-react";
import { usePayrollStore } from "@/stores/usePayrollStore";
import PayslipTemplate from "./PayslipTemplate";
import ApprovePayrollModal from "./ApprovePayrollModal"; 

import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";

const PayrollTable = ({ canManage = false, canViewAll = false, currentUserId }) => {
  const { activeRunDetails, activePayRun, isFetchingDetails, approvePayRun, isFinalizing } = usePayrollStore();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
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

  const handleOpenApproveModal = () => {
    if (!activeRunDetails?.meta?.id) return;
    setIsApproveModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!activeRunDetails?.meta?.id) return;
    const success = await approvePayRun(activeRunDetails.meta.id);
    if (success) {
      setIsApproveModalOpen(false);
    }
  };

  if (!activePayRun) {
    return (
      <div className="bg-base-100 rounded-xl border border-base-200 text-center flex flex-col items-center justify-center h-full min-h-[400px] text-base-content/40 antialiased-text">
        <FileText size={32} strokeWidth={1.5} className="mb-3" />
        <h3 className="text-[11px] font-black uppercase tracking-widest">No Period Selected</h3>
        <p className="text-[9px] font-bold uppercase tracking-widest mt-1">Select a payroll period from the list</p>
      </div>
    );
  }

  const isDraft = activeRunDetails?.meta?.status === 'Draft';

  return (
    <div className="flex flex-col h-full bg-base-100 rounded-xl border border-base-200 shadow-sm antialiased-text">
      
      {/* --- TOOLBAR --- */}
      <div className="p-3 border-b border-base-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        
        {/* Title & Status */}
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-base-content hidden sm:block">
            {canViewAll ? "Employee Breakdown" : "My Payslip"}
            <span className="text-[9px] font-bold text-base-content/50 ml-2">
              ({filteredRecords.length})
            </span>
          </h3>
          
          {activeRunDetails?.meta?.status && (
            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
              isDraft ? "border-warning/30 bg-warning/10 text-warning" : "border-success/30 bg-success/10 text-success"
            }`}>
              {activeRunDetails.meta.status}
            </div>
          )}
        </div>
        
        {/* Actions (Search & Approve) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canViewAll && (
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-base-content/40" />
              <input
                type="text"
                placeholder="Search..."
                className="input input-bordered h-7 min-h-0 bg-base-200/50 w-full pl-7 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:bg-base-100 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {canManage && isDraft && (
            <button 
              onClick={handleOpenApproveModal}
              disabled={isFinalizing}
              className="btn btn-sm h-7 min-h-0 btn-success text-white shadow-sm gap-1.5 px-3 flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest border-none"
            >
              {isFinalizing ? <Loader2 className="animate-spin size-3" /> : <CheckCircle size={12} />}
              Approve
            </button>
          )}
        </div>
      </div>

      {/* --- SCROLLABLE TABLE CONTAINER --- */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-base-100 relative">
        <table className="table table-sm w-full">
          <thead className="bg-base-200/50 text-base-content/40 font-black sticky top-0 z-10 border-b border-base-200">
            <tr>
              <th className="py-2.5 pl-4 text-[9px] uppercase tracking-[0.2em]">Employee</th>
              <th className="text-right text-[9px] uppercase tracking-[0.2em]">Basic</th>
              <th className="text-right text-[9px] uppercase tracking-[0.2em]">Overtime</th>
              <th className="text-right text-[9px] uppercase tracking-[0.2em] text-success/70">Allowances</th>
              <th className="text-right text-[9px] uppercase tracking-[0.2em] text-error/70">Deductions</th>
              <th className="text-right text-[9px] uppercase tracking-[0.2em] text-primary/70">Net Pay</th>
              <th className="text-center pr-4 text-[9px] uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {isFetchingDetails ? (
              <tr>
                <td colSpan="7" className="h-[300px] text-center">
                  <Loader2 className="animate-spin size-6 text-primary mx-auto opacity-50" />
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="7" className="h-[300px] text-center text-base-content/30">
                  <User size={24} className="mx-auto mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">No records found</span>
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-base-200/40 transition-colors group">
                  
                  {/* Employee Details */}
                  <td className="pl-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 relative overflow-hidden rounded-full border border-base-300 shrink-0">
                        <Image 
                          src={rec.profile_picture ? getImageUrl(rec.profile_picture) : "/images/default_profile.jpg"} 
                          alt={rec.fullname}
                          fill
                          sizes="28px"
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[11px] leading-none text-base-content truncate">{rec.fullname}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-1 truncate">{rec.position || "Staff"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Financials (Tabular Nums for alignment) */}
                  <td className="text-right text-[10px] font-bold tabular-nums text-base-content/70 whitespace-nowrap align-middle">
                    {formatMoney(rec.basic_salary)}
                  </td>
                  
                  <td className="text-right text-[10px] font-bold tabular-nums text-base-content/80 whitespace-nowrap align-middle">
                    {parseFloat(rec.overtime_pay) > 0 ? `+${formatMoney(rec.overtime_pay)}` : "-"}
                  </td>
                  
                  <td className="text-right text-[10px] font-black tabular-nums text-success whitespace-nowrap align-middle">
                    {parseFloat(rec.allowances) > 0 ? `+${formatMoney(rec.allowances)}` : "-"}
                  </td>
                  
                  <td className="text-right text-[10px] font-black tabular-nums text-error whitespace-nowrap align-middle">
                    {parseFloat(rec.deductions) > 0 ? `-${formatMoney(rec.deductions)}` : "-"}
                  </td>
                  
                  <td className="text-right whitespace-nowrap align-middle">
                    <span className="font-black text-[11px] tabular-nums tracking-tighter text-primary">
                      {formatMoney(rec.net_pay)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="text-center pr-4 whitespace-nowrap align-middle">
                    <button
                      onClick={() => handleViewPayslip(rec)}
                      className="btn btn-ghost btn-xs h-6 min-h-0 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Eye size={12} className="mr-1" /> View
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PayslipTemplate
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        data={selectedPayslip}
      />

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