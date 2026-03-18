"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

// Added 'CalendarDays' for a distinct icon from 'Leave Requests'
import { Users, ShieldCheck, Clock, Calendar, Briefcase, DollarSign, CalendarDays } from "lucide-react";

const Sidebar = ({ closeDrawer }) => {
  const pathname = usePathname();
  const { authUser } = useAuthStore();
  const role = authUser?.role;

  const navItems = [
    { icon: Users, name: "Employee", href: "/employee", isVisible: role?.perm_employee_view === true },
    { icon: ShieldCheck, name: "Roles & Permissions", href: "/roles", isVisible: (role?.id === 1 || role?.id === 3) && role?.perm_role_view === true },
    { icon: Clock, name: "Attendance", href: "/", isVisible: role?.perm_attendance_view === true },
    { icon: Calendar, name: "Leave Requests", href: "/leave", isVisible: role?.perm_leave_view === true },
    { icon: Briefcase, name: "Overtime", href: "/overtime", isVisible: role?.perm_overtime_view === true },
    { icon: CalendarDays, name: "Events", href: "/events", isVisible: role?.perm_event_view === true }, 
    { icon: DollarSign, name: "Payroll & Finance", href: "/payroll", isVisible: role?.perm_payroll_view === true }
  ];

  return (
    <div className="h-full flex flex-col bg-base-100 antialiased-text">
      
      {/* Header / Logo Section */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-base-200 shrink-0 bg-base-200/30">
        <div className="relative size-9 shrink-0 rounded-md overflow-hidden bg-base-100 shadow-sm flex items-center justify-center">
          <Image src="/images/lja-logo.webp" alt="LJA Logo" fill className="object-cover" sizes="36px" />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="font-black text-[14px] uppercase tracking-tight text-base-content leading-none truncate">
            LJA Power
          </h1>
          <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-1 truncate">
            HRIS Management
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-5">
        <div className="text-[9px] font-black text-base-content/40 uppercase tracking-[0.2em] mb-3 px-6">
          Main Menu
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            if (!item.isVisible) return null;

            const Icon = item.icon;
            const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative group
                  ${isActive ? "bg-primary/10 text-primary font-bold" : "text-base-content/60 hover:bg-base-200/50 hover:text-base-content"}`}
              >
                {/* Active Indicator Line */}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-primary rounded-r-md" />}
                
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-base-content/40 group-hover:text-base-content/70"}`} />
                <span className={`text-[11px] uppercase tracking-widest truncate mt-[1px] ${isActive ? "font-black" : "font-bold"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;