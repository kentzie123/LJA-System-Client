import { create } from "zustand";
import api from "@/lib/axios";

export const useAttendanceStore = create((set, get) => ({
  attendances: [],
  isFetchingAttendances: false,

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
}));
