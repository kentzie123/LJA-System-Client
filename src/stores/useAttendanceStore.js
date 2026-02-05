import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useAttendanceStore = create((set, get) => ({
  attendances: [],

  // 1. NEW STATE: Track the user's current status (idle, clocked_in, completed)
  todayStatus: { status: "idle" },

  isFetchingAttendances: false,
  isAddingAttendance: false,
  isEditingAttendance: false,
  isDeletingAttendance: false,
  isClocking: false,

  // 2. NEW FUNCTION: Check status from backend
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
      console.log(response.data);
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
          record.id === id ? response.data.data : record,
        ),
      }));

      toast.success("Record updated successfully");
      return true;
    } catch (error) {
      console.error(error);
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
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete record");
    } finally {
      set({ isDeletingAttendance: false });
    }
  },

  clockIn: async (photo, location) => {
    set({ isClocking: true });
    console.log("true");

    try {
      await api.post("/attendances/clock-in", { photo, location });
      toast.success("Clock In Successful!");

      // 3. REFRESH STATUS & LIST AFTER SUCCESS
      await get().checkTodayStatus();
      await get().fetchAllAttendances();

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Clock In Failed");
      return false;
    } finally {
      set({ isClocking: false });
      console.log("false");
    }
  },

  clockOut: async (photo, location) => {
    set({ isClocking: true });
    try {
      await api.post("/attendances/clock-out", { photo, location }); // Send location
      toast.success("Clock Out Successful!");

      // 4. REFRESH STATUS & LIST AFTER SUCCESS
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
      const response = await api.put(`/attendances/verify/${id}`, {
        type,
        status,
      });

      // --- BUG FIX IS HERE ---
      set((state) => ({
        attendances: state.attendances.map((record) =>
          record.id === id
            ? // Spread the OLD record first, then overwrite with NEW data.
              // This preserves 'fullname', 'email', etc., which the API doesn't return on update.
              { ...record, ...response.data.data }
            : record,
        ),
      }));

      toast.success(`Verification ${status} successfully`);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      set({ isEditingAttendance: false });
    }
  },

  verifyWorkday: async (id, status) => {
    set({ isEditingAttendance: true });
    try {
      // Calls the new unified endpoint
      const response = await api.put(`/attendances/verify-day/${id}`, {
        status,
      });

      set((state) => ({
        attendances: state.attendances.map((record) =>
          record.id === id
            ? { ...record, ...response.data.data } // Merge old user data with new status
            : record,
        ),
      }));

      toast.success(`Workday ${status} successfully`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Workday verification failed",
      );
      return false;
    } finally {
      set({ isEditingAttendance: false });
    }
  },
}));
