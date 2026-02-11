import React, { useEffect, useState } from "react";
import { PlusCircle, Info, Coins } from "lucide-react";
import { useAllowanceStore } from "@/stores/useAllowanceStore";
import { useAuthStore } from "@/stores/useAuthStore";
import AllowanceCard from "./AllowanceCard";
import CreateAllowanceModal from "./CreateAllowanceModal";
import DeleteAllowanceModal from "./DeleteAllowanceModal"; // Ensure this is imported

const AllowanceList = ({ canManage }) => {
  const { 
    allowances, 
    fetchAllowances, 
    deleteAllowance, 
    isLoading 
  } = useAllowanceStore();

  const { authUser } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- DELETE STATE MANAGEMENT ---
  const [allowanceToDelete, setAllowanceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchAllowances();
  }, [fetchAllowances]);

  // Handle the actual API call for deletion
  const confirmDelete = async () => {
    if (!allowanceToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAllowance(allowanceToDelete.id);
      setAllowanceToDelete(null); // Close modal on success
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <span className="loading loading-spinner loading-md text-emerald-600"></span>
        <p className="text-sm opacity-50">Loading Allowances...</p>
      </div>
    );
  }

  // --- FILTERING LOGIC ---
  const filteredAllowances = canManage
    ? allowances // Managers see ALL
    : allowances.filter((plan) => {
        // Employees see:
        // 1. GLOBAL plans
        // 2. SPECIFIC plans where they are a subscriber
        const isGlobal = plan.is_global;
        const isSubscriber = (plan.subscribers || []).some(
          (sub) => sub.user_id === authUser?.id
        );
        return isGlobal || isSubscriber;
      });

  const hasData = filteredAllowances.length > 0;

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Coins className="text-emerald-600" /> Allowance & Benefits
          </h2>
          <p className="text-sm opacity-60">
            Recurring earnings, subsidies, and benefits added to payslips.
          </p>
        </div>

        {/* Only show Add Button if user has permission */}
        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 border-none text-white gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle size={18} /> Add Allowance
          </button>
        )}
      </div>

      {/* 2. CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Empty State */}
        {!hasData && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-base-300 rounded-xl bg-base-50/50">
            <div className="p-4 bg-base-200 rounded-full mb-3">
              <Info size={32} className="opacity-30" />
            </div>
            <p className="font-bold opacity-60 text-lg">
              No allowance plans found.
            </p>
            <p className="text-sm opacity-40 max-w-sm mt-1 mb-6">
              {canManage
                ? "Create standard allowances like 'Rice Subsidy', 'Transportation', or 'Internet' to get started."
                : "You do not have any active allowances or benefits assigned to you yet."
              }
            </p>
            {canManage && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-ghost btn-sm text-emerald-700"
              >
                + Create First Allowance
              </button>
            )}
          </div>
        )}

        {/* Card Loop */}
        {filteredAllowances.map((plan) => (
          <AllowanceCard
            key={plan.id}
            plan={plan}
            // Pass Delete Handler (opens modal instead of window.confirm)
            onDelete={canManage ? () => setAllowanceToDelete(plan) : undefined}
            // Pass Manage Handler
            onManage={
              canManage && !plan.is_global
                ? () => alert("Feature coming: Manage specific subscribers")
                : undefined
            }
          />
        ))}
      </div>

      {/* 3. MODALS */}
      {canManage && (
        <>
          <CreateAllowanceModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />

          {/* Delete Confirmation Modal */}
          <DeleteAllowanceModal
            isOpen={!!allowanceToDelete}
            onClose={() => setAllowanceToDelete(null)}
            onConfirm={confirmDelete}
            allowanceName={allowanceToDelete?.name}
            isDeleting={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default AllowanceList;