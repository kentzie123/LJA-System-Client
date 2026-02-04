"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

// Icons
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Clock,
  Calendar,
  Briefcase,
  DollarSign,
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();
  const { authUser } = useAuthStore();
  const role = authUser?.role;

  // --- DRAWER HELPER ---
  const closeDrawer = () => {
    const drawerCheckbox = document.getElementById("my-drawer");
    if (drawerCheckbox) drawerCheckbox.checked = false;
  };

  // --- MENU ITEMS CONFIGURATION ---
  const navItems = [
    { 
      icon: LayoutDashboard, 
      name: "Dashboard", 
      href: "/",
      // Visible to everyone
      isVisible: true 
    },
    { 
      icon: Users, 
      name: "Employee", 
      href: "/employee",
      // Controlled by 'perm_employee_view'
      isVisible: role?.perm_employee_view === true
    },
    { 
      icon: ShieldCheck, 
      name: "Roles & Permissions", 
      href: "/roles",
      // Strictly for Admin (1)
      isVisible: role?.id === 1
    },
    { 
      icon: Clock, 
      name: "Attendance", 
      href: "/attendance",
      // Controlled by 'perm_attendance_view'
      isVisible: role?.perm_attendance_view === true
    },
    { 
      icon: Calendar, 
      name: "Leave Requests", 
      href: "/leave",
      // Controlled by 'perm_leave_view'
      isVisible: role?.perm_leave_view === true 
    },
    { 
      icon: Briefcase, 
      name: "Overtime", 
      href: "/overtime",
      // Controlled by 'perm_overtime_view'
      isVisible: role?.perm_overtime_view === true
    },
    { 
      icon: DollarSign, 
      name: "Payroll & Finance", 
      href: "/payroll",
      // Controlled by 'perm_payroll_view'
      isVisible: role?.perm_payroll_view === true
    },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      
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
          <p className="text-[10px] font-bold text-secondary tracking-wider">
            LIMITED CO.
          </p>
        </div>
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-base-content/50 uppercase mb-4 px-2 tracking-wider">
          Main Menu
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            // Skip rendering if the item shouldn't be visible
            if (!item.isVisible) return null;

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 font-medium shadow-sm"
                      : "text-base-content/60 hover:text-base-content hover:bg-base-200 border border-transparent"
                  }
                `}
              >
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
    </div>
  );
};

export default Sidebar;