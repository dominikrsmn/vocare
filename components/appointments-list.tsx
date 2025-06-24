"use client";
import { AppointmentCard } from "@/components/appointment-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { useAppointments } from "@/lib/context/appointments-context";
import { Appointment } from "@/components/appointment-card";

// Funktion zum Gruppieren der Termine nach Datum
function groupAppointmentsByDate(appointments: Appointment[]) {
  const grouped = appointments.reduce((groups, appointment) => {
    const date = new Date(appointment.start).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  // Sortiere die Gruppen nach Datum
  const sortedGroups = Object.entries(grouped).sort(([dateA], [dateB]) => {
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  return sortedGroups;
}

// Funktion zum Formatieren der Datumsüberschrift
function formatDateHeader(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Funktion zum Prüfen, ob das Datum heute ist
function isToday(dateString: string) {
  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return dateString === today;
}

export function AppointmentsList() {
  const { 
    appointments, 
    isLoading, 
    loadingPast, 
    loadPastAppointments 
  } = useAppointments();

  // Berechne das früheste Datum für den Button
  const getEarliestDate = () => {
    if (appointments.length === 0) return null;
    const sortedAppointments = [...appointments].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    return new Date(sortedAppointments[0].start).toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-screen-lg">
        <div className="text-center text-gray-500 py-8">
          Lade Termine...
        </div>
      </div>
    );
  }

  // Sortiere appointments nach Startzeit
  const sortedAppointments = appointments.sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  
  const groupedAppointments = groupAppointmentsByDate(sortedAppointments);
  const earliestDate = getEarliestDate();
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-lg">
      {earliestDate && (
        <div className="mb-6 flex justify-center">
          <Button 
            variant="ghost" 
            onClick={loadPastAppointments}
            disabled={loadingPast}
            className="text-xl font-semibold px-10 py-8"
          >
            {loadingPast 
              ? "Lade..." 
              : `Termine vor dem ${earliestDate} laden`
            }
          </Button>
        </div>
      )}
      
      {groupedAppointments.length > 0 ? (
        <div className="space-y-8">
          {groupedAppointments.map(([dateString, dayAppointments]) => (
            <div key={dateString} className="space-y-4">
              <div className="flex justify-between items-center gap-3 border-b border-gray-200 pb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  {formatDateHeader(dateString)}
                </h1>
                {isToday(dateString) && (
                  <Badge variant="outline" className="text-base bg-green-400/20 flex items-center gap-2">
                    <InfoIcon size={64} className="w-16 h-16 text-green-900" />
                    <span className="text-green-900">Heute</span>
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                {dayAppointments.map((appointment: Appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </div>
          ))}

            <div className="text-center text-gray-500 py-8">
              Es wurden keine weiteren Termine gefunden.
            </div>

        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Keine Termine vorhanden
        </div>
      )}
    </div>
  );
} 