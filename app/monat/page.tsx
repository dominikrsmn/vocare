"use client";
import { useAppointments } from "@/lib/context/appointments-context";
import { AppointmentHoverCard } from "@/components/appointment-hover-card";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Monat() {
  const { filteredAppointments, isLoading, selectedDate } = useAppointments();

  // Aktueller Monat basierend auf selectedDate
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  // Ausgewählter Tag für die Sidebar
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  // Synchronisiere currentMonth mit selectedDate
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate));
    setSelectedDay(new Date(selectedDate)); // Setze auch selectedDay
  }, [selectedDate]);

  // Wochentage Header
  const weekDays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

  // Monatsdaten berechnen
  const monthData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Erster Tag des Monats
    const firstDayOfMonth = new Date(year, month, 1);

    
    // Wochentag des ersten Tages (0 = Sonntag, 1 = Montag, etc.)
    // Konvertiere zu Montag = 0
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;
    
    // Startdatum für das Grid (kann im vorherigen Monat liegen)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayWeekday);
    
    // 6 Wochen à 7 Tage = 42 Tage
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        dayNumber: date.getDate()
      });
    }
    
    return days;
  }, [currentMonth]);

  // Termine nach Tagen gruppieren
  const appointmentsByDay = useMemo(() => {
    const grouped: { [key: string]: typeof filteredAppointments } = {};
    
    monthData.forEach(day => {
      const dayKey = day.date.toISOString().split('T')[0];
      grouped[dayKey] = filteredAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.start).toISOString().split('T')[0];
        return appointmentDate === dayKey;
      });
    });
    
    return grouped;
  }, [filteredAppointments, monthData]);

  // Termine für den ausgewählten Tag
  const selectedDayAppointments = useMemo(() => {
    if (!selectedDay) return [];
    const dayKey = selectedDay.toISOString().split('T')[0];
    return filteredAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start).toISOString().split('T')[0];
      return appointmentDate === dayKey;
    });
  }, [filteredAppointments, selectedDay]);

  // Tag auswählen
  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
  };

  // Navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  // Monatsnamen
  const monthName = currentMonth.toLocaleDateString('de-DE', { 
    month: 'long', 
    year: 'numeric' 
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center text-gray-500 py-8">
          Lade Termine...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      {/* Header mit Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold capitalize">
            {monthName}
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
          Heute
        </Button>
      </div>

      {/* Haupt-Layout: Kalender + Sidebar */}
      <div className="grid grid-cols-12 gap-6">
        {/* Kalender Grid - 8 Spalten */}
        <div className="col-span-8">
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        {/* Wochentage Header */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Kalender Tage */}
        <div className="grid grid-cols-7">
          {monthData.map((day, index) => {
            const dayKey = day.date.toISOString().split('T')[0];
            const dayAppointments = appointmentsByDay[dayKey] || [];
            
            return (
                              <div
                 key={index}
                 onClick={() => handleDayClick(day.date)}
                 className={`min-h-[120px] border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                   !day.isCurrentMonth 
                     ? 'bg-gray-50 text-gray-400' 
                     : day.isToday 
                       ? 'bg-blue-50' 
                       : selectedDay && day.date.toDateString() === selectedDay.toDateString()
                         ? 'bg-green-50 border-green-200'
                         : 'bg-white'
                 }`}
               >
                {/* Datumsnummer */}
                <div className={`text-sm font-medium mb-2 ${
                  day.isToday ? 'text-blue-600 font-bold' : ''
                }`}>
                  {day.dayNumber}
                </div>

                {/* Termine */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <AppointmentHoverCard key={appointment.id} appointment={appointment}>
                      <div
                        className="text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-shadow"
                        style={{
                          backgroundColor: `${appointment.category.color}20`,
                          border: `1px solid ${appointment.category.color}40`,
                          color: appointment.category.color,
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{appointment.category.icon}</span>
                          <span className="truncate font-medium">
                            {appointment.title}
                          </span>
                        </div>
                        <div className="text-[10px] opacity-80 truncate">
                          {new Date(appointment.start).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} {appointment.location}
                        </div>
                      </div>
                    </AppointmentHoverCard>
                  ))}
                  
                  {/* Mehr Termine Indikator */}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayAppointments.length - 3} weitere
                    </div>
                  )}
                </div>
              </div>
                         );
           })}
         </div>
       </div>
       </div>

       {/* Sidebar - 4 Spalten */}
       <div className="col-span-4">
         <div className="bg-white border rounded-lg p-4 shadow-sm">
           <h3 className="text-lg font-semibold mb-4">
             {selectedDay ? selectedDay.toLocaleDateString('de-DE', {
               weekday: 'long',
               day: 'numeric', 
               month: 'long',
               year: 'numeric'
             }) : 'Tag auswählen'}
           </h3>
           
           {selectedDay && (
             <div className="space-y-3">
               {selectedDayAppointments.length > 0 ? (
                 selectedDayAppointments.map((appointment) => (
                   <AppointmentHoverCard key={appointment.id} appointment={appointment}>
                     <div 
                       className="p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                       style={{
                         backgroundColor: `${appointment.category.color}10`,
                         borderColor: `${appointment.category.color}30`
                       }}
                     >
                       <div className="flex items-start gap-3">
                         <div 
                           className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                           style={{ 
                             backgroundColor: `${appointment.category.color}20`,
                             color: appointment.category.color
                           }}
                         >
                           {appointment.category.icon}
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-gray-900 truncate">
                             {appointment.title}
                           </h4>
                           <p className="text-sm text-gray-600 mt-1">
                             {new Date(appointment.start).toLocaleTimeString('de-DE', {
                               hour: '2-digit',
                               minute: '2-digit'
                             })} - {new Date(appointment.end).toLocaleTimeString('de-DE', {
                               hour: '2-digit', 
                               minute: '2-digit'
                             })}
                           </p>
                           <p className="text-sm text-gray-500 truncate">
                             {appointment.location}
                           </p>
                           <p className="text-sm text-gray-600">
                             {appointment.patient.firstname} {appointment.patient.lastname}
                           </p>
                         </div>
                       </div>
                     </div>
                   </AppointmentHoverCard>
                 ))
               ) : (
                 <p className="text-gray-500 text-center py-8">
                   Keine Termine an diesem Tag
                 </p>
               )}
             </div>
           )}
         </div>
       </div>
     </div>

     {/* Nächsten Monat laden Button */}
     <div className="flex justify-center mt-6">
       <Button 
         variant="ghost" 
         onClick={() => navigateMonth('next')}
         className="text-gray-600"
       >
         Nächsten Monat laden
       </Button>
     </div>
   </div>
 );
}