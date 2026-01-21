"use client";

// UI
import TopBar from "../layout/TopBar";
import PayrollHeader from "../ui/PayrollPageUIs/PayrollHeader";

// Hooks
import { useEffect, useState } from "react";
import PayrollPeriodList from "../ui/PayrollPageUIs/PayrollPeriodList";

// Store
import { useAuthStore } from "@/stores/useAuthStore";

// Routing
import { useRouter } from "next/navigation";

const PayrollPage = () => {
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("payoutCycles");

  const router = useRouter();

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    } else {
    }
  }, []);

  if (!authUser) null;
  return (
    <div className="space-y-6">
      <TopBar />
      <PayrollHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <PayrollPeriodList />
        </div>
        <div className="col-span-3">asd</div>
      </div>
    </div>
  );
};

export default PayrollPage;
