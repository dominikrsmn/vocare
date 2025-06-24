"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAppointments, getPastAppointments } from "@/lib/supabase/actions/appointments";
import { Appointment } from "@/components/appointment-card";

interface AppointmentsContextType {
  appointments: Appointment[];
  isLoading: boolean;
  loadingPast: boolean;
  loadPastAppointments: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updatedAppointment: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

interface AppointmentsProviderProps {
  children: ReactNode;
}

export function AppointmentsProvider({ children }: AppointmentsProviderProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPast, setLoadingPast] = useState(false);

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

  const value = {
    appointments,
    isLoading,
    loadingPast,
    loadPastAppointments,
    refreshAppointments,
    addAppointment,
    updateAppointment,
    removeAppointment,
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