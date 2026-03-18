import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useOvertimeStore = create((set, get) => ({
  // ==============================
  // STATE
  // ==============================
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

  // ==============================
  // FETCH TYPES
  // ==============================
  fetchOvertimeTypes: async () => {
    try {
      const res = await api.get("/overtime/types");
      set({ overtimeTypes: res.data });
    } catch (error) {
      console.error("Failed to fetch OT types", error);
    }
  },

  // ==============================
  // FETCH ALL OVERTIME
  // ==============================
  fetchAllOvertime: async (filters = {}) => {
    set({ isFetching: true });

    try {
      const res = await api.get("/overtime/all", { params: filters });
      set({ overtimeRequests: res.data });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch overtime records");
    } finally {
      set({ isFetching: false });
    }
  },

  // ==============================
  // FETCH FOR EXPORT
  // ==============================
  fetchOvertimeForExport: async (filters = {}) => {
    try {
      const res = await api.get("/overtime/all", { params: filters });
      return res.data;
    } catch (error) {
      console.error("Export fetch failed", error);
      return [];
    }
  },

  // ==============================
  // FETCH STATS
  // ==============================
  fetchOvertimeStats: async (filters = {}) => {
    try {
      const res = await api.get("/overtime/stats", { params: filters });
      set({ stats: res.data });
    } catch (error) {
      console.error("Failed to fetch overtime stats", error);
    }
  },

  // ==============================
  // CREATE REQUEST (EMPLOYEE)
  // ==============================
  createOvertimeRequest: async (formData) => {
    set({ isCreating: true });

    try {
      await api.post("/overtime/create", formData);

      toast.success("Overtime request submitted!");

      // fallback refresh
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

  // ==============================
  // CREATE ADMIN REQUEST
  // ==============================
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

  // ==============================
  // UPDATE STATUS
  // ==============================
  updateOvertimeStatus: async (id, status, rejectionReason = null) => {
    set({ isUpdating: true });

    try {
      await api.put(`/overtime/${id}/status`, {
        status,
        rejectionReason,
      });

      toast.success(`Request ${status}`);

      get().fetchAllOvertime();
      get().fetchOvertimeStats();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      set({ isUpdating: false });
    }
  },

  // ==============================
  // UPDATE REQUEST
  // ==============================
  updateOvertimeRequest: async (id, formData) => {
    set({ isUpdating: true });

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
      set({
        isUpdating: false,
        selectedOvertime: null,
      });
    }
  },

  // ==============================
  // DELETE REQUEST
  // ==============================
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

  // ===================================================
  // SOCKET REAL-TIME LISTENERS
  // ===================================================

  subscribeToOvertimeUpdates: () => {
    const { socket, authUser } = useAuthStore.getState();
    if (!socket) return;

    socket.off("overtime_update");

    socket.on("overtime_update", (payload) => {
      const { type, data } = payload;

      set((state) => {
        const requests = state.overtimeRequests;

        // NEW REQUEST
        if (type === "NEW_REQUEST") {
          if (!requests.some((r) => r.id === data.id)) {
            if (data.user_id !== authUser?.id) {
              toast.success(`New OT Request: ${data.fullname}`, { icon: "🕒" });
            }
            return { overtimeRequests: [data, ...requests] };
          }
        }

        // UPDATE / STATUS / ADMIN ASSIGN
        if (
          type === "STATUS_UPDATE" ||
          type === "UPDATE" ||
          type === "ADMIN_ASSIGNED"
        ) {
          const exists = requests.some((r) => r.id === data.id);

          let updatedList;

          if (exists) {
            updatedList = requests.map((r) =>
              r.id === data.id ? data : r
            );
          } else {
            updatedList = [data, ...requests];
          }

          if (data.user_id === authUser?.id) {
            if (type === "STATUS_UPDATE") {
              const icon = data.status === "Approved" ? "✅" : "❌";
              toast(`Your OT request was ${data.status}`, { icon });
            }

            if (type === "ADMIN_ASSIGNED") {
              toast.success("Admin assigned OT hours to you.", {
                icon: "💼",
              });
            }
          }

          get().fetchOvertimeStats();

          return { overtimeRequests: updatedList };
        }

        // DELETE
        if (type === "DELETE") {
          get().fetchOvertimeStats();

          return {
            overtimeRequests: requests.filter(
              (r) => r.id !== Number(data.id)
            ),
          };
        }

        return {};
      });
    });
  },

  unsubscribeFromOvertimeUpdates: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.off("overtime_update");
  },
}));