import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { formatCurrency, formatDate } from "@/utils/formatUtils";
import { X, Printer, MapPin, Mail } from "lucide-react";

const PayslipTemplate = ({ isOpen, onClose, data }) => {
  // 1. CREATE REF
  const componentRef = useRef(null);

  // 2. FIXED PRINT HANDLER (Updated for newer react-to-print versions)
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Pass the ref object directly
    documentTitle: `Payslip-${data?.employee?.name || 'Employee'}`,
  });

  if (!isOpen || !data) return null;

  // Safe Destructuring
  const payrollRun = data.payrollRun || {};
  const employee = data.employee || {};
  const earnings = data.earnings || [];
  const deductions = data.deductions || [];
  const loans = data.loans || [];
  const totals = data.totals || { gross: 0, total_deductions: 0, net_pay: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      
      {/* WINDOW CONTAINER */}
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER ACTIONS (Screen Only) */}
        <div className="bg-neutral-900 text-white p-3 flex justify-between items-center shadow-md print:hidden">
          <h2 className="font-bold text-sm tracking-wide uppercase">Payslip Preview</h2>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint} 
              className="btn btn-xs btn-primary font-bold gap-2 rounded-sm"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button className="btn btn-xs btn-square btn-ghost text-white" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE PREVIEW */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center print:p-0 print:bg-white">
          
          {/* --- THE PAYSLIP PAPER --- */}
          <div 
            ref={componentRef} 
            className="bg-white text-black w-full max-w-[210mm] p-10 shadow-lg print:shadow-none print:w-full print:max-w-none print:p-8"
            style={{ fontFamily: '"Courier New", Courier, monospace' }} // Monospace for financial look
          >
            
            {/* 1. HEADER */}
            <div className="border-b-4 border-black pb-4 mb-6 flex justify-between items-start">
              <div className="flex gap-4">
                {/* Logo Placeholder */}
                <div className="h-16 w-16 bg-gray-200 flex items-center justify-center border border-gray-300">
                   {/* Replace src with your actual logo path */}
                   <img src="/images/lja-logo.webp" alt="LJA" className="h-full w-full object-contain mix-blend-multiply" />
                </div>
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-tighter leading-none">LJA Power Limited Co.</h1>
                  <div className="text-[10px] mt-2 space-y-0.5 text-gray-600 font-sans">
                    <p className="flex items-center gap-1"><MapPin size={10}/> Zone 2, Opol, Misamis Oriental</p>
                    <p className="flex items-center gap-1"><Mail size={10}/> admin@ljapower.com</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-900">PAYSLIP</h2>
                <p className="text-xs font-bold mt-1">
                   {formatDate(payrollRun.startDate)} — {formatDate(payrollRun.endDate)}
                </p>
              </div>
            </div>

            {/* 2. EMPLOYEE DETAILS (Compact Grid) */}
            <div className="grid grid-cols-2 gap-8 text-xs font-sans mb-8 border-b border-dashed border-gray-400 pb-6">
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-gray-200 pb-0.5">
                  <span className="text-gray-500 uppercase font-bold text-[10px]">Employee</span>
                  <span className="font-bold">{employee.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-0.5">
                  <span className="text-gray-500 uppercase font-bold text-[10px]">Position</span>
                  <span>{employee.position}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-0.5">
                  <span className="text-gray-500 uppercase font-bold text-[10px]">ID No.</span>
                  <span>{employee.id}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-gray-200 pb-0.5">
                  <span className="text-gray-500 uppercase font-bold text-[10px]">Pay Date</span>
                  <span>{formatDate(payrollRun.paymentDate)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-0.5">
                  <span className="text-gray-500 uppercase font-bold text-[10px]">TIN</span>
                  <span>{employee.tin || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-0.5">
                  <span className="text-gray-500 uppercase font-bold text-[10px]">SSS/PHIC</span>
                  <span>{employee.sss || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* 3. DETAILS TABLE */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              
              {/* EARNINGS */}
              <div>
                <h3 className="text-xs font-bold uppercase border-b-2 border-black pb-1 mb-2">Earnings</h3>
                <table className="w-full text-xs font-sans">
                  <tbody>
                    {earnings.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1 text-gray-700">{item.label}</td>
                        <td className="py-1 text-right text-[10px] text-gray-400">{item.units}</td>
                        <td className="py-1 text-right font-medium">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="pt-2 border-t border-gray-300">
                        <div className="flex justify-between font-bold">
                          <span>TOTAL EARNINGS</span>
                          <span>{formatCurrency(totals.gross)}</span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* DEDUCTIONS */}
              <div>
                <h3 className="text-xs font-bold uppercase border-b-2 border-black pb-1 mb-2">Deductions</h3>
                <table className="w-full text-xs font-sans">
                  <tbody>
                    {deductions.concat(loans).length === 0 ? (
                      <tr><td className="py-2 text-gray-400 italic text-[10px]">No deductions</td></tr>
                    ) : (
                      deductions.concat(loans).map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1 text-gray-700">
                            {item.label}
                            {item.balance && <span className="text-[9px] text-gray-400 block">Bal: {formatCurrency(item.balance)}</span>}
                          </td>
                          <td className="py-1 text-right text-[10px] text-gray-400">{item.units}</td>
                          <td className="py-1 text-right font-medium">({formatCurrency(item.amount)})</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="pt-2 border-t border-gray-300">
                        <div className="flex justify-between font-bold">
                          <span>TOTAL DEDUCTIONS</span>
                          <span>({formatCurrency(totals.total_deductions)})</span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 4. NET PAY HERO */}
            <div className="border-t-2 border-b-2 border-black py-4 mb-12 flex justify-between items-center">
              <div>
                <span className="block text-xs font-bold uppercase tracking-widest text-gray-500">Net Salary Payable</span>
                <span className="text-[10px] italic">Received correct amount</span>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {formatCurrency(totals.net_pay)}
              </div>
            </div>

            {/* 5. SIGNATURES */}
            <div className="grid grid-cols-2 gap-12 text-xs font-sans break-inside-avoid">
              <div className="pt-8 border-t border-black">
                <p className="font-bold uppercase text-gray-900">Authorized Signature</p>
                <p className="text-[10px] text-gray-500 mt-1">HR / Finance Department</p>
              </div>
              <div className="pt-8 border-t border-black">
                <p className="font-bold uppercase text-gray-900">Employee Signature</p>
                <p className="text-[10px] text-gray-500 mt-1">Date: _________________</p>
              </div>
            </div>

            <div className="mt-8 text-center text-[9px] text-gray-300 uppercase">
              System Generated • {new Date().toLocaleDateString()}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipTemplate;