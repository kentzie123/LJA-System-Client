import React from "react";
import { Shield, Landmark } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const EmploymentDetails = () => {
  const { authUser } = useAuthStore();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency", currency: "PHP",
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* EMPLOYMENT CARD */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
          <h3 className="card-title text-xs font-bold opacity-60 uppercase mb-4 flex items-center gap-2 tracking-wider">
            <Shield size={16} className="text-primary" /> Employment Details
          </h3>

          <div className="space-y-4">
            <ReadOnlyField label="Employee ID" value={authUser?.employee_id} isMono />
            <ReadOnlyField label="Position" value={authUser?.position} />
            <ReadOnlyField label="System Role" value={authUser?.role_name} />
            <ReadOnlyField label="Employment Type" value={authUser?.employment_type} />
            <ReadOnlyField label="Date Hired" value={formatDate(authUser?.date_hired)} />
            
            <div className="divider my-1"></div>
            
            <div className="form-control">
              <label className="label text-[10px] font-bold opacity-60 uppercase text-success">
                Daily Rate
              </label>
              <div className="px-3 py-2 rounded-lg font-bold text-success bg-success/10 border border-success/20 text-sm tabular-nums">
                {formatCurrency(authUser?.daily_rate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GOVERNMENT & BANK CARD */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
          <h3 className="card-title text-xs font-bold opacity-60 uppercase mb-4 flex items-center gap-2 tracking-wider">
            <Landmark size={16} className="text-accent" /> Government & Bank
          </h3>

          <div className="space-y-4">
            <ReadOnlyField label="SSS Number" value={authUser?.sss_number} />
            <ReadOnlyField label="PhilHealth" value={authUser?.philhealth_number} />
            <ReadOnlyField label="Pag-IBIG" value={authUser?.pag_ibig_number} />
            <ReadOnlyField label="TIN" value={authUser?.tin_number} />
            
            <div className="divider my-1"></div>
            
            <ReadOnlyField label="Bank Name" value={authUser?.bank_name} />
            <ReadOnlyField label="Account Number" value={authUser?.bank_account_number} isMono />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for clean read-only fields
const ReadOnlyField = ({ label, value, isMono = false }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-bold opacity-50 uppercase">{label}</span>
    <span className={`text-sm font-medium ${!value ? "italic opacity-40" : ""} ${isMono ? "font-mono" : ""}`}>
      {value || "N/A"}
    </span>
  </div>
);

export default EmploymentDetails;