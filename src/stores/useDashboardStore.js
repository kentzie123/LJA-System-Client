import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useDashboardStore = create((set) => ({
  // --- STATE ---
  adminStats: null,
  employeeStats: null,
  
  isLoadingAdmin: false,
  isLoadingEmployee: false,
  error: null,

  // --- ACTIONS ---

  // 1. Fetch Admin Dashboard (Company Wide)
  fetchAdminStats: async () => {
    set({ isLoadingAdmin: true, error: null });
    try {
      const res = await api.get("/dashboard/admin");
      set({ adminStats: res.data, isLoadingAdmin: false });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      set({ 
        error: error.response?.data?.message || "Failed to load admin dashboard",
        isLoadingAdmin: false 
      });
      // Optional: Only toast if it's a real error, not just a 403 (forbidden)
      if (error.response?.status !== 403) {
        toast.error("Could not load company stats");
      }
    }
  },

  // 2. Fetch Employee Dashboard (Personal)
  fetchEmployeeStats: async () => {
    set({ isLoadingEmployee: true, error: null });
    try {
      const res = await api.get("/dashboard/employee");
      set({ employeeStats: res.data, isLoadingEmployee: false });
    } catch (error) {
      console.error("Failed to fetch personal stats:", error);
      set({ 
        error: error.response?.data?.message || "Failed to load personal dashboard",
        isLoadingEmployee: false 
      });
      toast.error("Could not load your dashboard");
    }
  },

  // 3. Reset (Useful on Logout)
  resetDashboard: () => {
    set({ 
      adminStats: null, 
      employeeStats: null, 
      error: null,
      isLoadingAdmin: false,
      isLoadingEmployee: false
    });
  },
}));