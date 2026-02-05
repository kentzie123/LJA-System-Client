import { create } from "zustand";
import api from "@/lib/axios"; // Your axios instance
import toast from "react-hot-toast";

// Store
import { useAuthStore } from "./useAuthStore";

export const useUserStore = create((set, get) => ({
  users: [],

  // Loading States
  isFetchingUsers: false,
  isAddingUser: false,
  isUpdatingUser: false,
  isDeletingUser: false,
  isUploading: false,

  // 1. FETCH ALL
  fetchAllUsers: async () => {
    const { authUser } = useAuthStore.getState();
    if (!authUser.perm_employee_view) return;
    set({ isFetchingUsers: true });
    try {
      const response = await api.get("/users/fetch-all");
      set({ users: response.data });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isFetchingUsers: false });
    }
  },

  // 2. ADD USER
  addUser: async (userData) => {
    set({ isAddingUser: true });
    try {
      await api.post("/users/create-user", userData);
      toast.success("Employee created successfully!");
      await get().fetchAllUsers();
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create employee");
      return false;
    } finally {
      set({ isAddingUser: false });
    }
  },

  // 3. DELETE USER
  deleteUser: async (userId) => {
    set({ isDeletingUser: true });
    try {
      await api.delete(`/users/delete-user/${userId}`);
      toast.success("Employee deleted successfully");

      // Optimistic Update
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
      }));
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to delete employee");
      return false;
    } finally {
      set({ isDeletingUser: false });
    }
  },

  // 4. ADMIN UPDATE (Roles, Salary, etc.)
  updateUser: async (userId, userData) => {
    set({ isUpdatingUser: true });
    try {
      const res = await api.put(`/users/update-user/${userId}`, userData);
      toast.success("Employee updated successfully!");

      // Update local state immediately
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? res.data.user : u)),
      }));
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update employee");
      return false;
    } finally {
      set({ isUpdatingUser: false });
    }
  },

  // 5. NEW: SAFE PROFILE UPDATE (Name, Email, Position)
  updateUserProfile: async (userData) => {
    set({ isUpdatingUser: true });
    try {
      const res = await api.put(`/users/update-profile`, userData);
      toast.success("Profile updated successfully!");

      // Update local state so the UI reflects changes instantly
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, ...res.data.user } : u,
        ),
      }));
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update profile");
      return false;
    } finally {
      set({ isUpdatingUser: false });
    }
  },

  // 6. NEW: UPLOAD PROFILE PICTURE
  uploadProfilePicture: async (base64Image) => {
    set({ isUploading: true });
    try {
      const res = await api.put(`/users/upload-picture`, {
        image: base64Image,
      });
      toast.success("Profile picture updated!");

      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to upload image");
      return false;
    } finally {
      set({ isUploading: false });
    }
  },
}));
