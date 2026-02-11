import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useAttendanceStore = create((set, get) => ({
  attendances: [],
  todayStatus: { status: "idle" },
  isFetchingAttendances: false,
  isAddingAttendance: false,
  isEditingAttendance: false,
  isDeletingAttendance: false,
  isClocking: false,

  checkTodayStatus: async () => {
    try {
      const response = await api.get("/attendances/status/current");
      set({ todayStatus: response.data });
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  },

  fetchAllAttendances: async () => {
    set({ isFetchingAttendances: true });
    try {
      const response = await api.get("/attendances/");
      set({ attendances: response.data });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isFetchingAttendances: false });
    }
  },

  createManualEntry: async (formData) => {
    set({ isAddingAttendance: true });
    try {
      await api.post("/attendances/manual/", formData);
      toast.success("Entry created successfully");
      await get().fetchAllAttendances(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create entry");
    } finally {
      set({ isAddingAttendance: false });
    }
  },

  updateAttendance: async (id, formData) => {
    set({ isEditingAttendance: true });
    try {
      const response = await api.put(`/attendances/${id}`, formData);
      set((state) => ({
        attendances: state.attendances.map((record) =>
          record.id === id ? { ...record, ...response.data.data } : record,
        ),
      }));
      toast.success("Record updated successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update record");
      return false;
    } finally {
      set({ isEditingAttendance: false });
    }
  },

  deleteAttendance: async (id) => {
    set({ isDeletingAttendance: true });
    try {
      await api.delete(`/attendances/${id}`);
      set((state) => ({
        attendances: state.attendances.filter((record) => record.id !== id),
      }));
      toast.success("Record deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete record");
    } finally {
      set({ isDeletingAttendance: false });
    }
  },

  clockIn: async (photo, location) => {
    set({ isClocking: true });
    try {
      await api.post("/attendances/clock-in", { photo, location });
      toast.success("Clock In Successful!");
      await get().checkTodayStatus();
      await get().fetchAllAttendances();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Clock In Failed");
      return false;
    } finally {
      set({ isClocking: false });
    }
  },

  clockOut: async (photo, location) => {
    set({ isClocking: true });
    try {
      await api.post("/attendances/clock-out", { photo, location });
      toast.success("Clock Out Successful!");
      await get().checkTodayStatus();
      await get().fetchAllAttendances();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Clock Out Failed");
      return false;
    } finally {
      set({ isClocking: false });
    }
  },

  verifyAttendance: async (id, type, status) => {
    set({ isEditingAttendance: true });
    try {
      const response = await api.put(`/attendances/verify/${id}`, { type, status });
      set((state) => ({
        attendances: state.attendances.map((record) =>
          record.id === id ? { ...record, ...response.data.data } : record,
        ),
      }));
      toast.success(`Verification ${status} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      set({ isEditingAttendance: false });
    }
  },

  verifyWorkday: async (id, status) => {
    set({ isEditingAttendance: true });
    try {
      const response = await api.put(`/attendances/verify-day/${id}`, { status });
      set((state) => ({
        attendances: state.attendances.map((record) =>
          record.id === id ? { ...record, ...response.data.data } : record,
        ),
      }));
      toast.success(`Workday ${status} successfully`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Workday verification failed");
      return false;
    } finally {
      set({ isEditingAttendance: false });
    }
  },

  // =======================================================
  // REAL-TIME SOCKET LISTENERS
  // =======================================================

  subscribeToAttendanceUpdates: () => {
    const { socket, authUser } = useAuthStore.getState();
    if (!socket) return;

    socket.off("attendance_update");

    socket.on("attendance_update", (payload) => {
      const { type, data } = payload;
      const { attendances } = get();

      // 1. UPDATE ATTENDANCE LIST
      if (type === "TIME_IN" || type === "MANUAL_ENTRY") {
        set({ attendances: [data, ...attendances] });
        if (data.user_id !== authUser?.id) {
           toast.success(`Clock In: ${data.fullname || "User"}`);
        }
      } 
      else if (type === "TIME_OUT" || type === "UPDATE") {
        set({
          attendances: attendances.map((item) =>
            item.id === data.id ? { ...item, ...data } : item
          ),
        });

        // 2. REFRESH BUTTON STATUS IF RECORD BELONGS TO CURRENT USER
        // This ensures the employee's Clock In/Out buttons update if an admin modifies their data
        if (data.user_id === authUser?.id) {
            get().checkTodayStatus();
            
            // Notify employee specifically about verification
            if (data.status_in === "Verified" || data.status_out === "Verified") {
                toast.success("Your attendance has been verified!", { icon: '✅' });
            } else if (data.status_in === "Rejected" || data.status_out === "Rejected") {
                toast.error("Your attendance was rejected.", { icon: '❌' });
            }
        }
        
        // Notify Admins about other people clocking out
        if (type === "TIME_OUT" && data.user_id !== authUser?.id) {
            toast(`Clock Out: ${data.fullname}`, { icon: "👋" });
        }
      } 
      else if (type === "DELETE") {
        set({
          attendances: attendances.filter((item) => item.id !== Number(data.id)),
        });
      }
    });
  },

  unsubscribeFromAttendanceUpdates: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("attendance_update");
    }
  },
}));