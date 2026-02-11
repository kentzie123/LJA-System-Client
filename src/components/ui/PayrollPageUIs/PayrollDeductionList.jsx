import React, { useEffect, useState } from "react";
import { PlusCircle, Info, Wallet } from "lucide-react";
import { useDeductionStore } from "@/stores/useDeductionStore";
import { useAuthStore } from "@/stores/useAuthStore"; // 1. Import Auth Store
import DeductionCard from "./DeductionCard";
import CreateDeductionModal from "./CreateDeductionModal";
import DeleteDeductionModal from "./DeleteDeductionModal";

const PayrollDeductionList = ({ canManage = false }) => {
  const { 
    deductions, 
    fetchDeductions, 
    toggleStatus, 
    deleteDeduction, 
    isLoading 
  } = useDeductionStore();

  const { authUser } = useAuthStore(); // 2. Get Current User
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDeductions();
  }, [fetchDeductions]);

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    await deleteDeduction(planToDelete.id);
    setIsDeleting(false);
    setPlanToDelete(null); 
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <span className="loading loading-spinner loading-md text-primary"></span>
        <p className="text-sm opacity-50">Loading Plans...</p>
      </div>
    );
  }

  // --- 3. FILTERING LOGIC ---
  const filteredDeductions = canManage
    ? deductions // Managers see ALL
    : deductions.filter(plan => {
        // Employees see:
        // 1. GLOBAL plans
        // 2. SPECIFIC plans where they are in the subscriber list
        const isGlobal = plan.is_global;
        const isSubscriber = (plan.subscribers || []).some(sub => sub.user_id === authUser?.id);
        return isGlobal || isSubscriber;
      });

  const hasData = filteredDeductions.length > 0;

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold flex items-center gap-2">
             <Wallet className="text-primary" /> Deductions & Contributions
           </h2>
           <p className="text-sm opacity-60">
             Statutory contributions, government mandates, and standard withholdings.
           </p>
        </div>
        
        {/* Only show Add Button if user has permission */}
        {canManage && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle size={18} /> Add Deduction
          </button>
        )}
      </div>

      {/* 2. CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Empty State */}
        {!hasData && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-base-300 rounded-xl bg-base-50/50">
             <div className="p-4 bg-base-200 rounded-full mb-3">
               <Info size={32} className="opacity-30" />
             </div>
             <p className="font-bold opacity-60 text-lg">No active plans found.</p>
             <p className="text-sm opacity-40 max-w-sm mt-1">
               {canManage 
                 ? "Create standard deductions like 'SSS', 'PhilHealth', or 'Cash Advance' to get started." 
                 : "You do not have any active deductions or loans assigned to you yet." // Employee Message
               }
             </p>
             {canManage && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn btn-ghost btn-sm mt-4 text-primary"
                >
                  + Create First Deduction
                </button>
             )}
          </div>
        )}

        {/* Card Loop */}
        {filteredDeductions.map((plan) => (
          <DeductionCard 
            key={plan.id} 
            plan={plan} 
            // Only pass handlers if the user has permission. 
            onToggle={canManage ? () => toggleStatus(plan.id, plan.status) : undefined}
            onDelete={canManage ? () => setPlanToDelete(plan) : undefined}
          />
        ))}

      </div>

      {/* 3. MODALS */}
      {canManage && (
        <>
          <CreateDeductionModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
          />

          <DeleteDeductionModal 
            isOpen={!!planToDelete} 
            planName={planToDelete?.name}
            onClose={() => setPlanToDelete(null)}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
          />
        </>
      )}

    </div>
  );
};

export default PayrollDeductionList;