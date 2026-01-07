"use client";

import { useEffect } from "react";

// Stores
import { useAuthStore } from "@/stores/useAuthStore";

import { Loader } from "lucide-react";

export default function AuthInitializer({ children }) {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    console.log("Checking Auth..");

    checkAuth();
  }, [checkAuth]);

  // Show a full-screen loading spinner while verifying the cookie
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-(--bg-dark-lja)">
        <Loader className="size-10 animate-spin text-(--accent-yellow-lja)" />
      </div>
    );
  }

  return <>{children}</>;
}
