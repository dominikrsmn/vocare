"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAppointments, getPastAppointments } from "@/lib/supabase/actions/appointments";
import { Appointment } from "@/components/appointment-card";

interface AppointmentFilters {
  categories: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  searchTerm: string;
}

interface AppointmentsContextType {
  appointments: Appointment[];
  filteredAppointments: Appointment[];
  isLoading: boolean;
  loadingPast: boolean;
  filters: AppointmentFilters;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  loadPastAppointments: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updatedAppointment: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
  setFilters: (filters: Partial<AppointmentFilters>) => void;
  clearFilters: () => void;
  getAvailableCategories: () => { id: string; label: string; icon: string; color: string }[];
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

interface AppointmentsProviderProps {
  children: ReactNode;
}

const defaultFilters: AppointmentFilters = {
  categories: [],
  dateRange: { start: null, end: null },
  searchTerm: ""
};

export function AppointmentsProvider({ children }: AppointmentsProviderProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPast, setLoadingPast] = useState(false);
  const [filters, setFiltersState] = useState<AppointmentFilters>(defaultFilters);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 5, 10)); // Statisches Datum für SSR

  // Hydration-Problem vermeiden: Setze heutiges Datum erst nach Client-Render
  useEffect(() => {
    setSelectedDate(new Date()); // Jetzt auf heutiges Datum setzen
  }, []);

  // Initiales Laden der Termine
  useEffect(() => {
    loadInitialAppointments();
  }, []);

  const loadInitialAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await getAppointments();
      setAppointments(data || []);
    } catch (error) {
      console.error("Fehler beim Laden der Termine:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Vergangene Termine laden
  const loadPastAppointments = async () => {
    if (appointments.length === 0 || loadingPast) return;
    
    setLoadingPast(true);
    try {
      const earliestDate = appointments
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0]?.start;
      
      if (earliestDate) {
        const pastAppointments = await getPastAppointments(earliestDate, 5);
        if (pastAppointments && pastAppointments.length > 0) {
          setAppointments(prev => [...pastAppointments.reverse(), ...prev]);
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden vergangener Termine:", error);
    } finally {
      setLoadingPast(false);
    }
  };

  // Termine neu laden
  const refreshAppointments = async () => {
    await loadInitialAppointments();
  };

  // Termin hinzufügen
  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    ));
  };

  // Termin aktualisieren
  const updateAppointment = (id: string, updatedAppointment: Partial<Appointment>) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === id 
        ? { ...appointment, ...updatedAppointment }
        : appointment
    ));
  };

  // Termin entfernen
  const removeAppointment = (id: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  };

  // Filter Termine basierend auf aktuellen Filtern
  const filteredAppointments = appointments.filter(appointment => {
    // Kategorie Filter
    if (filters.categories.length > 0 && !filters.categories.includes(appointment.category.id)) {
      return false;
    }

    // Datum Filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const appointmentDate = new Date(appointment.start);
      
      // Start-Datum: ab 00:00:00 des gewählten Tages
      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        if (appointmentDate < startDate) {
          return false;
        }
      }
      
      // End-Datum: bis 23:59:59 des gewählten Tages (inklusiv)
      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (appointmentDate > endDate) {
          return false;
        }
      }
    }

    // Suchterm Filter (Titel, Notizen, Ort, Patient)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const titleMatch = appointment.title.toLowerCase().includes(searchLower);
      const notesMatch = appointment.notes?.toLowerCase().includes(searchLower) || false;
      const locationMatch = appointment.location.toLowerCase().includes(searchLower);
      const patientFirstnameMatch = appointment.patient.firstname.toLowerCase().includes(searchLower);
      const patientLastnameMatch = appointment.patient.lastname.toLowerCase().includes(searchLower);
      const patientFullnameMatch = `${appointment.patient.firstname} ${appointment.patient.lastname}`.toLowerCase().includes(searchLower);
      
      if (!titleMatch && !notesMatch && !locationMatch && !patientFirstnameMatch && !patientLastnameMatch && !patientFullnameMatch) {
        return false;
      }
    }

    return true;
  });

  // Filter setzen
  const setFilters = (newFilters: Partial<AppointmentFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // Filter zurücksetzen
  const clearFilters = () => {
    setFiltersState(defaultFilters);
  };

  // Verfügbare Kategorien ermitteln
  const getAvailableCategories = () => {
    const categories = appointments.map(app => app.category);
    const uniqueCategories = categories.filter((category, index, self) => 
      index === self.findIndex(c => c.id === category.id)
    );
    return uniqueCategories.map(cat => ({
      id: cat.id,
      label: cat.label,
      icon: cat.icon,
      color: cat.color
    }));
  };

  const value = {
    appointments,
    filteredAppointments,
    isLoading,
    loadingPast,
    filters,
    selectedDate,
    setSelectedDate,
    loadPastAppointments,
    refreshAppointments,
    addAppointment,
    updateAppointment,
    removeAppointment,
    setFilters,
    clearFilters,
    getAvailableCategories,
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentsProvider");
  }
  return context;
} 