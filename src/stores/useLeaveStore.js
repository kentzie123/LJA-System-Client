import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useLeaveStore = create((set, get) => ({
  leaves: [],
  leaveTypes: [],
  allBalances: [],
  isFetchingBalances: false,
  userBalances: [],
  leaveBalances: { vacationRemaining: 0, sickRemaining: 0 },
  stats: {
    pendingCount: 0,
    approvedCountMonth: 0,
    rejectedCount: 0,
    activeOnLeave: 0,
    totalApprovedCount: 0,
  },
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  selectedLeave: null,

  setSelectedLeave: (leave) => set({ selectedLeave: leave }),

  fetchAllLeaves: async (filters = {}) => {
    set({ isFetching: true });
    try {
      // Pass filters as query parameters to the backend
      const response = await api.get("/leave/all", { params: filters });
      set({ leaves: response.data });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch leave records");
    } finally {
      set({ isFetching: false });
    }
  },

  fetchLeaveBalances: async () => {
    try {
      const response = await api.get("/leave/balances");
      const data = response.data;

      set({ userBalances: data });

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

  fetchAllBalances: async () => {
    set({ isFetchingBalances: true });
    try {
      const response = await api.get("/leave/all-balances");
      set({ allBalances: response.data });
      console.log(response.data);
      
    } catch (error) {
      console.error("Failed to fetch all balances", error);
    } finally {
      set({ isFetchingBalances: false });
    }
  },

  fetchLeavesForExport: async (filters = {}) => {
    try {
      const response = await api.get("/leave/all", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch leaves for export:", error);
      return [];
    }
  },

 fetchLeaveStats: async (filters = {}) => {
    try {
      // Pass filters as query parameters to the backend
      const response = await api.get("/leave/stats", { params: filters });
      set({ stats: response.data });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  },

  fetchLeaveTypes: async () => {
    try {
      const response = await api.get("/leave/types");
      set({ leaveTypes: response.data });
    } catch (error) {
      console.error(error);
    }
  },

  createLeaveRequest: async (formData) => {
    set({ isCreating: true });
    try {
      await api.post("/leave/create", formData);
      toast.success("Leave request submitted!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  createAdminLeaveRequest: async (formData) => {
    set({ isCreating: true });
    try {
      await api.post("/leave/create-admin", formData);
      toast.success("Leave assigned successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign leave");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  updateLeaveStatus: async (id, status, rejectionReason = null) => {
    set({ isUpdating: true });
    try {
      await api.put(`/leave/${id}/status`, { status, rejectionReason });
      toast.success(`Leave ${status} successfully`);
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  },

  updateLeaveRequest: async (id, formData) => {
    set({ isCreating: true });
    try {
      await api.put(`/leave/${id}/update`, formData);
      toast.success("Request updated!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
      return false;
    } finally {
      set({ isCreating: false, selectedLeave: null });
    }
  },

  subscribeToLeaveUpdates: () => {
    const { socket, authUser } = useAuthStore.getState();
    if (!socket) return;

    socket.off("leave_update");

    socket.on("leave_update", (payload) => {
      const { type, data } = payload;
      const { leaves } = get();

      if (type === "NEW_REQUEST") {
        set({ leaves: [data, ...leaves] });
        if (data.user_id !== authUser?.id) {
          toast.success(`New Leave Request: ${data.fullname}`, { icon: "📝" });
        }
      } else if (
        type === "STATUS_UPDATE" ||
        type === "UPDATE" ||
        type === "ADMIN_ASSIGNED"
      ) {
        const exists = leaves.some((l) => l.id === data.id);

        if (exists) {
          set({
            leaves: leaves.map((item) => (item.id === data.id ? data : item)),
          });
        } else {
          set({ leaves: [data, ...leaves] });
        }

        if (data.user_id === authUser?.id) {
          get().fetchLeaveBalances();
          get().fetchLeaveStats();

          if (type === "STATUS_UPDATE") {
            const statusIcon = data.status === "Approved" ? "✅" : "❌";
            toast(`Your leave request was ${data.status}`, {
              icon: statusIcon,
            });
          }
          if (type === "ADMIN_ASSIGNED") {
            toast.success("Admin has assigned a leave for you.", {
              icon: "📅",
            });
          }
        } else {
          get().fetchLeaveStats();
        }

        if (type === "STATUS_UPDATE" || type === "ADMIN_ASSIGNED") {
          get().fetchAllBalances();
        }
      } else if (type === "DELETE") {
        set({ leaves: leaves.filter((item) => item.id !== Number(data.id)) });
        get().fetchLeaveStats();
        get().fetchAllBalances();
      }
    });
  },

  unsubscribeFromLeaveUpdates: () => {
    const { socket } = useAuthStore.getState();
    if (socket) socket.off("leave_update");
  },
}));
