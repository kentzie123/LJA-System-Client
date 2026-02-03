import { create } from "zustand";

// Axios
import api from "@/lib/axios";

// Socket.io
import { io } from "socket.io-client";

// Toast
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  isCheckingAuth: true,
  isLoggingIn: false,

  setAuthUser: (data) => {
    set({ authUser: data });
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      query: {
        userId: authUser.id,
      },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.connected);
      set({ socket });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const authUser = await api.get("/auth/check-auth");
      console.log(`Check auth: ${authUser.data}`);

      set({ authUser: authUser.data });
    } catch (error) {
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    try {
      set({ isLoggingIn: true });
      const authUser = await api.post("/auth/login", data);
      
      set({ authUser: authUser.data });
      get().connectSocket();

      toast.success("Logged in successfully");

      return true;
    } catch (err) {
      toast.error(err.response.data.error);
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logout successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  },
}));
