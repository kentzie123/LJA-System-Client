"use client";

// Layout & Components
import TopBar from "../layout/TopBar";
import ProfileHeader from "../ui/ProfilePageUIs/ProfileHeader";
import EmploymentDetails from "../ui/ProfilePageUIs/EmploymentDetails";
import PersonalDetailsForm from "../ui/ProfilePageUIs/PersonalDetailsForm";

import { useAuthStore } from "@/stores/useAuthStore";

// Routing
import { useRouter } from "next/navigation";

// Hooks
import { useEffect } from "react";

const ProfilePage = () => {
  const { authUser } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [authUser]);

  if (!authUser) return null;

  return (
    <>
      <TopBar />
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <ProfileHeader />

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Left Column (Self-contained, connects to store directly) */}
          <EmploymentDetails />

          {/* Right Column (Controlled by page state) */}
          <PersonalDetailsForm />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
