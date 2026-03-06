"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import {
  ArrowLeft,
  Briefcase,
  User,
  Landmark,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const EmployeeDetailsPage = ({ employeeId }) => {
  const router = useRouter();
  const { fetchUserByEmployeeId, isFetchingSingleUser } = useUserStore();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (employeeId) {
        const data = await fetchUserByEmployeeId(employeeId);
        if (data) setEmployee(data);
      }
    };
    loadUser();
  }, [employeeId, fetchUserByEmployeeId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  if (isFetchingSingleUser || !employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/50 text-sm animate-pulse">
          Loading employee profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. PAGE TITLE & BACK BUTTON */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="btn btn-sm btn-circle btn-ghost border-base-300 bg-base-100 shadow-sm"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Employee Profile</h1>
      </div>

      {/* 2. TOP PROFILE HEADER CARD */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 md:p-8">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full ring ring-base-200 ring-offset-base-100 ring-offset-2">
              <img
                src={employee.profile_picture || "/images/default_profile.jpg"}
                alt={employee.fullname}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default_profile.jpg";
                }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start flex-1 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
              <h2 className="text-2xl font-bold text-base-content">
                {employee.fullname}
              </h2>
            </div>

            <p className="text-primary font-medium">
              {employee.position || "No Position Assigned"}
            </p>

            <div className="divider my-2 w-full"></div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-base-content/70">
              <span className="flex items-center gap-1.5">
                <Mail size={16} /> {employee.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={16} /> {employee.contact_number || "N/A"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={16} /> {employee.residential_address || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETAILS GRID (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employment */}
        <InfoCard
          title="Employment Details"
          icon={<Briefcase size={18} className="text-primary" />}
        >
          <DetailRow label="Employee ID" value={employee.employee_id} isMono />
          <DetailRow label="Role" value={employee.role_name} />
          <DetailRow label="Type" value={employee.employment_type} />
          <DetailRow
            label="Date Hired"
            value={formatDate(employee.date_hired)}
          />
          <DetailRow
            label="Daily Rate"
            value={formatCurrency(employee.daily_rate)}
            isHighlight
          />
        </InfoCard>

        {/* Personal */}
        <InfoCard
          title="Personal Information"
          icon={<User size={18} className="text-secondary" />}
        >
          <DetailRow
            label="Date of Birth"
            value={formatDate(employee.date_of_birth)}
          />
          <DetailRow label="Gender" value={employee.gender} />
          <DetailRow label="Civil Status" value={employee.civil_status} />
          <DetailRow label="Place of Birth" value={employee.place_of_birth} />
        </InfoCard>

        {/* Gov & Bank */}
        <InfoCard
          title="Government & Bank"
          icon={<Landmark size={18} className="text-accent" />}
        >
          <DetailRow label="SSS No." value={employee.sss_number} isMono />
          <DetailRow
            label="PhilHealth No."
            value={employee.philhealth_number}
            isMono
          />
          <DetailRow
            label="Pag-IBIG No."
            value={employee.pag_ibig_number}
            isMono
          />
          <DetailRow label="TIN" value={employee.tin_number} isMono />
          <div className="col-span-1 sm:col-span-2 border-t border-base-200 mt-2 pt-2"></div>
          <DetailRow label="Bank Name" value={employee.bank_name} />
          <DetailRow
            label="Account No."
            value={employee.bank_account_number}
            isMono
          />
        </InfoCard>

        {/* Emergency */}
        <InfoCard
          title="Emergency Contact"
          icon={<HeartPulse size={18} className="text-error" />}
          className="border-error/20 bg-error/5"
        >
          <div className="col-span-1 sm:col-span-2">
            <DetailRow
              label="Contact Name"
              value={employee.emergency_contact_name}
              isHighlight
            />
          </div>
          <DetailRow
            label="Relationship"
            value={employee.emergency_relationship}
          />
          <DetailRow
            label="Phone Number"
            value={employee.emergency_contact_number}
          />
        </InfoCard>
      </div>
    </div>
  );
};

/* --- REUSABLE MICRO-COMPONENTS --- */

const InfoCard = ({ title, icon, children, className = "border-base-200" }) => (
  <div className={`card bg-base-100 shadow-sm border ${className}`}>
    <div className="card-body p-6">
      <h3 className="card-title text-sm font-bold opacity-70 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-base-200 pb-2">
        {icon} {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
        {children}
      </div>
    </div>
  </div>
);

const DetailRow = ({ label, value, isHighlight, isMono }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-bold text-base-content/50 uppercase">
      {label}
    </span>
    {value ? (
      <span
        className={`text-sm ${isHighlight ? "font-bold text-primary" : "font-medium text-base-content"} ${isMono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    ) : (
      <span className="text-sm text-base-content/30 italic">N/A</span>
    )}
  </div>
);

export default EmployeeDetailsPage;
