import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore"; // Import for socket access

export const useLeaveStore = create((set, get) => ({
  leaves: [],
  leaveTypes: [],
  
  // NEW: Store raw array for dynamic lookup
  userBalances: [], 
  
  // Legacy support (keep this if you use it in other cards)
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

  fetchLeaveBalances: async () => {
    try {
      const response = await api.get("/leave/balances");
      const data = response.data;

      // 1. SAVE RAW DATA (For dynamic dropdowns)
      set({ userBalances: data });

      // 2. SAVE SPECIFIC (For legacy stats cards)
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

  fetchLeaveStats: async () => {
    try {
      const response = await api.get("/leave/stats");
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
      // Fallback refresh (Socket handles real-time)
      get().fetchAllLeaves();
      get().fetchLeaveBalances();
      get().fetchLeaveStats();
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
      get().fetchAllLeaves();
      get().fetchLeaveStats();
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
      get().fetchAllLeaves();
      get().fetchLeaveBalances();
      get().fetchLeaveStats();
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
      get().fetchAllLeaves();
      get().fetchLeaveBalances();
      get().fetchLeaveStats();
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
      get().fetchLeaveStats();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
      return false;
    } finally {
      set({ isCreating: false, selectedLeave: null });
    }
  },

  // =======================================================
  // REAL-TIME LEAVE SOCKET LISTENERS
  // =======================================================

  subscribeToLeaveUpdates: () => {
    const { socket, authUser } = useAuthStore.getState();
    if (!socket) return;

    socket.off("leave_update");

    socket.on("leave_update", (payload) => {
      const { type, data } = payload;
      const { leaves } = get();

      // 1. UPDATE LEAVE LIST
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

        // 2. REFRESH BALANCES & STATS IF IT'S FOR THIS USER
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
      } else if (type === "DELETE") {
        set({
          leaves: leaves.filter((item) => item.id !== Number(data.id)),
        });
        get().fetchLeaveStats();
      }
    });
  },

  unsubscribeFromLeaveUpdates: () => {
    const { socket } = useAuthStore.getState();
    if (socket) socket.off("leave_update");
  },
}));