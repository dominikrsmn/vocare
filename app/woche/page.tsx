"use client";
import { useAppointments } from "@/lib/context/appointments-context";

import { AppointmentHoverCard } from "@/components/appointment-hover-card";
import { useState, useMemo, useEffect } from "react";
import { Appointment } from "@/components/appointment-card";



export default function Woche() {
  const { filteredAppointments, isLoading, selectedDate } = useAppointments();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Wochenbeginn (Montag) berechnen
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Montag als Wochenbeginn
    return new Date(d.setDate(diff));
  };

  // Wochentage generieren
  const weekDays = useMemo(() => {
    const start = getWeekStart(selectedDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

  // Zeitslots generieren (6:00 - 20:00)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Termine nach Tagen gruppieren
  const appointmentsByDay = useMemo(() => {
    const grouped: { [key: string]: typeof filteredAppointments } = {};
    
    weekDays.forEach(day => {
      const dayKey = day.toISOString().split('T')[0];
      grouped[dayKey] = filteredAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.start).toISOString().split('T')[0];
        return appointmentDate === dayKey;
      });
    });
    
    return grouped;
  }, [filteredAppointments, weekDays]);

  // Terminposition berechnen
  const getAppointmentPosition = (appointment: Appointment) => {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Stunden
    
    // Mit h-24 (6rem pro Stunde)
    const hourHeight = 6; // rem
    const topOffset = (startHour - 6) * hourHeight; // Offset vom 6:00 Uhr Start
    const appointmentHeight = duration * hourHeight;
    
    return {
      topOffset,
      height: Math.max(0.5, appointmentHeight), // Mindestens 0.5rem hoch
    };
  };



  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Aktuelle Zeit regelmäßig aktualisieren
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Jede Minute aktualisieren

    return () => clearInterval(interval);
  }, []);

  // Berechne die Position der aktuellen Zeit-Linie
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    
    // Nur anzeigen wenn zwischen 6:00 und 20:00
    if (currentHour < 6 || currentHour > 20) {
      return null;
    }
    
    const hourHeight = 6; // rem (h-24)
    const topOffset = (currentHour - 6) * hourHeight;
    
    return topOffset;
  };

  // Prüfe ob heute in der aktuellen Woche ist
  const isTodayInCurrentWeek = useMemo(() => {
    return weekDays.some(day => isToday(day));
  }, [weekDays]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-full">
        <div className="text-center text-gray-500 py-8">
          Lade Termine...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      {/* Wochenüberschrift */}
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-2xl font-semibold">
          {weekDays[0]?.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })} - {' '}
          {weekDays[6]?.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h1>
      </div>

      {/* Kalender Grid */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="grid grid-cols-8 border-b bg-gray-50">
          {/* Leer für Zeitslot-Spalte */}
          <div className="p-3 text-sm font-medium text-gray-500 border-r">Zeit</div>
          
          {/* Wochentage */}
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`p-3 text-center border-r last:border-r-0 ${
                isToday(day) ? 'bg-blue-50 text-blue-700 font-semibold' : ''
              }`}
            >
              <div className="text-sm font-medium">
                {day.toLocaleDateString('de-DE', { weekday: 'short' })}
              </div>
              <div className={`text-lg ${isToday(day) ? 'font-bold' : ''}`}>
                {day.getDate()}
              </div>
              <div className="text-xs text-gray-500">
                {day.toLocaleDateString('de-DE', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Zeit-Grid */}
        <div className="relative">
          <div className="grid grid-cols-8 overflow-y-auto">
            {/* Zeitslots */}
            <div className="border-r bg-gray-50">
              {timeSlots.map((time) => (
                <div key={time} className="h-24 border-b flex items-start p-2">
                  <span className="text-xs text-gray-500 font-medium">{time}</span>
                </div>
              ))}
            </div>

            {/* Aktuelle Zeit-Linie */}
            {isTodayInCurrentWeek && getCurrentTimePosition() !== null && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{
                  top: `${getCurrentTimePosition()}rem`,
                }}
              >
                <div className="flex items-center">
                  {/* Zeitanzeige */}
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-l font-medium min-w-16 text-center">
                    {currentTime.toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {/* Rote Linie */}
                  <div className="flex-1 h-0.5 bg-red-500"></div>
                </div>
              </div>
            )}

            {/* Tage */}
            {weekDays.map((day, dayIndex) => {
              const dayKey = day.toISOString().split('T')[0];
              const dayAppointments = appointmentsByDay[dayKey] || [];

              return (
                <div key={dayIndex} className="relative border-r last:border-r-0">
                  {/* Zeit-Grid für diesen Tag */}
                  {timeSlots.map((time, timeIndex) => (
                    <div key={`${dayIndex}-${timeIndex}`} className="h-24 border-b border-gray-100" />
                  ))}

                  {/* Termine für diesen Tag */}
                  {dayAppointments.map((appointment) => {
                    const position = getAppointmentPosition(appointment);
                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-1 right-1 z-10"
                        style={{
                          top: `${position.topOffset}rem`,
                          height: `${position.height}rem`,
                        }}
                      >
                        <AppointmentHoverCard appointment={appointment}>
                          <div className="h-full p-1 cursor-pointer">
                            <div
                              className="h-full rounded p-2 text-xs overflow-hidden shadow-sm border-l-4 hover:shadow-md transition-shadow"
                              style={{
                                backgroundColor: `${appointment.category.color}15`,
                                borderColor: appointment.category.color,
                              }}
                            >
                              <div className="font-medium text-gray-900 truncate mb-1">
                                {appointment.title}
                              </div>
                              <div className="text-gray-600 text-[10px] space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <span>{appointment.category.icon}</span>
                                  <span className="truncate">{appointment.category.label}</span>
                                </div>
                                <div className="truncate">
                                  {new Date(appointment.start).toLocaleTimeString('de-DE', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} - {new Date(appointment.end).toLocaleTimeString('de-DE', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div className="truncate">{appointment.location}</div>
                                <div className="truncate">
                                  {appointment.patient.firstname} {appointment.patient.lastname}
                                </div>
                              </div>
                            </div>
                          </div>
                        </AppointmentHoverCard>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}