import React from "react";
import { Shield, Key, Calendar, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatUtils";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

const EmploymentDetails = () => {
  const { authUser } = useAuthStore();
  // Safe Salary Calculation

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-fit">
      <div className="card-body">
        <h3 className="card-title text-xs font-bold opacity-60 uppercase mb-4 flex items-center gap-2 tracking-wider">
          <Shield size={14} /> Employment Details
        </h3>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label text-[10px] font-bold opacity-60 uppercase">
              Employee ID
            </label>
            <div className="input input-bordered input-sm flex items-center bg-base-200/50 tabular-nums text-xs font-mono">
              EMP-{authUser?.id?.toString().padStart(3, "0")}
            </div>
          </div>

          <div className="form-control">
            <label className="label text-[10px] font-bold opacity-60 uppercase">
              System Role
            </label>
            <div className="input input-bordered input-sm flex items-center gap-2 text-xs">
              <Key size={12} className="opacity-50" />{" "}
              {authUser?.role_name || "Employee"}
            </div>
          </div>

          <div className="form-control">
            <label className="label text-[10px] font-bold opacity-60 uppercase">
              Date Joined
            </label>
            <div className="input input-bordered input-sm flex items-center gap-2 text-xs tabular-nums">
              <Calendar size={12} className="opacity-50" />
              {authUser?.created_at ? formatDate(authUser.created_at) : "N/A"}
            </div>
          </div>

          <div className="divider my-1"></div>

          <div className="form-control">
            <label className="label text-[10px] font-bold opacity-60 uppercase text-success">
              {authUser.daily_rate > 0 ? "Daily Rate" : "Base Payrate"}
            </label>
            <div className="input input-bordered input-sm flex items-center gap-2 font-bold text-success bg-success/10 border-success/20 text-xs tabular-nums">
              <CreditCard size={14} /> {formatCurrency(authUser.daily_rate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentDetails;
