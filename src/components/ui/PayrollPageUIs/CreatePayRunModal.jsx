"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Loader2, AlertCircle } from "lucide-react";
import { usePayrollStore } from "@/stores/usePayrollStore";
import { toast } from "react-hot-toast";

const CreatePayRunModal = ({ isOpen, onClose }) => {
  const { createPayRun, isCreating } = usePayrollStore();

  // Initialize with the current month/year in YYYY-MM format
  const getInitialMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    monthYear: getInitialMonth(),
    half: 1,
    pay_date: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        monthYear: getInitialMonth(),
        half: 1,
        pay_date: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.monthYear || !formData.pay_date) {
      toast.error("Please fill in all fields.");
      return;
    }

    // 1. Parse Year and Month
    const [year, month] = formData.monthYear.split("-").map(Number);
    
    // 2. Logic to determine Start and End dates
    let start_date, end_date;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const run_name = `${monthNames[month - 1]} ${year} - ${formData.half === 1 ? '1st Half' : '2nd Half'}`;

    if (formData.half === 1) {
      // 1st to 15th
      start_date = `${year}-${month.toString().padStart(2, '0')}-01`;
      end_date = `${year}-${month.toString().padStart(2, '0')}-15`;
    } else {
      // 16th to Last Day of Month
      start_date = `${year}-${month.toString().padStart(2, '0')}-16`;
      // Use JavaScript Date to find the last day of the month
      const lastDay = new Date(year, month, 0).getDate();
      end_date = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
    }

    // 3. Send the exact fields the Backend expects
    const success = await createPayRun({
      run_name,
      start_date,
      end_date,
      pay_date: formData.pay_date,
    });

    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-sm rounded-xl shadow-2xl border border-white/10 flex flex-col scale-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-base-200/30 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Run Payroll</h3>
              <p className="text-xs opacity-60">New Period Calculation</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={18} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-6 space-y-5">
          {/* Info Box */}
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg flex gap-3 items-start">
            <AlertCircle className="size-5 text-primary shrink-0" />
            <p className="text-[11px] leading-relaxed opacity-80">
              Selecting a month and period will automatically calculate attendance from the 
              <b> {formData.half === 1 ? '1st to the 15th' : '16th to the end of the month'}</b>.
            </p>
          </div>

          <div className="space-y-4">
            {/* 1. Month and Year combined input */}
            <div className="form-control">
              <label className="label text-xs font-bold uppercase opacity-60">Target Month & Year</label>
              <input 
                type="month"
                value={formData.monthYear}
                onChange={(e) => setFormData(p => ({ ...p, monthYear: e.target.value }))}
                className="input input-bordered input-md focus:outline-primary w-full"
              />
            </div>

            {/* 2. Period Selection (Half) */}
            <div className="form-control">
              <label className="label text-xs font-bold uppercase opacity-60">Pay Period</label>
              <div className="flex p-1 bg-base-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, half: 1 }))}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.half === 1 ? 'bg-primary text-white shadow-md' : 'hover:bg-base-300 opacity-60'}`}
                >
                  1st Half (1-15)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, half: 2 }))}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.half === 2 ? 'bg-primary text-white shadow-md' : 'hover:bg-base-300 opacity-60'}`}
                >
                  2nd Half (16-End)
                </button>
              </div>
            </div>

            {/* 3. Pay Date Input */}
            <div className="form-control">
              <label className="label text-xs font-bold uppercase opacity-60">Release/Pay Date</label>
              <input 
                type="date"
                value={formData.pay_date}
                onChange={(e) => setFormData(p => ({ ...p, pay_date: e.target.value }))}
                className="input input-bordered input-md focus:outline-primary w-full"
              />
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-5 border-t border-white/10 flex gap-3 justify-end bg-base-200/20 rounded-b-xl">
          <button onClick={onClose} disabled={isCreating} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="btn btn-primary px-8 shadow-lg shadow-primary/30"
          >
            {isCreating ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Generate Draft"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePayRunModal;