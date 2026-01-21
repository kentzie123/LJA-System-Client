"use client"

const PayrollHeader = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Payroll & Finance</h1>
        <p className="text-sm opacity-60">
          Payroll orchestration, audit logs, and deduction strategies.
        </p>
      </div>

      <div className="bg-base-100 border border-white/20 p-1 rounded-lg flex gap-1 items-center w-full md:w-auto">
        <button
          onClick={() => setActiveTab("payoutCycles")}
          className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
            activeTab === "payoutCycles"
              ? "bg-primary text-primary-content shadow-sm"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          Payout Cycles
        </button>
        <button
          onClick={() => setActiveTab("deductionRules")}
          className={`flex-1 md:flex-none relative px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
            activeTab === "deductionRules"
              ? "bg-primary text-primary-content shadow-sm"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          Deduction Rules
        </button>
      </div>
    </div>
  );
};

export default PayrollHeader;
