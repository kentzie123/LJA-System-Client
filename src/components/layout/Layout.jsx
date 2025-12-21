"use client";

// Auth
import AuthInitializer from "./AuthInitializer";

// layout
import Sidebar from "./Sidebar";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

const Layout = ({ children }) => {
  const { authUser } = useAuthStore();

  if (!authUser) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-base-100">
        <Sidebar />
      </aside>

      <main className="flex-1">
        <AuthInitializer>{children}</AuthInitializer>
      </main>
    </>
  );
};

export default Layout;
