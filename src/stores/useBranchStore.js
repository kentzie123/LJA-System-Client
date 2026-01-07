import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const useBranchStore = create((set) => ({
  branches: [],
  isLoadingBranches: false,

  fetchBranches: async () => {
    set({ isLoadingBranches: true });
    try {
      const response = await api.get("/branches");
      set({ branches: response.data });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load branches");
    } finally {
      set({ isLoadingBranches: false });
    }
  },
}));
