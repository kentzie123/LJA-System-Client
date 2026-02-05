import { useState, useEffect, useMemo } from "react";
import { Landmark, Plus, Loader2, Filter } from "lucide-react"; // <--- Added Filter Icon
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
  // Default to current year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getAllPayrollPeriod();
  }, [getAllPayrollPeriod]);

  // --- 2. CALCULATE UNIQUE YEARS ---
  const uniqueYears = useMemo(() => {
    if (!payrollPeriods.length) return [new Date().getFullYear()];
    
    // Extract years from pay_date
    const years = payrollPeriods.map(p => new Date(p.pay_date).getFullYear());
    // Remove duplicates and sort descending (newest first)
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
    <div className="bg-base-100 rounded-xl border border-white/10 flex flex-col h-[600px] shadow-sm overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-base-200/50">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
          Payroll Periods
        </div>

        {/* --- 4. YEAR SELECTOR --- */}
        <div className="relative">
          <Filter className="z-1 absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50 pointer-events-none" />
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="select select-xs pl-7 bg-base-100 border-base-300 focus:border-primary focus:outline-none rounded-lg font-medium"
          >
            {uniqueYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- SCROLLABLE LIST --- */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-base-100">
        {/* Loading State */}
        {isFetchingPeriods && (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <Loader2 className="animate-spin mb-2" />
            <span className="text-xs">Loading...</span>
          </div>
        )}

        {/* Empty State */}
        {!isFetchingPeriods && filteredPeriods.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
            <Landmark size={32} strokeWidth={1.5} />
            <div className="text-xs font-medium">No cycles found for {selectedYear}.</div>
          </div>
        )}

        {/* Data List (Using filteredPeriods) */}
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
        <div className="p-3 bg-base-100">
          <button
            onClick={openCreatePayrunModal}
            className="btn btn-outline border-dashed border-white/20 hover:border-primary hover:bg-primary/5 hover:text-primary w-full gap-2 normal-case font-bold text-xs h-10 min-h-0"
          >
            <Plus size={14} />
            <span>CREATE NEW PAYROLL</span>
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