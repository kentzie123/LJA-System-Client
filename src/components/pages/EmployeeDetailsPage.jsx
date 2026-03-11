"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";
import {
  ArrowLeft,
  Briefcase,
  User,
  Landmark,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Loader2,
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
      month: "short", // Shorter month format
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin size-6 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 animate-pulse">
          Syncing Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-300 antialiased-text">
      {/* 1. COMPACT PAGE TITLE & BACK BUTTON */}
      <div className="flex items-center gap-3 border-b border-base-300 pb-3">
        <button
          onClick={() => router.back()}
          className="btn btn-xs h-7 w-7 min-h-0 btn-square btn-ghost border-base-300 bg-base-100 shadow-sm"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-lg font-black tracking-tight leading-none text-base-content">
            Employee Profile
          </h1>
          <span className="text-[9px] font-bold uppercase tracking-widest text-base-content/40 mt-1">
            Record ID: {employee.employee_id}
          </span>
        </div>
      </div>

      {/* 2. HIGH-DENSITY PROFILE HEADER CARD */}
      <div className="bg-base-100 shadow-sm border border-base-300 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 md:p-5 relative">
          {/* Shrunk Avatar */}
          <div className="avatar shrink-0 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-base-300 bg-base-200 relative overflow-hidden shadow-sm">
              <Image
                src={
                  employee.profile_picture
                    ? getImageUrl(employee.profile_picture)
                    : "/images/default_profile.jpg"
                }
                alt={employee.fullname}
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start flex-1 min-w-0 text-center sm:text-left z-10">
            <h2 className="text-xl sm:text-2xl font-black text-base-content leading-none mb-1.5 truncate w-full">
              {employee.fullname}
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                {employee.position || "Unassigned"}
              </span>
              <span className="text-[10px] font-bold text-base-content/50 border border-base-300 px-1.5 py-0.5 rounded">
                {employee.role_name}
              </span>
            </div>

            {/* Compact Contact Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-medium text-base-content/70">
              <div className="flex items-center gap-1.5 bg-base-200/50 border border-base-300 rounded-md px-2 py-1">
                <Mail size={12} className="opacity-50" />{" "}
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-base-200/50 border border-base-300 rounded-md px-2 py-1">
                <Phone size={12} className="opacity-50" />{" "}
                {employee.contact_number || "N/A"}
              </div>
              <div className="flex items-center gap-1.5 bg-base-200/50 border border-base-300 rounded-md px-2 py-1">
                <MapPin size={12} className="opacity-50" />{" "}
                <span className="truncate max-w-[150px]">
                  {employee.residential_address || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETAILS GRID (2 Columns, Tight Spacing) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Employment */}
        <InfoCard
          title="Employment Status"
          icon={<Briefcase size={14} className="text-primary" />}
        >
          <DetailRow label="Employee ID" value={employee.employee_id} isMono />
          <DetailRow label="Employment Type" value={employee.employment_type} />
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
          icon={<User size={14} className="text-secondary" />}
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
          title="Govt & Banking IDs"
          icon={<Landmark size={14} className="text-accent" />}
        >
          <DetailRow label="SSS Number" value={employee.sss_number} isMono />
          <DetailRow
            label="PhilHealth"
            value={employee.philhealth_number}
            isMono
          />
          <DetailRow label="Pag-IBIG" value={employee.pag_ibig_number} isMono />
          <DetailRow label="TIN" value={employee.tin_number} isMono />
          <div className="col-span-1 sm:col-span-2 border-t border-base-200/50 mt-1 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
            <DetailRow label="Bank Name" value={employee.bank_name} />
            <DetailRow
              label="Account Number"
              value={employee.bank_account_number}
              isMono
            />
          </div>
        </InfoCard>

        {/* Emergency */}
        <InfoCard
          title="Emergency Contact"
          icon={<HeartPulse size={14} className="text-error" />}
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
            isMono
          />
        </InfoCard>
      </div>
    </div>
  );
};

/* --- COMPACT REUSABLE COMPONENTS --- */

const InfoCard = ({ title, icon, children, className = "border-base-300" }) => (
  <div
    className={`bg-base-100 shadow-sm border rounded-xl overflow-hidden flex flex-col ${className}`}
  >
    {/* Card Header */}
    <div className="px-4 py-2.5 border-b border-current/10 bg-current/5 flex items-center gap-2 shrink-0">
      {icon}
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/70 m-0 leading-none mt-[1px]">
        {title}
      </h3>
    </div>
    {/* Card Body */}
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 flex-1">
      {children}
    </div>
  </div>
);

const DetailRow = ({ label, value, isHighlight, isMono }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[8px] font-black tracking-widest text-base-content/40 uppercase">
      {label}
    </span>
    {value ? (
      <span
        className={`text-[12px] leading-snug truncate ${isHighlight ? "font-bold text-primary" : "font-medium text-base-content"} ${isMono ? "font-mono font-bold opacity-80 text-[11px]" : ""}`}
      >
        {value}
      </span>
    ) : (
      <span className="text-[11px] text-base-content/30 italic font-medium">
        N/A
      </span>
    )}
  </div>
);

export default EmployeeDetailsPage;
