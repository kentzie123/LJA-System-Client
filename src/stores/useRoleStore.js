import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useRoleStore = create((set) => ({
  roles: [],
  isLoadingRoles: false,
  isUpdating: false, // NEW: Tracks the "Save Changes" loading state

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

  // NEW FUNCTION: Handles saving permissions
  updateRole: async (roleId, permissions) => {
    set({ isUpdating: true });
    try {
      // 1. Send PUT request to backend
      const response = await api.put(`/roles/${roleId}`, permissions);

      // 2. Optimistically update local state (so UI reflects changes immediately)
      set((state) => ({
        roles: state.roles.map((role) =>
          role.id === Number(roleId) ? response.data.role : role
        ),
      }));

      return response.data;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update permissions");
      throw error; // Throw error so the component knows not to show "Success" message
    } finally {
      set({ isUpdating: false });
    }
  },
}));