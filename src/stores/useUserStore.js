import { create } from "zustand";
import api from "@/lib/axios"; 
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
  isFetchingSingleUser: false,

  // 1. FETCH ALL
  fetchAllUsers: async () => {
    const { authUser } = useAuthStore.getState();
    // Safety check for permissions
    if (!authUser?.role?.perm_employee_view) return;
    
    set({ isFetchingUsers: true });
    try {
      const response = await api.get("/users/fetch-all");
      
      set({ users: response.data });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to fetch users");
    } finally {
      set({ isFetchingUsers: false });
    }
  },

  // 2. ADD USER
  addUser: async (userData) => {
    set({ isAddingUser: true });
    try {
      // Backend now handles swapping payrate/daily_rate automatically
      await api.post("/users/create-user", userData);
      toast.success("Employee created successfully!");
      
      // Refresh list to get the new user with their generated ID
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

      // Optimistic Update: Remove from local array
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

  // 4. ADMIN UPDATE (Roles, Salary Fix, etc.)
  updateUser: async (userId, userData) => {
    set({ isUpdatingUser: true });
    try {
      const res = await api.put(`/users/update-user/${userId}`, userData);
      const updatedUser = res.data.user;

      toast.success("Employee updated successfully!");

      // Update local state immediately with the corrected data from backend
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? updatedUser : u)),
      }));

      // If the admin is editing their own account, update AuthStore too
      const { setAuthUser, authUser } = useAuthStore.getState();
      if (authUser?.id === userId) {
        setAuthUser({ ...authUser, ...updatedUser });
      }

      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update employee");
      return false;
    } finally {
      set({ isUpdatingUser: false });
    }
  },

  // 5. PROFILE UPDATE (Self-Update)
  updateUserProfile: async (userData) => {
    set({ isUpdatingUser: true });
    try {
      const res = await api.put(`/users/update-profile`, userData);
      const updatedUser = res.data.user;

      toast.success("Profile updated successfully!");

      // Sync across all lists
      set((state) => ({
        users: state.users.map((u) =>
          u.id === updatedUser.id ? { ...u, ...updatedUser } : u,
        ),
      }));

      // Update the main session user
      const { setAuthUser, authUser } = useAuthStore.getState();
      if (authUser?.id === updatedUser.id) {
        setAuthUser({ ...authUser, ...updatedUser });
      }

      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update profile");
      return false;
    } finally {
      set({ isUpdatingUser: false });
    }
  },

  // 6. UPLOAD PROFILE PICTURE
  uploadProfilePicture: async (base64Image) => {
    set({ isUploading: true });
    try {
      const res = await api.put(`/users/upload-picture`, {
        image: base64Image,
      });
      const updatedUser = res.data.user; // res contains {id, profile_picture}

      toast.success("Profile picture updated!");

      // Update AuthStore immediately so the navbar/sidebar image changes
      const { setAuthUser, authUser } = useAuthStore.getState();
      if (authUser) {
        setAuthUser({ ...authUser, profile_picture: updatedUser.profile_picture });
      }

      // Also update the user in the main list
      set((state) => ({
        users: state.users.map((u) =>
          u.id === updatedUser.id ? { ...u, profile_picture: updatedUser.profile_picture } : u
        ),
      }));

      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to upload image");
      return false;
    } finally {
      set({ isUploading: false });
    }
  },

  // 7. FETCH SINGLE USER BY EMPLOYEE_ID
  fetchUserByEmployeeId: async (employeeId) => {
    set({ isFetchingSingleUser: true });
    try {
      const response = await api.get(`/users/fetch-user/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(error);
      // We don't always want a toast here if the component handles the "Not Found" UI
      return null;
    } finally {
      set({ isFetchingSingleUser: false });
    }
  },
}));