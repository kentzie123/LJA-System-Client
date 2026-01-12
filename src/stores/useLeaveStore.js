import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useLeaveStore = create((set, get) => ({
  leaves: [],
  leaveTypes: [],
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  selectedLeave: null,

  setSelectedLeave: (leave) => set({ selectedLeave: leave }),

  // Fetch all leaves (for the list)
  fetchAllLeaves: async () => {
    set({ isFetching: true });
    try {
      const response = await api.get("/leave/all");
      set({ leaves: response.data });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch leave records");
    } finally {
      set({ isFetching: false });
    }
  },

  // Fetch types (for the dropdown)
  fetchLeaveTypes: async () => {
    try {
      const response = await api.get("/leave/types");
      set({ leaveTypes: response.data });
    } catch (error) {
      console.error(error);
    }
  },

  // Submit new request
  createLeaveRequest: async (formData) => {
    set({ isCreating: true });
    try {
      await api.post("/leave/create", formData);
      toast.success("Leave request submitted!");
      get().fetchAllLeaves(); // Refresh list
      return true; // Success signal
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  updateLeaveStatus: async (id, status) => {
    set({ isUpdating: true });
    try {
      await api.put(`/leave/${id}/status`, { status });
      toast.success(`Leave ${status} successfully`);
      get().fetchAllLeaves(); // Refresh the list to show new status
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      set({ isUpdating: false });
    }
  },

  deleteLeaveRequest: async (id) => {
    try {
      await api.delete(`/leave/${id}`);
      toast.success("Request deleted");
      get().fetchAllLeaves(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  },

  updateLeaveRequest: async (id, formData) => {
    set({ isCreating: true });
    try {
      await api.put(`/leave/${id}/update`, formData);
      toast.success("Request updated!");
      get().fetchAllLeaves();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
      return false;
    } finally {
      set({ isCreating: false, selectedLeave: null }); // Reset edit state
    }
  },

  
}));
