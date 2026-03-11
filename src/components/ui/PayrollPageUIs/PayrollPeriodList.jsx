"use client";

import { useState, useEffect, useMemo } from "react";
import { Landmark, Plus, Loader2, Filter } from "lucide-react";
import { usePayrollStore } from "@/stores/usePayrollStore";
import PayrollPeriodCard from "./PayrollPeriodCard";

// Modals
import CreatePayRunModal from "./CreatePayRunModal";
import DeletePayRunModal from "./DeletePayRunModal";

const PayrollPeriodList = ({ canManage = false }) => {
  const {
    getAllPayrollPeriod,
    getPayRunDetails,
    payrollPeriods,
    isFetchingPeriods,
    activePayRun,
    setActiveRun,
  } = usePayrollStore();

  const [isCreatePayrunModalOpen, setIsCreatePayrunModalOpen] = useState(false);
  const [isDeletePayrunModalOpen, setIsDeletePayrunModalOpen] = useState(false);
  
  // --- 1. YEAR FILTER STATE ---
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getAllPayrollPeriod();
  }, [getAllPayrollPeriod]);

  // --- 2. CALCULATE UNIQUE YEARS ---
  const uniqueYears = useMemo(() => {
    if (!payrollPeriods.length) return [new Date().getFullYear()];
    const years = payrollPeriods.map(p => new Date(p.pay_date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [payrollPeriods]);

  // --- 3. FILTER DATA ---
  const filteredPeriods = useMemo(() => {
    return payrollPeriods.filter(
      (p) => new Date(p.pay_date).getFullYear() === parseInt(selectedYear)
    );
  }, [payrollPeriods, selectedYear]);

  // --- HANDLERS ---
  const openCreatePayrunModal = () => setIsCreatePayrunModalOpen(true);
  const closeCreatePayrunModal = () => setIsCreatePayrunModalOpen(false);
  const openDeletePayrunModal = () => setIsDeletePayrunModalOpen(true);
  const closeDeletePayrunModal = () => setIsDeletePayrunModalOpen(false);

  return (
    // CHANGED: Removed fixed heights, now uses h-full to fit the parent Grid/Flex perfectly
    <div className="bg-base-100 rounded-xl border border-base-200 flex flex-col h-full min-h-[400px] shadow-sm overflow-hidden antialiased-text">
      
      {/* --- HEADER --- */}
      <div className="p-3 border-b border-base-200 bg-base-200/30 flex justify-between items-center shrink-0">
        <div className="text-[10px] font-black uppercase tracking-widest text-base-content/60 ml-1">
          Payroll Cycles
        </div>

        {/* --- 4. YEAR SELECTOR --- */}
        <div className="relative group">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40 pointer-events-none group-hover:text-primary transition-colors" />
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="select select-sm h-7 min-h-0 pl-7 pr-6 text-[10px] font-bold bg-base-200/50 hover:bg-base-200 border-transparent focus:border-primary focus:outline-none rounded-md transition-all cursor-pointer"
          >
            {uniqueYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- SCROLLABLE LIST --- */}
      {/* Added a subtle inner shadow to distinguish the scroll area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar bg-base-100/30 shadow-inner">
        
        {/* Loading State */}
        {isFetchingPeriods && (
          <div className="flex flex-col items-center justify-center h-full text-base-content/40 gap-2">
            <Loader2 className="animate-spin size-5 text-primary/50" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Syncing Cycles...</span>
          </div>
        )}

        {/* Empty State */}
        {!isFetchingPeriods && filteredPeriods.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <div className="p-3 bg-base-200 rounded-full">
              <Landmark size={24} strokeWidth={1.5} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest">No cycles for {selectedYear}</div>
          </div>
        )}

        {/* Data List */}
        {!isFetchingPeriods &&
          filteredPeriods.map((run) => (
            <PayrollPeriodCard
              key={run.id}
              run={run}
              isActive={run.id === activePayRun?.id}
              onClick={() => {
                setActiveRun(run);
                getPayRunDetails(run.id);
              }}
              onDelete={canManage ? openDeletePayrunModal : undefined}
            />
          ))}
      </div>

      {/* --- FOOTER (CREATE BUTTON) --- */}
      {canManage && (
        <div className="p-3 bg-base-100 border-t border-base-200 shrink-0">
          <button
            onClick={openCreatePayrunModal}
            className="btn btn-sm h-8 min-h-0 btn-outline border-dashed border-base-content/20 hover:border-primary hover:bg-primary/10 hover:text-primary w-full gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-all"
          >
            <Plus size={14} />
            <span>Create New Payroll</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {canManage && (
        <>
          <CreatePayRunModal
            isOpen={isCreatePayrunModalOpen}
            onClose={closeCreatePayrunModal}
          />
          <DeletePayRunModal
            isOpen={isDeletePayrunModalOpen}
            onClose={closeDeletePayrunModal}
          />
        </>
      )}
    </div>
  );
};

export default PayrollPeriodList;