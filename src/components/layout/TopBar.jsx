"use client";

import { useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut, User, Menu } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getImageUrl } from "@/utils/getImageUrl";

const TopBar = () => {
  const { logout, authUser } = useAuthStore();
  
  // 1. Create a reference for the dropdown container
  const dropdownRef = useRef(null);

  // 2. Safely blur the referenced container to close it
  const closeDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.blur();
    }
  };

  return (
    <div className="bg-base-100/95 backdrop-blur sticky top-0 z-30 border-b border-base-300 px-3 sm:px-4 h-14 flex items-center justify-between antialiased-text shadow-sm">
      
      {/* MOBILE TOGGLE */}
      <div className="flex-none lg:hidden">
        <label htmlFor="my-drawer" className="btn btn-sm h-8 w-8 min-h-0 btn-square btn-ghost border border-base-300 bg-base-200/50">
          <Menu size={16} className="text-base-content/70" />
        </label>
      </div>

      <div className="flex-1"></div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="flex items-center justify-center shrink-0">
          <ThemeToggle />
        </div>

        <div className="h-6 w-[1px] bg-base-300 hidden sm:block"></div>

        {/* USER DROPDOWN */}
        {/* 3. Attach the ref to the dropdown container */}
        <div className="dropdown dropdown-end" ref={dropdownRef}>
          
          {/* TRIGGER */}
          <div tabIndex={0} role="button" className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-md hover:bg-base-200 transition-all cursor-pointer border border-transparent hover:border-base-300 group">
            <div className="text-right hidden sm:flex flex-col justify-center">
              <div className="text-[11px] font-black uppercase tracking-tight leading-none text-base-content group-hover:text-primary transition-colors">
                {authUser?.fullname || "User"}
              </div>
              <div className="text-[8px] font-bold text-base-content/50 tracking-widest uppercase mt-1">
                {authUser?.position || "Employee"}
              </div>
            </div>

            <div className="relative flex items-center">
              <div className="size-8 relative rounded-md border border-base-300 overflow-hidden bg-base-200 shadow-sm">
                {authUser?.profile_picture ? (
                  <Image src={getImageUrl(authUser.profile_picture)} alt="Profile" fill className="object-cover" sizes="32px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-base-content/50 bg-base-200">
                    {authUser?.fullname?.substring(0, 2).toUpperCase() || "??"}
                  </div>
                )}
              </div>
              <ChevronDown size={12} className="absolute -bottom-1 -right-1 bg-base-100 text-base-content rounded-sm border border-base-300 shadow-sm transition-transform group-hover:translate-y-px" />
            </div>
          </div>

          {/* DROPDOWN CONTENT */}
          <div tabIndex={0} className="dropdown-content z-[50] mt-2">
            <div className="p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-base-100 rounded-lg w-48 border border-base-300 gap-0.5 flex flex-col">
              
              <div className="sm:hidden px-3 py-2 border-b border-base-200 mb-1 flex flex-col items-start pointer-events-none">
                <span className="text-[10px] font-black text-base-content uppercase tracking-widest leading-none">{authUser?.fullname}</span>
                <span className="text-[8px] font-bold text-base-content/50 uppercase tracking-widest mt-1">{authUser?.position || "Employee"}</span>
              </div>

              {/* 4. Call closeDropdown directly */}
              <Link href="/profile" onClick={closeDropdown} className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-base-200/50 text-[10px] font-bold uppercase tracking-widest text-base-content/80 hover:text-primary transition-colors">
                <User size={14} strokeWidth={2.5} /> My Profile
              </Link>

              <div className="h-[1px] bg-base-200 my-0.5 w-full"></div>

              <button
                onClick={() => {
                  closeDropdown();
                  logout();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-error/10 text-[10px] font-bold uppercase tracking-widest text-error transition-colors w-full text-left"
              >
                <LogOut size={14} strokeWidth={2.5} /> Sign Out
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TopBar;