import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  users: [],
  isFetchingUsers: false,
  isAddingUser: false,
  isUpdatingUser: false,

  fetchAllUsers: async () => {
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

  addUser: async (userData) => {
    set({ isAddingUser: true });
    try {
      await api.post("/users/create-user", userData);
      toast.success("Employee created successfully!");

      // Refresh the list immediately
      await get().fetchAllUsers();
      return true; // Return true to signal success to the modal
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create employee");
      return false;
    } finally {
      set({ isAddingUser: false });
    }
  },

  deleteUser: async (userId) => {
    set({ isDeletingUser: true });
    try {
      await api.delete(`/users/delete-user/${userId}`);
      toast.success("Employee deleted successfully");

      // Optimistic Update: Remove the user from the local state instantly
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
      }));

      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete employee");
      return false;
    } finally {
      set({ isDeletingUser: false });
    }
  },

  updateUser: async (userId, userData) => {
    set({ isUpdatingUser: true });
    try {
      await api.put(`/users/update-user/${userId}`, userData);
      toast.success("Employee updated successfully!");

      // Refresh list
      await get().fetchAllUsers();
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update employee");
      return false;
    } finally {
      set({ isUpdatingUser: false });
    }
  },
}));
