import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useOvertimeStore = create((set, get) => ({
  // --- STATE ---
  overtimeRequests: [],
  overtimeTypes: [], // New State for Dropdown

  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  selectedOvertime: null,

  setSelectedOvertime: (request) => set({ selectedOvertime: request }),

  // 1. Fetch Types (for Dropdown)
  fetchOvertimeTypes: async () => {
    try {
      const response = await api.get("/overtime/types");
      set({ overtimeTypes: response.data });
    } catch (error) {
      console.error("Failed to fetch types", error);
    }
  },

  // 2. Fetch All Requests (for Table)
  fetchAllOvertime: async () => {
    set({ isFetching: true });
    try {
      const response = await api.get("/overtime/all");
      set({ overtimeRequests: response.data });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch overtime records");
    } finally {
      set({ isFetching: false });
    }
  },

  // 3. Create Request
  createOvertimeRequest: async (formData) => {
    set({ isCreating: true });
    try {
      await api.post("/overtime/create", formData);
      toast.success("Overtime request submitted!");

      // Refresh list immediately
      get().fetchAllOvertime();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  // 4. Update Status (Approve/Reject)
  updateOvertimeStatus: async (id, status, rejectionReason = null) => {
    set({ isUpdating: true });
    try {
      await api.put(`/overtime/${id}/status`, { status, rejectionReason });
      toast.success(`Request ${status} successfully`);

      // Refresh list
      get().fetchAllOvertime();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      set({ isUpdating: false });
    }
  },

  // 5. Update Details (Edit)
  updateOvertimeRequest: async (id, formData) => {
    set({ isCreating: true }); // Reuse isCreating loader for modal
    try {
      await api.put(`/overtime/${id}/update`, formData);
      toast.success("Request updated!");

      // Refresh list
      get().fetchAllOvertime();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
      return false;
    } finally {
      set({ isCreating: false, selectedOvertime: null });
    }
  },

  // 6. Delete Request
  deleteOvertimeRequest: async (id) => {
    set({ isDeleting: true }); // Start loading
    try {
      await api.delete(`/overtime/${id}`);
      toast.success("Request deleted successfully");

      // Refresh list
      get().fetchAllOvertime();
      return true; // Return success
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
      return false;
    } finally {
      set({ isDeleting: false }); // Stop loading
    }
  },
}));
