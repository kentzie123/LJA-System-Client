"use client";

import { useRef } from "react";

// Auth
import AuthInitializer from "./AuthInitializer";

// Components
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

const Layout = ({ children }) => {
  const { authUser } = useAuthStore();
  
  // 1. Create a reference to the DaisyUI drawer checkbox
  const drawerRef = useRef(null);

  // 2. Safely uncheck the box using the ref
  const closeDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.checked = false;
    }
  };

  return (
    <AuthInitializer>
      {!authUser ? (
        <main className="min-h-screen w-full bg-base-100">{children}</main>
      ) : (
        <div className="drawer lg:drawer-open h-screen w-full overflow-hidden bg-base-200/50 antialiased-text">
          
          {/* 3. Attach the ref to the input */}
          <input ref={drawerRef} id="my-drawer" type="checkbox" className="drawer-toggle" />
          
          <div className="drawer-content flex flex-col h-screen overflow-hidden relative">
            <div className="shrink-0 z-20 shadow-sm relative">
              <TopBar />
            </div>
            
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 custom-scrollbar relative z-10">
              <div className="mx-auto w-full max-w-[1800px] h-full flex flex-col">
                {children}
              </div>
            </main>
          </div> 
          
          <div className="drawer-side z-[100]">
            <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay bg-black/60 backdrop-blur-sm"></label> 
            
            <aside className="bg-base-100 h-screen w-[240px] border-r border-base-300 flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
               {/* 4. Pass the close function to the Sidebar */}
               <Sidebar closeDrawer={closeDrawer} />
            </aside>
          </div>
        </div>
      )}
    </AuthInitializer>
  );
};

export default Layout;