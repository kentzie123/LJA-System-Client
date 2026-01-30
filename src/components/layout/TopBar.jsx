// Theme toggler
import ThemeToggle from "./ThemeToggle";

// Image Optimizer
import Image from "next/image";
import Link from "next/link"; // Assuming you use Next.js routing

// Icons
import { ChevronDown, LogOut, User } from "lucide-react";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

const TopBar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <div className="flex justify-end mb-6">
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* Divider */}
        <div className="h-8 w-[1px] bg-base-content/10"></div>

        {/* --- USER DROPDOWN --- */}
        <div className="dropdown dropdown-end">
          {/* TRIGGER (The Clickable Area) */}
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-base-200/50 transition-all cursor-pointer group"
          >
            {/* Text Info */}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold leading-tight text-base-content">
                Kent Adriane Goc-ong
              </div>
              <div className="text-[10px] font-medium opacity-50 tracking-wide uppercase mt-0.5">
                Website Manager
              </div>
            </div>

            {/* Avatar Circle */}
            <div className="relative">
              <div className="size-9 relative rounded-full ring-1 ring-base-content/10 overflow-hidden bg-base-200">
                <Image
                  src={authUser.profile_picture}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              {/* Floating Chevron Badge */}
              <ChevronDown
                size={18}
                className="absolute bg-base-300 text-base-content -bottom-1 -right-1.5 rounded-full border-3 border-base-200"
              />
            </div>
          </div>

          {/* MENU CONTENT */}
          <ul
            tabIndex={0}
            className="dropdown-content z-[50] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-56 border border-base-200 mt-2 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* Mobile Header (Visible only on small screens) */}
            <li className="menu-title px-4 py-2 sm:hidden block">
              <span className="text-xs font-black opacity-100 text-base-content">
                Kent Adriane Goc-ong
              </span>
            </li>

            {/* Menu Items */}
            <li>
              <Link
                href="/profile"
                className="flex gap-3 py-2.5 font-medium text-sm"
              >
                <User size={16} className="opacity-70" />
                My Profile
              </Link>
            </li>

            <div className="divider my-1 opacity-50"></div>

            <li>
              <button
                className="flex gap-3 py-2.5 font-medium text-sm text-error hover:bg-error/10 hover:text-error active:bg-error/20"
                onClick={logout} // Hook up your logout logic later
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
