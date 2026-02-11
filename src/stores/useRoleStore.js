import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useRoleStore = create((set, get) => ({
  roles: [],
  isLoadingRoles: false,
  isUpdating: false, 
  isCreating: false, 
  isDeleting: false,

  // 1. Fetch Roles (Updated for Super Admin support)
  fetchRoles: async (isSuperAdmin = false) => {
    set({ isLoadingRoles: true });
    try {
      // Determine endpoint based on privilege
      const endpoint = isSuperAdmin ? "/roles/system" : "/roles";
      
      const response = await api.get(endpoint);
      set({ roles: response.data });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load roles");
    } finally {
      set({ isLoadingRoles: false });
    }
  },

  // 2. Create Role
  createRole: async (roleName) => {
    set({ isCreating: true });
    try {
      const response = await api.post("/roles", { role_name: roleName });

      // Update local state by appending the new role
      set((state) => ({
        roles: [...state.roles, response.data],
      }));

      toast.success("Role created successfully!");
      return response.data; // Return data so component can select it
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to create role";
      toast.error(msg);
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  // 3. Update Role Permissions
  updateRole: async (roleId, permissions) => {
    set({ isUpdating: true });
    try {
      const response = await api.put(`/roles/${roleId}`, permissions);

      // Update local state
      set((state) => ({
        roles: state.roles.map((role) =>
          role.id === Number(roleId) ? response.data : role,
        ),
      }));

      return response.data;
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update permissions",
      );
      throw error;
    } finally {
      set({ isUpdating: false });
    }
  },

  // 4. Delete Role
  deleteRole: async (roleId) => {
    set({ isDeleting: true });
    try {
      await api.delete(`/roles/${roleId}`);

      set((state) => ({
        roles: state.roles.filter((role) => role.id !== roleId),
      }));

      toast.success("Role deleted successfully!");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to delete role";
      toast.error(msg);
      throw error;
    } finally {
      set({ isDeleting: false });
    }
  },
}));