"use client";

// Hooks
import { useEffect } from "react";

// Navigation
import { useRouter } from "next/navigation";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

const DashboardPage = () => {
  const { authUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [router, authUser]);

  if (!authUser) return null;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Welcome, {authUser?.fullname}</h1>
      <p>Your ID: {authUser?.id}</p>
    </div>
  );
};

export default DashboardPage;
