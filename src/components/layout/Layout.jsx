"use client";

// Auth
import AuthInitializer from "./AuthInitializer";

// layout
import Sidebar from "./Sidebar";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

const Layout = ({ children }) => {
  const { authUser } = useAuthStore();

  return (
    // 1. Wrap EVERYTHING in AuthInitializer so checkAuth() always runs first
    <AuthInitializer>
      {/* 2. Now we can safely check authUser because AuthInitializer 
             blocks rendering until the check is finished */}

      {!authUser ? (
        // STATE A: Not Logged In (Login Page) - No Sidebar
        <main className="min-h-screen w-full">{children}</main>
      ) : (
        // STATE B: Logged In (Dashboard) - With Sidebar
        // Note: We add a flex container here to replicate the body layout behavior
        <div className="flex h-screen w-full overflow-hidden">
          <aside className="w-56 bg-base-100 border-r border-base-300">
            <Sidebar />
          </aside>

          <main className="flex-1 overflow-y-auto bg-base-200 p-8">
            {children}
          </main>
        </div>
      )}
    </AuthInitializer>
  );
};

export default Layout;
