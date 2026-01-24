import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const usePayrollStore = create((set, get) => ({
  // --- STATE ---
  payrollPeriods: [],
  activePayRun: null, // Basic info (from the list)
  activeRunDetails: null, // FULL DETAILS (Meta + Records + Totals)

  isFetchingPeriods: false,
  isFetchingDetails: false, // New loading state for the details page
  isCreating: false,
  isDeleting: false,

  // --- ACTIONS ---

  // 1. SELECT ACTIVE RUN (Client-side only)
  setActiveRun: (data) => {
    set({ activePayRun: data });
  },

  // 2. GET ALL RUNS (For the main list)
  getAllPayrollPeriod: async () => {
    set({ isFetchingPeriods: true });
    try {
      const res = await api.get("/payroll");
      set({ payrollPeriods: res.data });
    } catch (error) {
      console.error("Fetch Payroll Error:", error);
      toast.error("Failed to load payroll history");
    } finally {
      set({ isFetchingPeriods: false });
    }
  },

  // 3. GET SINGLE RUN DETAILS (For the specific page)
  // This calls your new /:id endpoint!
  getPayRunDetails: async (id) => {
    set({ isFetchingDetails: true, activeRunDetails: null });
    try {
      const res = await api.get(`/payroll/${id}`);
      set({ activeRunDetails: res.data });
      console.log(res.data);
      
    } catch (error) {
      console.error("Fetch Details Error:", error);
      toast.error("Failed to load payroll details");
    } finally {
      set({ isFetchingDetails: false });
    }
  },

  // 4. CREATE PAY RUN
  createPayRun: async (formData) => {
    set({ isCreating: true });
    try {
      await api.post("/payroll/create", formData);
      toast.success("Payroll period created successfully!");

      // Refresh the list immediately
      await get().getAllPayrollPeriod();
      return true;
    } catch (error) {
      console.error("Create Payroll Error:", error);
      toast.error(error.response?.data?.message || "Failed to create payroll");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  // 5. DELETE PAY RUN
  deletePayRun: async (id) => {
    set({ isDeleting: true });
    try {
      await api.delete(`/payroll/${id}`);
      toast.success("Payroll period deleted successfully");

      // Clear active states if we deleted the current one
      const currentActive = get().activePayRun;
      if (currentActive?.id === id) {
        set({ activePayRun: null, activeRunDetails: null });
      }

      // Refresh list
      await get().getAllPayrollPeriod();
      return true;
    } catch (error) {
      console.error("Delete Payroll Error:", error);
      toast.error("Failed to delete payroll period");
      return false;
    } finally {
      set({ isDeleting: false });
    }
  },
}));
