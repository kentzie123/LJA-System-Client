import { useState, useEffect } from "react";
import { Landmark, Plus, Loader2 } from "lucide-react";
import { usePayrollStore } from "@/stores/usePayrollStore";
import PayrollPeriodCard from "./PayrollPeriodCard"; // <--- Import the card

// Modals
import CreatePayRunModal from "./CreatePayRunModal";
import DeletePayRunModal from "./DeletePayRunModal";

const PayrollPeriodList = () => {
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

  useEffect(() => {
    getAllPayrollPeriod();
  }, [getAllPayrollPeriod]);

  const openCreatePayrunModal = () => {
    setIsCreatePayrunModalOpen(true);
  };

  const closeCreatePayrunModal = () => {
    setIsCreatePayrunModalOpen(false);
  };

  const openDeletePayrunModal = () => {
    setIsDeletePayrunModalOpen(true);
  };

  const closeDeletePayrunModal = () => {
    setIsDeletePayrunModalOpen(false);
  };

  return (
    <div className="bg-base-100 rounded-xl border border-white/10 flex flex-col h-[600px] shadow-sm overflow-hidden">
      {/* --- HEADER --- */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-base-200/50">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
          Payroll Periods
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
        {!isFetchingPeriods && payrollPeriods.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
            <Landmark size={32} strokeWidth={1.5} />
            <div className="text-xs font-medium">No cycles found.</div>
          </div>
        )}

        {/* Data List */}
        {!isFetchingPeriods &&
          payrollPeriods.map((run) => (
            <PayrollPeriodCard
              key={run.id}
              run={run}
              isActive={run.id === activePayRun?.id}
              onClick={() => {
                setActiveRun(run);
                getPayRunDetails(run.id);
              }}
              onDelete={openDeletePayrunModal}
            />
          ))}
      </div>

      {/* --- FOOTER --- */}
      <div className="p-3 bg-base-100">
        <button
          onClick={openCreatePayrunModal}
          className="btn btn-outline border-dashed border-white/20 hover:border-primary hover:bg-primary/5 hover:text-primary w-full gap-2 normal-case font-bold text-xs h-10 min-h-0"
        >
          <Plus size={14} />
          <span>CREATE NEW PAYROLL</span>
        </button>
      </div>

      {/* Modals */}
      <CreatePayRunModal
        isOpen={isCreatePayrunModalOpen}
        onClose={closeCreatePayrunModal}
      />

      <DeletePayRunModal
        isOpen={isDeletePayrunModalOpen}
        onClose={closeDeletePayrunModal}
      />
    </div>
  );
};

export default PayrollPeriodList;
