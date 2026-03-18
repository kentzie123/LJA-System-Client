import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { formatCurrency, formatDate } from "@/utils/formatUtils";
import { X, Printer, MapPin, Mail, ShieldCheck } from "lucide-react";

const PayslipTemplate = ({ isOpen, onClose, data }) => {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Payslip_${data?.fullname?.replace(/\s+/g, '_') || 'Employee'}_${data?.end_date || ''}`,
  });

  if (!isOpen || !data) return null;

  // --- 1. DATA EXTRACTION ---
  const details = data.details || {};
  const payType = details.pay_type || "Daily";
  const attendance = details.attendance_summary || {};

  // --- 2. COMPILE EARNINGS ---
  // Combine base earnings, overtime, and allowances into one array for the UI table
  const allEarnings = [
    ...(details.earnings_breakdown || []),
    ...(details.overtime_breakdown || []).map(ot => ({
      label: `${ot.type} OT`,
      units: `${ot.hours} hrs × ${ot.multiplier}x`,
      amount: ot.amount
    })),
    ...(details.allowance_breakdown || []).map(al => ({
      label: al.name,
      units: '', // Allowances typically don't have unit math
      amount: al.amount
    }))
  ];

  // --- 3. COMPILE DEDUCTIONS ---
  // The backend now brilliantly supplies Lates, Absents, and Plans all here!
  const allDeductions = (details.deduction_breakdown || []).map(d => ({
    label: d.name || d.label, // Handle slight naming differences
    units: d.units || '',
    amount: d.amount
  }));

  // --- 4. COMPILE TOTALS ---
  const totals = {
    gross: parseFloat(data.basic_salary || 0) + parseFloat(data.overtime_pay || 0) + parseFloat(data.allowances || 0),
    total_deductions: parseFloat(data.deductions || 0),
    net_pay: parseFloat(data.net_pay || 0)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm p-0 md:p-6 overflow-y-auto print:p-0 print:bg-transparent print:backdrop-blur-none">
      
      <div className="bg-base-200 w-full h-full md:h-auto md:max-w-4xl md:rounded-xl shadow-2xl flex flex-col md:max-h-[90vh] overflow-hidden print:shadow-none print:rounded-none">
        
        {/* HEADER ACTIONS */}
        <div className="bg-base-300 border-b border-base-300 p-3 px-5 flex justify-between items-center print:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-success" />
            <h2 className="font-bold text-sm tracking-wider uppercase text-base-content">Official Payslip Document</h2>
          </div>
          
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn btn-sm btn-primary shadow-sm font-bold gap-2">
              <Printer size={16} /> 
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 print:p-0 print:overflow-visible print:block">
          
          <div 
            ref={componentRef} 
            className="bg-white text-black w-full max-w-[210mm] min-w-[700px] md:min-w-0 mx-auto p-8 md:p-12 shadow-md print:shadow-none print:w-full print:max-w-none print:p-4 text-sm relative overflow-hidden"
          >
            
            {/* WATERMARK SECTION */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none print:opacity-[0.08]">
              <img src="/images/lja-logo.webp" alt="" className="w-2/3 mix-blend-multiply" />
            </div>

            {/* 1. DOCUMENT HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b-2 border-black pb-6 mb-6 relative z-10">
              <div className="flex gap-4 items-center md:items-start">
                <div className="h-16 w-16 bg-gray-50 flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-lg p-2">
                   <img src="/images/lja-logo.webp" alt="LJA Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight text-gray-900 leading-none mb-2">LJA Power Limited Co.</h1>
                  <div className="text-xs space-y-1 text-gray-600 font-medium">
                    <p className="flex items-center gap-1.5"><MapPin size={12}/> Zone 4, Opol, Misamis Oriental</p>
                    <p className="flex items-center gap-1.5"><Mail size={12}/>  lja.ljapowerlimitedco@gmail.comadmin</p>
                  </div>
                </div>
              </div>
              <div className="text-left md:text-right w-full md:w-auto mt-2 md:mt-0 bg-gray-50 p-4 rounded-lg border border-gray-200 print:border-none print:bg-transparent print:p-0 print:text-right">
                <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-1">PAYSLIP</h2>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                   {formatDate(data.start_date)} — {formatDate(data.end_date)}
                </p>
              </div>
            </div>

            {/* 2. EMPLOYEE DETAILS GRID */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-0 text-xs mb-6 border border-gray-300 rounded-lg overflow-hidden relative z-10 print:border-black">
              <div className="flex flex-col border-r border-gray-300 print:border-black">
                <div className="flex justify-between p-2 border-b border-gray-200 bg-gray-50 print:bg-transparent">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Employee Name</span>
                  <span className="font-bold text-gray-900">{data.fullname}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-gray-200 print:border-black">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Employee ID</span>
                  <span className="font-medium text-gray-900">{data.employee_id || "N/A"}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-gray-200 print:border-black">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Position</span>
                  <span className="font-medium text-gray-900">{data.position || "N/A"}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Pay Type</span>
                  <span className="font-medium text-gray-900">{payType} Rate</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between p-2 border-b border-gray-200 bg-gray-50 print:bg-transparent">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Pay Date</span>
                  <span className="font-bold text-gray-900">{formatDate(data.pay_date)}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-gray-200 print:border-black">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">TIN</span>
                  <span className="font-medium text-gray-900 tabular-nums">{data.tin_number || "N/A"}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">SSS / PHIC</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {data.sss_number ? `${data.sss_number} / ${data.philhealth_number || 'N/A'}` : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* --- 2.5 ATTENDANCE SUMMARY (Dynamic based on Pay Type) --- */}
            {Object.keys(attendance).length > 0 && (
              <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3 mb-8 relative z-10 print:border-black print:bg-transparent text-xs">
                
                <div className="flex gap-6 w-full">
                  {payType !== "Daily" && (
                    <div>
                      <span className="text-gray-500 uppercase font-bold text-[9px] tracking-wider block mb-0.5">Expected Days</span>
                      <span className="font-bold text-gray-900">{attendance.expected_working_days} Days</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-500 uppercase font-bold text-[9px] tracking-wider block mb-0.5">Days Present</span>
                    <span className="font-bold text-gray-900">{attendance.days_present} Days</span>
                  </div>

                  {payType === "Daily" && (
                    <div>
                      <span className="text-gray-500 uppercase font-bold text-[9px] tracking-wider block mb-0.5">Worked Hours</span>
                      <span className="font-bold text-gray-900">{attendance.total_worked_hours} Hrs</span>
                    </div>
                  )}

                  {attendance.paid_leave_days > 0 && (
                    <div>
                      <span className="text-gray-500 uppercase font-bold text-[9px] tracking-wider block mb-0.5">Paid Leave</span>
                      <span className="font-bold text-gray-900">{attendance.paid_leave_days} Days</span>
                    </div>
                  )}

                  <div className="ml-auto text-right">
                     <span className="text-gray-500 uppercase font-bold text-[9px] tracking-wider block mb-0.5">Daily Equiv. Rate</span>
                     <span className="font-mono text-gray-900">₱{attendance.daily_rate_equiv?.toFixed(2)}/day</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. FINANCIAL TABLES */}
            <div className="grid grid-cols-2 gap-8 mb-8 relative z-10 break-inside-avoid">
              <div>
                <h3 className="text-sm font-black uppercase text-gray-900 border-b-2 border-gray-800 pb-2 mb-3 tracking-wider">Earnings</h3>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                    {allEarnings.map((item, idx) => (
                      <tr key={`earn-${idx}`}>
                        <td className="py-2 pr-2 text-gray-800 font-medium">{item.label}</td>
                        {/* THE CALCULATION UNITS */}
                        <td className="py-2 pr-2 text-right font-mono text-[9px] text-gray-500 tracking-tighter whitespace-nowrap">
                          {item.units}
                        </td>
                        <td className="py-2 pl-2 text-right font-semibold tabular-nums text-gray-900">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase text-gray-900 border-b-2 border-gray-800 pb-2 mb-3 tracking-wider">Deductions</h3>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                    {allDeductions.length === 0 ? (
                      <tr><td className="py-2 text-gray-400 italic text-xs">No deductions for this period.</td></tr>
                    ) : (
                      allDeductions.map((item, idx) => (
                        <tr key={`deduct-${idx}`}>
                          <td className="py-2 text-gray-800 font-medium">
                            {item.label}
                            {item.balance && <span className="text-[10px] text-gray-500 block mt-0.5">Bal: {formatCurrency(item.balance)}</span>}
                          </td>
                          {/* THE DEDUCTION CALCULATION UNITS (Absents/Lates) */}
                          <td className="py-2 pr-2 text-right font-mono text-[9px] text-gray-500 tracking-tighter whitespace-nowrap">
                            {item.units}
                          </td>
                          <td className="py-2 text-right font-semibold tabular-nums text-red-600 print:text-black">({formatCurrency(item.amount)})</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. TOTALS SUMMARY & NET PAY */}
            <div className="flex flex-col border-t-2 border-black pt-4 mb-12 relative z-10 break-inside-avoid">
              <div className="flex justify-end w-full mb-4">
                <div className="w-1/2 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-bold uppercase tracking-wider text-[10px]">Gross Earnings</span>
                    <span className="font-semibold tabular-nums">{formatCurrency(totals.gross)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-bold uppercase tracking-wider text-[10px]">Total Deductions</span>
                    <span className="font-semibold tabular-nums text-red-600">({formatCurrency(totals.total_deductions)})</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 text-white rounded-lg p-6 flex flex-row justify-between items-center print:bg-transparent print:border-2 print:border-black print:text-black print:rounded-none">
                <div>
                  <span className="block text-sm font-black uppercase tracking-widest print:text-gray-900">Net Salary Payable</span>
                  <span className="text-xs opacity-70 italic mt-1 print:text-gray-600">Amount transferred to employee</span>
                </div>
                <div className="text-3xl md:text-4xl font-black tabular-nums tracking-tight">
                  {formatCurrency(totals.net_pay)}
                </div>
              </div>
            </div>

            {/* 5. SIGNATURES */}
            <div className="grid grid-cols-2 gap-12 text-xs break-inside-avoid relative z-10 mt-16">
              <div className="border-t border-black pt-2 text-left">
                <p className="font-black uppercase text-gray-900 tracking-wider">Authorized Signature</p>
                <p className="text-[10px] text-gray-500 mt-1">HR / Finance Department</p>
              </div>
              <div className="border-t border-black pt-2 text-left">
                <p className="font-black uppercase text-gray-900 tracking-wider">Employee Signature</p>
                <p className="text-[10px] text-gray-500 mt-1">I acknowledge receipt of the above amount.</p>
              </div>
            </div>

            <div className="mt-12 text-center text-[10px] font-medium text-gray-400 uppercase tracking-widest relative z-10">
              System Generated • LJA Power Payroll • {new Date().toLocaleDateString()}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipTemplate;