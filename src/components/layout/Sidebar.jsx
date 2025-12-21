"use client";

import Image from "next/image";

// Icons
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Clock,
  Calendar,
  Briefcase,
  DollarSign,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, name: "Dashboard", href: "/" },
  { icon: User, name: "Employee", href: "/employee" },
  {
    icon: ShieldCheck,
    name: "Roles & Permissions",
    href: "/roles_permissions",
  },
  { icon: Clock, name: "Attendace", href: "/attendance" },
  { icon: Calendar, name: "Leave Requests", href: "/leave" },
  { icon: Briefcase, name: "Overtime", href: "/overtime" },
  { icon: DollarSign, name: "Payroll & Finance", href: "/payroll" },
];

const Sidebar = () => {
  return (
    <div className="p-4">
      <div></div>
      <div>
        <div className="text-sm">MAIN MENU</div>

        <div className="flex flex-col">
          {navItems.map((nav, i) => (
            <div key={i}>{nav.name}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
