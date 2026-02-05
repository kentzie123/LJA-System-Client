import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useLeaveStore = create((set, get) => ({
  leaves: [],
  leaveTypes: [],
  
  // 1. Initialize balances & stats state
  leaveBalances: { vacationRemaining: 0, sickRemaining: 0 },
  stats: {
    pendingCount: 0,
    approvedCountMonth: 0,
    rejectedCount: 0,
    activeOnLeave: 0, // Admin only
    totalApprovedCount: 0 // Employee only
  },

  isFetching: false,
  isCreating: false,
  isUpdating: false,
  selectedLeave: null,

  setSelectedLeave: (leave) => set({ selectedLeave: leave }),

  // Fetch all leaves (Admins get all, Employees get theirs)
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

  // 2. Fetch Balances Action
  fetchLeaveBalances: async () => {
    try {
      const response = await api.get("/leave/balances");
      const data = response.data;

      const vacation = data?.find((b) => b.leave_name === "Vacation Leave");
      const sick = data?.find((b) => b.leave_name === "Sick Leave");

      set({
        leaveBalances: {
          vacationRemaining: vacation
            ? vacation.allocated_days - vacation.used_days
            : 0,
          sickRemaining: sick ? sick.allocated_days - sick.used_days : 0,
        },
      });
    } catch (error) {
      console.error("Failed to fetch balances", error);
    }
  },

  // 3. Fetch Statistics (NEW)
  fetchLeaveStats: async () => {
    try {
      const response = await api.get("/leave/stats");
      set({ stats: response.data });
    } catch (error) {
      console.error("Failed to fetch stats", error);
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

  // Submit new request (Standard Employee)
  createLeaveRequest: async (formData) => {
    set({ isCreating: true });
    try {
      await api.post("/leave/create", formData);
      toast.success("Leave request submitted!");
      
      // Refresh Data
      get().fetchAllLeaves();
      get().fetchLeaveBalances(); 
      get().fetchLeaveStats(); // Refresh stats

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  // Submit Admin Request (Auto-Approved)
  createAdminLeaveRequest: async (formData) => {
    set({ isCreating: true });
    try {
      await api.post("/leave/create-admin", formData);
      toast.success("Leave assigned successfully!");
      
      // Refresh Data
      get().fetchAllLeaves(); 
      get().fetchLeaveStats(); // Refresh stats

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign leave");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  // Update Status (Approve/Reject)
  updateLeaveStatus: async (id, status, rejectionReason = null) => {
    set({ isUpdating: true });
    try {
      await api.put(`/leave/${id}/status`, { status, rejectionReason });
      toast.success(`Leave ${status} successfully`);

      // REFRESH DATA 
      get().fetchAllLeaves();
      get().fetchLeaveBalances();
      get().fetchLeaveStats(); // Refresh stats
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      set({ isUpdating: false });
    }
  },

  // Delete Request
  deleteLeaveRequest: async (id) => {
    try {
      await api.delete(`/leave/${id}`);
      toast.success("Request deleted");
      
      // Refresh Data
      get().fetchAllLeaves();
      get().fetchLeaveBalances(); 
      get().fetchLeaveStats(); // Refresh stats
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  },

  // Update Request Details (Edit)
  updateLeaveRequest: async (id, formData) => {
    set({ isCreating: true }); 
    try {
      await api.put(`/leave/${id}/update`, formData);
      toast.success("Request updated!");
      
      get().fetchAllLeaves();
      // Stats might change if dates change, so refresh just in case
      get().fetchLeaveStats(); 
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
      return false;
    } finally {
      set({ isCreating: false, selectedLeave: null });
    }
  },
}));