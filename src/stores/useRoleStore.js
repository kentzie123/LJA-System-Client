import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useRoleStore = create((set) => ({
  roles: [],
  isLoadingRoles: false,

  fetchRoles: async () => {
    set({ isLoadingRoles: true });
    try {
      const response = await api.get("/roles");
      set({ roles: response.data });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load roles");
    } finally {
      set({ isLoadingRoles: false });
    }
  },
}));
