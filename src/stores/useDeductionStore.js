import { create } from "zustand";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

export const useDeductionStore = create((set, get) => ({
  // --- STATE ---
  deductions: [],
  isLoading: false,
  isSubmitting: false,

  // --- ACTIONS ---

  // 1. FETCH ALL PLANS
  fetchDeductions: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/deductions/");
      set({ deductions: res.data });
    } catch (error) {
      console.error("Fetch Deductions Error:", error);
      toast.error("Failed to load deduction plans.");
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. CREATE PLAN
  createDeduction: async (payload) => {
    set({ isSubmitting: true });
    try {
      await api.post("/deductions/create", payload);
      
      // Refresh list to get the full subscriber data/counts calculated by server
      await get().fetchDeductions();

      set({ isSubmitting: false });
      toast.success("Deduction plan created!");
      return true;
    } catch (error) {
      console.error(error);
      set({ isSubmitting: false });
      toast.error(error.response?.data?.message || "Failed to create plan");
      return false;
    }
  },

  // 3. UPDATE STATUS (Pause/Resume)
  toggleStatus: async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

    // Optimistic Update
    set((state) => ({
      deductions: state.deductions.map((d) =>
        d.id === id ? { ...d, status: newStatus } : d,
      ),
    }));

    try {
      // FIX: Added "/status" to match the backend route
      await api.patch(`/deductions/${id}/status`);
      
      toast.success(`Plan ${newStatus === "ACTIVE" ? "Resumed" : "Paused"}`);
    } catch (error) {
      console.error("Toggle Status Error:", error);
      // Revert if failed
      set((state) => ({
        deductions: state.deductions.map((d) =>
          d.id === id ? { ...d, status: currentStatus } : d,
        ),
      }));
      toast.error("Failed to update status.");
    }
  },

  // 4. UPDATE SUBSCRIBERS
  updateSubscribers: async (planId, userIds) => {
    set({ isSubmitting: true });
    try {
      // FIX: Changed to PUT to match backend route (router.put)
      const res = await api.put(`/deductions/${planId}/subscribers`, {
        user_ids: userIds,
      });

      // Update the local count immediately
      set((state) => ({
        deductions: state.deductions.map((d) =>
          d.id === planId ? { ...d, subscriber_count: res.data.count } : d,
        ),
      }));

      // Optional: Refetch to get the actual list of names if needed for the UI
      await get().fetchDeductions();

      toast.success("Subscribers updated successfully!");
      return true;
    } catch (error) {
      console.error("Update Subscribers Error:", error);
      toast.error("Failed to update subscribers.");
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // 5. DELETE PLAN
  deleteDeduction: async (id) => {
    try {
      await api.delete(`/deductions/${id}`);

      set((state) => ({
        deductions: state.deductions.filter((d) => d.id !== id),
      }));

      toast.success("Deduction plan deleted.");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete plan.");
    }
  },
}));