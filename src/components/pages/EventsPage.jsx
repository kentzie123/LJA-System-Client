"use client";

import { useState, useEffect } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEventStore } from "@/stores/useEventStore";
import { useRouter } from "next/navigation";

// UI Components
import EventsCalendar from "../ui/EventPageUIs/EventsCalendar";
import AddEventModal from "../ui/EventPageUIs/AddEventModal";
import EditEventModal from "../ui/EventPageUIs/EditEventModal";
import DeleteEventModal from "../ui/EventPageUIs/DeleteEventModal";
import EventDetailsModal from "../ui/EventPageUIs/EventDetailsModal";

export default function EventsPage() {
  const { authUser } = useAuthStore();
  const { events, fetchEvents, isFetchingEvents } = useEventStore();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  
  // --- Modal Visibility States ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- Modal Data States ---
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState(null);
  const [eventToShow, setEventToShow] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  // --- UPDATED PERMISSIONS ---
  const canView = authUser?.role?.perm_event_view === true;
  const canManage = authUser?.role?.perm_event_manage === true;

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }

    // Security: If they don't have view permissions, kick them to dashboard
    if (!canView) {
      router.push("/");
      return;
    }

    const month = currentDate.getMonth() + 1; 
    const year = currentDate.getFullYear();
    fetchEvents(month, year);
  }, [authUser, router, currentDate, fetchEvents, canView]);

  // Helper to close modals and clear data safely after animation
  const handleClose = (setVisible, setData) => {
    setVisible(false);
    setTimeout(() => setData(null), 300);
  };

  if (isFetchingEvents && events.length === 0) {
    return (
      <div className="flex flex-col h-[60vh] w-full items-center justify-center gap-3">
        <Loader2 className="animate-spin size-6 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40 animate-pulse">
          Syncing Calendar...
        </span>
      </div>
    );
  }

  // Prevent flash of content for unauthorized users before useEffect redirect
  if (!canView) return null;

  return (
    <div className="space-y-4 animate-in fade-in duration-300 antialiased-text pb-8">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-base-300 pb-4">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight leading-none mb-1.5">
            Company Calendar
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
            Manage holidays, birthdays & office events
          </p>
        </div>
        
        {/* ADD BUTTON: Only visible for Managers */}
        {canManage && (
          <button
            onClick={() => {
              setSelectedDateForNewEvent(new Date());
              setIsAddOpen(true);
            }}
            className="btn btn-primary btn-sm h-9 sm:h-8 min-h-0 px-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest shadow-sm w-full sm:w-auto flex items-center gap-1.5 shrink-0"
          >
            <CalendarPlus size={14} /> Add Event
          </button>
        )}
      </div>

      <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden">
        <EventsCalendar
          currentDate={currentDate}
          onDateChange={setCurrentDate} 
          onDateClick={(date) => {
            // Only trigger Add Modal from grid if they can manage
            if (canManage) {
              setSelectedDateForNewEvent(date);
              setIsAddOpen(true);
            }
          }}
          onEditEvent={(event) => {
            setEventToShow(event);
            setIsDetailsOpen(true);
          }}
        />
      </div>

      {/* --- MODALS --- */}
      
      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => handleClose(setIsDetailsOpen, setEventToShow)}
        event={eventToShow}
        onEdit={(event) => {
          setIsDetailsOpen(false);
          setEventToEdit(event);
          setIsEditOpen(true);
        }}
        onDelete={(event) => {
            setIsDetailsOpen(false); 
            setEventToDelete(event); 
            setIsDeleteOpen(true);
        }}
      />

      <AddEventModal
        isOpen={isAddOpen}
        onClose={() => handleClose(setIsAddOpen, setSelectedDateForNewEvent)}
        selectedDate={selectedDateForNewEvent}
      />

      <EditEventModal
        isOpen={isEditOpen}
        onClose={() => handleClose(setIsEditOpen, setEventToEdit)}
        event={eventToEdit}
      />

      <DeleteEventModal
        isOpen={isDeleteOpen}
        onClose={() => handleClose(setIsDeleteOpen, setEventToDelete)}
        event={eventToDelete}
      />
      
    </div>
  );
}