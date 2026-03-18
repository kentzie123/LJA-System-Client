import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const usePayrollStore = create((set, get) => ({
  // --- STATE ---
  payrollPeriods: [],
  activePayRun: null, // Summary info for sidebar/header
  activeRunDetails: null, // Full data (Meta + Records + Totals)

  isFetchingPeriods: false,
  isFetchingDetails: false,
  isCreating: false,
  isDeleting: false,
  isFinalizing: false,

  // --- ACTIONS ---

  // 1. SELECT ACTIVE RUN
  setActiveRun: (data) => {
    set({ activePayRun: data });
    if (data?.id) {
      get().getPayRunDetails(data.id);
    } else {
      set({ activeRunDetails: null });
    }
  },

  // 2. GET ALL PERIODS (Sidebar)
  getAllPayrollPeriod: async () => {
    set({ isFetchingPeriods: true });
    try {
      const res = await api.get("/payroll");
      console.log(res.data);
      set({ payrollPeriods: res.data });
      const { activePayRun } = get();
      if (res.data.length > 0) {
        const stillExists = res.data.find((p) => p.id === activePayRun?.id);
        if (!activePayRun || !stillExists) {
          get().setActiveRun(res.data[0]);
        }
      }      
    } catch (error) {
      console.error("Fetch Payroll Error:", error);
      toast.error("Failed to load payroll history");
    } finally {
      set({ isFetchingPeriods: false });
    }
  },

  // 3. GET SINGLE RUN DETAILS (Main View)
  getPayRunDetails: async (id) => {
    set({ isFetchingDetails: true });
    try {
      const res = await api.get(`/payroll/${id}`);
      set({ activeRunDetails: res.data });
      // Keep activePayRun meta info in sync with details meta
      set({ activePayRun: res.data.meta });
      
    } catch (error) {
      console.error("Fetch Details Error:", error);
      // If unauthorized (trying to see a draft without permission), clear state
      if (error.response?.status === 403) {
        set({ activeRunDetails: null, activePayRun: null });
      }
      toast.error(error.response?.data?.message || "Failed to load details");
    } finally {
      set({ isFetchingDetails: false });
    }
  },

  // 4. CREATE PAY RUN (Calculation Trigger)
  createPayRun: async (formData) => {
    set({ isCreating: true });
    try {
      const res = await api.post("/payroll/create", formData);
      toast.success("Payroll drafted successfully!");

      // Refresh sidebar list first
      await get().getAllPayrollPeriod();

      // If backend returned the new record, select it
      if (res.data?.data?.id) {
        const newId = res.data.data.id;
        get().getPayRunDetails(newId);
      }

      return true;
    } catch (error) {
      console.error("Create Payroll Error:", error);
      toast.error(error.response?.data?.message || "Failed to create payroll");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  // 5. APPROVE/FINALIZE PAY RUN
  approvePayRun: async (id) => {
    set({ isFinalizing: true });
    try {
      await api.put(`/payroll/${id}/approve`);
      toast.success("Pay run approved and finalized!");

      // 1. Refresh the main details (to update UI buttons/labels to 'Approved')
      await get().getPayRunDetails(id);
      
      // 2. Refresh the sidebar list (to update total costs/status badges)
      await get().getAllPayrollPeriod();

      return true;
    } catch (error) {
      console.error("Approve Error:", error);
      toast.error(error.response?.data?.message || "Failed to approve pay run.");
      return false;
    } finally {
      set({ isFinalizing: false });
    }
  },

  // 6. DELETE PAY RUN
  deletePayRun: async (id) => {
    set({ isDeleting: true });
    try {
      await api.delete(`/payroll/${id}`);
      toast.success("Payroll period deleted");

      // Clear selection if we deleted the current one
      if (get().activePayRun?.id === id) {
        set({ activePayRun: null, activeRunDetails: null });
      }

      await get().getAllPayrollPeriod();
      return true;
    } catch (error) {
      console.error("Delete Payroll Error:", error);
      toast.error(error.response?.data?.message || "Failed to delete");
      return false;
    } finally {
      set({ isDeleting: false });
    }
  },
}));