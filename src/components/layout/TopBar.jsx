"use client";

// Theme toggler
import ThemeToggle from "./ThemeToggle";

// Image Optimizer
import Image from "next/image";
import Link from "next/link";

// Icons
import { ChevronDown, LogOut, User, Menu } from "lucide-react";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

const TopBar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <div className="navbar bg-base-100/80 backdrop-blur sticky top-0 z-30 border-b border-base-200 px-4 h-16">
      <div className="flex-none lg:hidden mr-2">
        <label
          htmlFor="my-drawer"
          className="btn btn-square btn-ghost drawer-button"
        >
          <Menu size={24} />
        </label>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* --- RIGHT: ACTIONS --- */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* Divider */}
        <div className="h-8 w-[1px] bg-base-content/10 hidden sm:block"></div>

        {/* --- USER DROPDOWN --- */}
        <div className="dropdown dropdown-end">
          {/* TRIGGER */}
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-base-200/50 transition-all cursor-pointer group"
          >
            {/* Text Info */}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold leading-tight text-base-content">
                {authUser?.fullname || "User"}
              </div>
              <div className="text-[10px] font-medium opacity-50 tracking-wide uppercase mt-0.5">
                {authUser?.position || "Employee"}
              </div>
            </div>

            {/* Avatar Circle */}
            <div className="relative">
              <div className="size-9 relative rounded-full ring-1 ring-base-content/10 overflow-hidden bg-base-200">
                <Image
                  src={
                    authUser?.profile_picture || "/images/default_profile.jpg"
                  }
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <ChevronDown
                size={14}
                className="absolute bg-base-100 text-base-content -bottom-1 -right-1 rounded-full shadow-sm border border-base-200 p-0.5"
              />
            </div>
          </div>

          {/* DROPDOWN MENU */}
          <ul
            tabIndex={0}
            className="dropdown-content z-[50] menu p-2 shadow-2xl bg-base-100 rounded-box w-56 border border-base-200 mt-4 gap-1"
          >
            {/* Mobile Header (Visible only on small screens) */}
            <li className="menu-title sm:hidden px-4">
              <span className="text-xs font-black opacity-100 text-base-content">
                {authUser?.fullname}
              </span>
            </li>

            <li>
              <Link href="/profile" className="flex gap-3">
                <User size={16} /> My Profile
              </Link>
            </li>

            <div className="divider my-0"></div>

            <li>
              <button
                onClick={logout}
                className="text-error hover:bg-error/10 flex gap-3"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
