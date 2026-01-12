"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Icons
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Clock,
  Calendar,
  Briefcase,
  DollarSign,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const navItems = [
  { icon: LayoutDashboard, name: "Dashboard", href: "/" },
  { icon: Users, name: "Employee", href: "/employee" },
  { icon: ShieldCheck, name: "Roles & Permissions", href: "/roles" },
  { icon: Clock, name: "Attendance", href: "/attendance" },
  { icon: Calendar, name: "Leave Requests", href: "/leave" },
  { icon: Briefcase, name: "Overtime", href: "/overtime" },
  { icon: DollarSign, name: "Payroll & Finance", href: "/payroll" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <div className="h-full w-full flex flex-col bg-base-100 text-base-content p-6 transition-colors duration-300">
      {/* 1. Header / Logo Section */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="relative size-8 shrink-0 rounded-full border border-base-content/10 overflow-hidden shadow-sm">
          <Image
            src="/images/lja-logo.webp"
            alt="LJA Logo"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="leading-tight">
          <h1 className="font-bold text-lg tracking-wide">LJA Power</h1>
          {/* text-secondary is ALWAYS yellow/gold */}
          <p className="text-[10px] font-bold text-secondary tracking-wider">
            LIMITED CO.
          </p>
        </div>
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1">
        <div className="text-xs font-semibold text-base-content/50 uppercase mb-4 px-2 tracking-wider">
          Main Menu
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${
                    isActive
                      ? /* Active: Blue background tint + Blue Text + Blue Border */
                        "bg-primary/10 text-primary border border-primary/20 font-medium shadow-sm"
                      : /* Inactive: Muted text + Hover Effect */
                        "text-base-content/60 hover:text-base-content hover:bg-base-300 border border-transparent"
                  }
                `}
              >
                {/* Active Indicator Bar (Optional nice touch) */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full" />
                )}

                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-base-content/50 group-hover:text-base-content"
                  }`}
                />
                <span className="text-xs font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Footer / Sign Out */}
      <div className="mt-auto pt-6 border-t border-base-content/15">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-error/80 hover:text-error hover:bg-error/10 rounded-xl w-full transition-all duration-200 group"
        >
          <LogOut
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
