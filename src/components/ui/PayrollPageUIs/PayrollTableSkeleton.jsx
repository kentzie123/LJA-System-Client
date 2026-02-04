// Icons
import { Calculator } from "lucide-react";

const PayrollTableSkeleton = () => {
  return (
    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 bg-base-100 rounded-xl border border-base-200 shadow-sm opacity-60 select-none">
      <div className="p-6 bg-base-200 rounded-3xl">
        <Calculator size={48} strokeWidth={1.5} className="opacity-40" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-bold tracking-tight text-base-content uppercase">
          No Period Selected
        </h3>
        <p className="text-sm font-medium text-base-content/50">
          Choose a payout cycle from the sidebar to view full payroll
          registration details.
        </p>
      </div>
    </div>
  );
};

export default PayrollTableSkeleton;
