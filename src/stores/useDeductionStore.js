import { create } from "zustand";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

export const useDeductionStore = create((set, get) => ({
  deductions: [],
  isLoading: false,

  // Fetch all plans
  fetchDeductions: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/deductions");
      set({ deductions: res.data });
    } catch (error) {
      console.error("Fetch Deductions Error", error);
      toast.error("Failed to load deduction strategies");
    } finally {
      set({ isLoading: false });
    }
  },

  // Create new plan
  createDeduction: async (data) => {
    set({ isLoading: true });
    try {
      await api.post("/deductions/create", data);
      toast.success("Strategy added successfully!");
      get().fetchDeductions(); // Refresh list
      return true;
    } catch (error) {
      toast.error("Failed to add strategy");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete plan
  deleteDeduction: async (id) => {
    try {
      await api.delete(`/deductions/${id}`);
      toast.success("Strategy removed");
      get().fetchDeductions(); // Refresh
    } catch (error) {
      toast.error("Failed to delete strategy");
    }
  }
}));