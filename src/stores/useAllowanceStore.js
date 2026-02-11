import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useAllowanceStore = create((set, get) => ({
  allowances: [],
  isLoading: false,
  isCreating: false,

  // --- FETCH ALL ---
  fetchAllowances: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/allowance");
      set({ allowances: res.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch allowances:", error);
      set({ isLoading: false });
    }
  },

  // --- CREATE ---
  createAllowance: async (data) => {
    set({ isCreating: true });
    try {
      await api.post("/allowance/create", data);
      toast.success("Allowance created successfully");
      get().fetchAllowances(); // Refresh list
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create allowance",
      );
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  // --- DELETE ---
  deleteAllowance: async (id) => {
    try {
      await api.delete(`/allowance/${id}`);
      toast.success("Allowance deleted");
      // Optimistic update
      set((state) => ({
        allowances: state.allowances.filter((item) => item.id !== id),
      }));
    } catch (error) {
      toast.error("Failed to delete allowance");
    }
  },

  // --- MANAGE SUBSCRIBERS ---
  updateSubscribers: async (id, userIds) => {
    try {
      await api.put(`/allowance/${id}/subscribers`, { userIds });
      toast.success("Subscribers updated!");
      get().fetchAllowances(); // Refresh count
      return true;
    } catch (error) {
      toast.error("Failed to update subscribers");
      return false;
    }
  },

  // --- TOGGLE STATUS (Pause/Resume) ---
  toggleStatus: async (id) => {
    try {
      // 1. Optimistic Update
      set((state) => ({
        allowances: state.allowances.map((a) =>
          a.id === id
            ? { ...a, status: a.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }
            : a,
        ),
      }));

      // 2. Send to Backend (FIXED: Used 'api' instead of 'axiosInstance')
      await api.patch(`/allowance/${id}/status`);

      toast.success("Status updated");
    } catch (error) {
      // 3. Revert if error
      console.error("Toggle failed", error);
      get().fetchAllowances();
      toast.error("Failed to update status");
    }
  },
}));
