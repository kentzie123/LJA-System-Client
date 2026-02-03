import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useDeductionStore } from "@/stores/useDeductionStore";
import CreateDeductionModal from "./CreateDeductionModal";
import DeleteDeductionModal from "./DeleteDeductionModal"; // <--- Import
import DeductionCard from "./DeductionCard"; 

const PayrollDeductionList = () => {
  const { 
    deductions, 
    fetchDeductions, 
    toggleStatus, 
    deleteDeduction, 
    isLoading 
  } = useDeductionStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New State for Deletion
  const [planToDelete, setPlanToDelete] = useState(null); // Stores the entire plan object
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDeductions();
  }, [fetchDeductions]);

  // Handle the actual Delete Action
  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    
    setIsDeleting(true);
    await deleteDeduction(planToDelete.id);
    setIsDeleting(false);
    setPlanToDelete(null); // Close modal
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* HERO CARD */}
        <div className="card bg-blue-600 text-white shadow-xl h-full min-h-[280px]">
          <div className="card-body justify-between p-8">
            <div>
              <div className="p-3 bg-white/20 w-fit rounded-xl mb-4 backdrop-blur-sm">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h2 className="card-title text-2xl font-bold mb-2">FINANCIAL STRATEGIES</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Manage statutory withholdings, recurring contributions, and staff loan amortizations in one place.
              </p>
            </div>
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn bg-white text-blue-700 hover:bg-blue-50 border-none w-full font-bold shadow-lg"
            >
              + ADD LOAN
            </button>
          </div>
        </div>

        {/* DEDUCTION CARDS */}
        {deductions.map((plan) => (
          <DeductionCard 
            key={plan.id} 
            plan={plan} 
            onToggle={() => toggleStatus(plan.id, plan.status)}
            // Instead of deleting immediately, we set the state to open the modal
            onDelete={() => setPlanToDelete(plan)} 
          />
        ))}

      </div>

      {/* CREATE MODAL */}
      <CreateDeductionModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {/* DELETE MODAL */}
      <DeleteDeductionModal 
        isOpen={!!planToDelete} 
        planName={planToDelete?.name}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PayrollDeductionList;