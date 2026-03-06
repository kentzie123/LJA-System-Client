"use client";

// Layout & Components
import ProfileHeader from "../ui/ProfilePageUIs/ProfileHeader";
import EmploymentDetails from "../ui/ProfilePageUIs/EmploymentDetails";
import PersonalDetailsForm from "../ui/ProfilePageUIs/PersonalDetailsForm";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProfilePage = () => {
  const { authUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [authUser, router]);

  if (!authUser) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <ProfileHeader />

      {/* Content Grid: 1 column on mobile, 3 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Read-Only Data: Employment & Gov IDs) */}
        <div className="lg:col-span-1 space-y-6">
          <EmploymentDetails />
        </div>

        {/* Right Column (Editable Data: Personal & Emergency) */}
        <div className="lg:col-span-2">
          <PersonalDetailsForm />
        </div>
        
      </div>
    </div>
  );
};

export default ProfilePage;