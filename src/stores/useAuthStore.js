import { create } from "zustand";
import api from "@/lib/axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  isCheckingAuth: true,
  isLoggingIn: false,

  setAuthUser: (data) => {
    set({ authUser: data });
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    
    // Prevent duplicate connection or connecting without user
    if (!authUser || (socket && socket.connected)) return;

    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser.id,
        // --- CRITICAL CHANGE: Send Role ID for Room Logic ---
        roleId: authUser.role_id, 
      },
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Global Socket connected:", newSocket.id);
      set({ socket: newSocket });
    });

    newSocket.on("disconnect", () => {
      console.log("Global Socket disconnected");
      // We don't nullify socket immediately to allow auto-reconnect attempts
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      set({ socket: null });
    }
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const res = await api.get("/auth/check-auth");
      set({ authUser: res.data });
      
      // Connect socket immediately after verifying auth
      get().connectSocket(); 
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    try {
      set({ isLoggingIn: true });
      const res = await api.post("/auth/login", data);
      
      set({ authUser: res.data });
      
      // Connect socket immediately after login
      get().connectSocket();

      toast.success("Logged in successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      get().disconnectSocket(); // Clean up socket
      set({ authUser: null });
      toast.success("Logout successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  },
}));