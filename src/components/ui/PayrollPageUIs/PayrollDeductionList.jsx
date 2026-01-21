import React, { useEffect, useState } from "react";
import { Plus, Trash2, Shield, History } from "lucide-react";

import AddDeductionModal from "./AddDeductionModal";

// Store
import { useDeductionStore } from "@/stores/useDeductionStore";
import { useUserStore } from "@/stores/useUserStore";

const PayrollDeductionList = () => {
  const { deductions, fetchDeductions, deleteDeduction } = useDeductionStore();
  const { users, fetchAllUsers } = useUserStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDeductions();
    fetchAllUsers();
  }, [fetchAllUsers, fetchDeductions]);

  // Helper for currency
  const formatMoney = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* --- 1. ACTION CARD (Blue) --- */}
        <div className="bg-primary rounded-[20px] p-6 text-primary-content flex flex-col justify-between min-h-[220px] shadow-xl shadow-primary/20 relative overflow-hidden group">
          {/* Decorative bg icon */}
          <Shield className="absolute -right-4 -top-4 text-white/10 size-32 rotate-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10">
            <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <Shield size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold leading-tight mb-2">
              FINANCIAL STRATEGIES
            </h2>
            <p className="text-sm opacity-80 font-medium leading-relaxed">
              Manage statutory withholdings and staff loan amortizations.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="relative z-10 btn bg-white text-primary border-none hover:bg-white/90 w-full font-bold mt-4"
          >
            <Plus size={18} /> ADD STRATEGY
          </button>
        </div>

        {/* --- 2. DEDUCTION CARDS --- */}
        {deductions.map((item) => {
          // Check if it's a Loan (has total_amount)
          const isLoan = item.total_amount > 0;
          const progress = isLoan
            ? Math.min(
                Math.round((item.paid_amount / item.total_amount) * 100),
                100
              )
            : 0;

          return (
            <div
              key={item.id}
              className="bg-[#151921] border border-white/5 rounded-[20px] p-6 flex flex-col justify-between min-h-[220px] hover:border-white/10 transition-colors relative group"
            >
              {/* Delete Button (Top Right) */}
              <button
                onClick={() => {
                  if (confirm("Delete this rule?")) deleteDeduction(item.id);
                }}
                className="absolute cursor-pointer top-4 right-4 text-white/20 hover:text-error transition-colors p-2"
              >
                <Trash2 size={16} />
              </button>

              {/* Top Section */}
              <div>
                <div className="size-10 rounded-xl bg-[#252b3b] flex items-center justify-center mb-4 text-warning">
                  {isLoan ? (
                    <History size={20} />
                  ) : (
                    <Shield size={20} className="text-info" />
                  )}
                </div>

                <h3 className="text-white font-bold text-lg uppercase tracking-wide truncate pr-6">
                  {item.name}
                </h3>

                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                  {isLoan
                    ? `INDIVIDUAL LOAN: ${item.fullname?.split(" ")[0]}`
                    : `POLICY: ${item.fullname}`}
                </div>
              </div>

              {/* Middle/Bottom Section */}
              <div className="mt-6">
                {/* Progress Bar for Loans */}
                {isLoan ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="text-[10px] font-bold text-white/40 uppercase">
                        Cycle Rate
                      </div>
                      <div className="text-2xl font-bold text-[#4a8aff]">
                        {formatMoney(item.amount)}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1.5">
                        <span>REPAYMENT PROGRESS</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#252b3b] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4a8aff] rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Deduction Layout */
                  <div>
                    <div className="w-full h-px bg-white/5 mb-4"></div>
                    <div className="text-[10px] font-bold text-white/40 uppercase mb-1">
                      Cycle Rate
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">
                      {formatMoney(item.amount)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddDeductionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employees={users}
      />
    </div>
  );
};

export default PayrollDeductionList;
