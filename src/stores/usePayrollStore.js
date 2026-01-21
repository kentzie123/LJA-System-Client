import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const usePayrollStore = create((set, get) => ({
  payrollPeriods: [],
  activePayRun: null,

  isFetchingPeriods: false,
  isCreating: false,
  isDeleting: false,

  setActiveRun: (data) => {
    set({ activePayRun: data });
  },

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

  deletePayRun: async (id) => {
    set({ isDeleting: true });
    try {
      await api.delete(`/payroll/${id}`);
      toast.success("Payroll period deleted successfully");

      const currentActive = get().activePayRun;
      if (currentActive?.id === id) {
        set({ activePayRun: null });
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
