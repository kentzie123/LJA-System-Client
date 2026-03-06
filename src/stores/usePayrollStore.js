import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const usePayrollStore = create((set, get) => ({
  // --- STATE ---
  payrollPeriods: [],
  activePayRun: null, // Basic info (selected from sidebar)
  activeRunDetails: null, // FULL DETAILS (Meta + Records + Totals) for the main view

  isFetchingPeriods: false,
  isFetchingDetails: false,
  isCreating: false,
  isDeleting: false,
  isFinalizing: false,

  // --- ACTIONS ---

  // 1. SELECT ACTIVE RUN (Client-side selection)
  setActiveRun: (data) => {
    set({ activePayRun: data });
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

      const { activePayRun, payrollPeriods } = get();
      if (!activePayRun && res.data.length > 0) {
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

  // 4. CREATE PAY RUN (Triggers Calculation as DRAFT)
  createPayRun: async (formData) => {
    set({ isCreating: true });
    try {
      const res = await api.post("/payroll/create", formData);
      toast.success("Payroll drafted successfully!");

      await get().getAllPayrollPeriod();

      // Automatically select and load the new run
      if (res.data?.data?.id) {
        const newRunId = res.data.data.id;
        // Fetch periods is async, so we might need to find it directly
        get().getPayRunDetails(newRunId);
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

  // 5. APPROVE PAY RUN (Post to Ledger & Finalize)
  approvePayRun: async (id) => {
    set({ isFinalizing: true });
    try {
      await api.put(`/payroll/${id}/approve`);
      toast.success("Pay run approved!");

      // Refresh details to show "Approved" status
      await get().getPayRunDetails(id);

      // Refresh sidebar list
      await get().getAllPayrollPeriod();

      return true;
    } catch (error) {
      console.error("Approve Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to approve pay run.",
      );
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

      const currentActive = get().activePayRun;
      if (currentActive?.id === id) {
        set({ activePayRun: null, activeRunDetails: null });
      }

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
