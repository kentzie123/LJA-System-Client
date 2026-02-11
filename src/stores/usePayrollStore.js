import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const usePayrollStore = create((set, get) => ({
  // --- STATE ---
  payrollPeriods: [],
  activePayRun: null,      // Basic info (selected from sidebar)
  activeRunDetails: null,  // FULL DETAILS (Meta + Records + Totals) for the main view

  isFetchingPeriods: false,
  isFetchingDetails: false,
  isCreating: false,
  isDeleting: false,
  isFinalizing: false, // Added loading state for finalization

  // --- ACTIONS ---

  // 1. SELECT ACTIVE RUN (Client-side selection)
  setActiveRun: (data) => {
    set({ activePayRun: data });
    // If we select a run, we should probably fetch its details immediately
    if (data?.id) {
      get().getPayRunDetails(data.id);
    }
  },

  // 2. GET ALL RUNS (For the Sidebar List)
  getAllPayrollPeriod: async () => {
    set({ isFetchingPeriods: true });
    try {
      const res = await api.get("/payroll");
      set({ payrollPeriods: res.data });
      
      // Optional: If no active run is selected, select the most recent one
      const { activePayRun, payrollPeriods } = get();
      if (!activePayRun && res.data.length > 0) {
         // Default to the first one (most recent)
         get().setActiveRun(res.data[0]); 
      }

    } catch (error) {
      console.error("Fetch Payroll Error:", error);
      toast.error("Failed to load payroll history");
    } finally {
      set({ isFetchingPeriods: false });
    }
  },

  // 3. GET SINGLE RUN DETAILS (For the Main Table & Stats)
  getPayRunDetails: async (id) => {
    set({ isFetchingDetails: true });
    try {
      const res = await api.get(`/payroll/${id}`);
      set({ activeRunDetails: res.data });
    } catch (error) {
      console.error("Fetch Details Error:", error);
      toast.error("Failed to load payroll details");
    } finally {
      set({ isFetchingDetails: false });
    }
  },

  // 4. CREATE PAY RUN (Triggers Calculation)
  createPayRun: async (formData) => {
    set({ isCreating: true });
    try {
      // This calls the calculation engine
      const res = await api.post("/payroll/create", formData);
      toast.success("Payroll calculated successfully!");

      // 1. Refresh the sidebar list
      await get().getAllPayrollPeriod();
      
      // 2. Automatically select and load the new run
      if (res.data?.id) {
        const newRun = get().payrollPeriods.find(p => p.id === res.data.id);
        if (newRun) get().setActiveRun(newRun);
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

  // 5. FINALIZE PAY RUN (Post to Ledger)
  finalizePayRun: async (id) => {
    set({ isFinalizing: true });
    try {
      await api.post(`/payroll/${id}/finalize`);
      toast.success("Pay run finalized and posted to ledger!");

      // Refresh details to show "Completed" status
      await get().getPayRunDetails(id);
      
      // Refresh list to update status in sidebar
      get().getAllPayrollPeriod();
      
      return true;
    } catch (error) {
      console.error("Finalize Error:", error);
      toast.error("Failed to finalize pay run.");
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