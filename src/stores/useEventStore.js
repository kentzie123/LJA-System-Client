import { create } from "zustand";
import api from "@/lib/axios"; // Use the same lib as your LeaveStore
import { toast } from "react-hot-toast";

export const useEventStore = create((set, get) => ({
  events: [],
  isFetchingEvents: false,
  isOperating: false,

  // 1. FETCH EVENTS
  fetchEvents: async (month, year) => {
    set({ isFetchingEvents: true });
    try {
      // Use the pre-configured 'api' instance
      const response = await api.get(`/events`, { 
        params: { month, year } 
      });
      set({ events: response.data });
      
    } catch (error) {
      console.error("Store Fetch Error:", error);
      toast.error("Failed to load calendar events");
    } finally {
      set({ isFetchingEvents: false });
    }
  },

  // 2. CREATE EVENT
  addEvent: async (eventData) => {
    set({ isOperating: true });
    try {
      const response = await api.post("/events", eventData);
      
      // Note: Backend returns { event: { ... } }
      const newEvent = response.data.event;
      
      set((state) => ({
        events: [...state.events, newEvent]
      }));
      
      toast.success("Event added to calendar");
      return true;
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to create event";
      toast.error(msg);
      return false;
    } finally {
      set({ isOperating: false });
    }
  },

  // 3. UPDATE EVENT
  updateEvent: async (id, eventData) => {
    set({ isOperating: true });
    try {
      const response = await api.put(`/events/${id}`, eventData);
      const updatedEvent = response.data.event;

      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updatedEvent : e))
      }));
      
      toast.success("Event updated successfully");
      return true;
    } catch (error) {
      toast.error("Failed to update event");
      return false;
    } finally {
      set({ isOperating: false });
    }
  },

  // 4. DELETE EVENT
  deleteEvent: async (id) => {
    set({ isOperating: true });
    try {
      await api.delete(`/events/${id}`);
      
      set((state) => ({
        events: state.events.filter((e) => e.id !== id)
      }));
      
      toast.success("Event removed");
      return true;
    } catch (error) {
      toast.error("Failed to delete event");
      return false;
    } finally {
      set({ isOperating: false });
    }
  },
}));