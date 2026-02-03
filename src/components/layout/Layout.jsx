"use client";

// Auth
import AuthInitializer from "./AuthInitializer";

// Components
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

const Layout = ({ children }) => {
  const { authUser } = useAuthStore();

  return (
    <AuthInitializer>
      {!authUser ? (
        <main className="min-h-screen w-full">{children}</main>
      ) : (
        // DAISY UI DRAWER WRAPPER
        <div className="drawer lg:drawer-open">
          
          {/* THE TOGGLE CHECKBOX (Hidden, controlled by TopBar label) */}
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          
          {/* --- MAIN CONTENT (Right Side) --- */}
          <div className="drawer-content flex flex-col min-h-screen bg-base-200">
            {/* TopBar sits at the top of the content area */}
            <TopBar />
            
            {/* Page Content */}
            <main className="flex-1 p-6 overflow-y-auto">
              {children}
            </main>
          </div> 
          
          {/* --- SIDEBAR (Left Side) --- */}
          <div className="drawer-side z-50">
            {/* Mobile Overlay (Click to close sidebar on mobile) */}
            <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label> 
            
            {/* Sidebar Component */}
            <aside className="bg-base-100 min-h-full w-64 border-r border-base-200 text-base-content">
               <Sidebar />
            </aside>
          </div>
        </div>
      )}
    </AuthInitializer>
  );
};

export default Layout;