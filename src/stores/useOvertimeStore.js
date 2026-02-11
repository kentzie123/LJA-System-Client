import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore"; // Import for socket access

export const useOvertimeStore = create((set, get) => ({
  // --- STATE ---
  overtimeRequests: [],
  overtimeTypes: [],
  stats: {
    pendingCount: 0,
    approvedHoursMonth: 0,
    rejectedCount: 0,
    activeRequesters: 0,
    totalApprovedCount: 0,
  },

  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  selectedOvertime: null,

  setSelectedOvertime: (request) => set({ selectedOvertime: request }),

  // 1. Fetch Types
  fetchOvertimeTypes: async () => {
    try {
      const response = await api.get("/overtime/types");
      set({ overtimeTypes: response.data });
    } catch (error) {
      console.error("Failed to fetch types", error);
    }
  },

  // 2. Fetch All Requests
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

  // 3. Fetch Statistics
  fetchOvertimeStats: async () => {
    try {
      const response = await api.get("/overtime/stats");
      set({ stats: response.data });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  },

  // 4. Create Request (Standard Employee)
  createOvertimeRequest: async (formData) => {
    set({ isCreating: true });
    try {
      await api.post("/overtime/create", formData);
      toast.success("Overtime request submitted!");
      // Fallback refresh (Socket handles real-time)
      get().fetchAllOvertime();
      get().fetchOvertimeStats();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  // 5. Create Admin Request (Auto-Approved)
  createAdminOvertimeRequest: async (formData) => {
    set({ isCreating: true });
    try {
      await api.post("/overtime/create-admin", formData);
      toast.success("Overtime assigned successfully!");
      get().fetchAllOvertime();
      get().fetchOvertimeStats();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign overtime");
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  // 6. Update Status (Approve/Reject)
  updateOvertimeStatus: async (id, status, rejectionReason = null) => {
    set({ isUpdating: true });
    try {
      await api.put(`/overtime/${id}/status`, { status, rejectionReason });
      toast.success(`Request ${status} successfully`);
      get().fetchAllOvertime();
      get().fetchOvertimeStats();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      set({ isUpdating: false });
    }
  },

  // 7. Update Details (Edit)
  updateOvertimeRequest: async (id, formData) => {
    set({ isCreating: true });
    try {
      await api.put(`/overtime/${id}/update`, formData);
      toast.success("Request updated!");
      get().fetchAllOvertime();
      get().fetchOvertimeStats();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
      return false;
    } finally {
      set({ isCreating: false, selectedOvertime: null });
    }
  },

  // 8. Delete Request
  deleteOvertimeRequest: async (id) => {
    set({ isDeleting: true });
    try {
      await api.delete(`/overtime/${id}`);
      toast.success("Request deleted successfully");
      get().fetchAllOvertime();
      get().fetchOvertimeStats();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
      return false;
    } finally {
      set({ isDeleting: false });
    }
  },

  // =======================================================
  // REAL-TIME OVERTIME SOCKET LISTENERS
  // =======================================================

  subscribeToOvertimeUpdates: () => {
    const { socket, authUser } = useAuthStore.getState();
    if (!socket) return;

    socket.off("overtime_update");

    socket.on("overtime_update", (payload) => {
      const { type, data } = payload;
      const { overtimeRequests } = get();

      // 1. ADD NEW RECORD
      if (type === "NEW_REQUEST") {
        set({ overtimeRequests: [data, ...overtimeRequests] });
        if (data.user_id !== authUser?.id) {
          toast.success(`New OT Request: ${data.fullname}`, { icon: "🕒" });
        }
      }
      // 2. UPDATE EXISTING RECORD
      else if (
        type === "STATUS_UPDATE" ||
        type === "UPDATE" ||
        type === "ADMIN_ASSIGNED"
      ) {
        const exists = overtimeRequests.some((r) => r.id === data.id);

        if (exists) {
          set({
            overtimeRequests: overtimeRequests.map((item) =>
              item.id === data.id ? data : item,
            ),
          });
        } else {
          // If admin assigned it to me, I might not have it in my list yet
          set({ overtimeRequests: [data, ...overtimeRequests] });
        }

        // Refresh Stats to keep numbers accurate
        get().fetchOvertimeStats();

        // Notifications for the Employee
        if (data.user_id === authUser?.id) {
          if (type === "STATUS_UPDATE") {
            const statusIcon = data.status === "Approved" ? "✅" : "❌";
            toast(`Your OT request was ${data.status}`, { icon: statusIcon });
          } else if (type === "ADMIN_ASSIGNED") {
            toast.success("Admin assigned OT hours to you.", { icon: "💼" });
          }
        }
      }
      // 3. DELETE RECORD
      else if (type === "DELETE") {
        set({
          overtimeRequests: overtimeRequests.filter(
            (item) => item.id !== Number(data.id),
          ),
        });
        get().fetchOvertimeStats();
      }
    });
  },

  unsubscribeFromOvertimeUpdates: () => {
    const { socket } = useAuthStore.getState();
    if (socket) socket.off("overtime_update");
  },
}));
