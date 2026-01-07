"use client";

// Hooks
import { useEffect } from "react";

// Navigation
import { useRouter } from "next/navigation";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

// Layouts
import TopBar from "../layout/TopBar";

// Icons
import {
  CalendarDaysIcon,
  Users,
  Briefcase,
  Clock,
  DollarSign,
} from "lucide-react";

const DashboardPage = () => {
  const { authUser } = useAuthStore();
  const router = useRouter();

  const cardsData = [
    {
      name: "Total Employee",
      value: "5",
      // CHANGE 1: Use the full class string here
      bgClass: "bg-primary/85",
      icon: Users,
      desc: "Active Staff",
    },
    {
      name: "On Leave Today",
      value: "1",
      bgClass: "bg-warning/85",
      icon: Briefcase,
      desc: "Approved Absences",
    },
    {
      name: "Attendance Today",
      value: "3/5",
      bgClass: "bg-success/85",
      icon: Clock,
      desc: "1 Late Arrival/s",
    },
    {
      name: "Est. Payroll",
      value: "₱335.5k",
      bgClass: "bg-accent/85",
      icon: DollarSign,
      desc: "Last Month Net",
    },
  ];

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [router, authUser]);

  if (!authUser) return null;

  return (
    <div className="space-y-6">
      <TopBar title={"Dashboard"}/>
      {/* 1st section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold">Dashboard Overview</div>
          <div className="text-sm tracking-wide opacity-65">
            Welcome back, {authUser?.fullname || "User"}. Here's what's
            happening today.
          </div>
        </div>
        <div className="flex items-center gap-2 border border-base-content/20 shadow-xs text-xs bg-base-100 rounded-lg px-2.5 py-1.5">
          <CalendarDaysIcon className="size-3 text-primary" />
          <div>Sun, Dec 21</div>
        </div>
      </div>

      {/* 2nd section */}
      <div className="grid grid-cols-4 gap-6">
        {cardsData.map((card, i) => {
          const Icon = card.icon;

          return (
            <div
              key={i}
              className="flex justify-between bg-base-100 rounded-xl border border-base-300 shadow-xs p-6"
            >
              <div className="text-xs space-y-2">
                <div className="text-base-content font-semibold opacity-80">
                  {card.name}
                </div>
                <div className="text-3xl font-bold">{card.value}</div>
                <div className="font-medium opacity-60">{card.desc}</div>
              </div>

              {/* CHANGE 2: Use the complete class string directly */}
              <div className={`p-3 ${card.bgClass} rounded-lg h-fit`}>
                <Icon className="text-white size-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardPage;
