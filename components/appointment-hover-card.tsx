"use client";
import { ReactNode, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, MapPin, StickyNote, User, Calendar, Hash } from "lucide-react";
import { Appointment } from "@/components/appointment-card";

interface AppointmentHoverCardProps {
  appointment: Appointment;
  children: ReactNode;
}

export function AppointmentHoverCard({ appointment, children }: AppointmentHoverCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  // Formatiere Start- und Endzeit
  const startTime = new Date(appointment.start).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(appointment.end).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Formatiere Datum
  const date = new Date(appointment.start).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Berechne Dauer
  const duration = Math.round((new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) / (1000 * 60));
  const durationText = duration >= 60 
    ? `${Math.floor(duration / 60)}h ${duration % 60}min`
    : `${duration}min`;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" side="right" align="start">
        <div className="space-y-4 p-4">
          {/* Header mit Kategorie und Titel */}
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: `${appointment.category.color}20`, border: `1px solid ${appointment.category.color}30` }}
            >
              <span style={{ filter: 'brightness(0.8)' }}>
                {appointment.category.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-gray-900 leading-tight mb-1 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                {appointment.title}
              </h4>
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: `${appointment.category.color}15`,
                  color: appointment.category.color,
                  border: `1px solid ${appointment.category.color}30`
                }}
              >
                {appointment.category.label}
              </Badge>
            </div>
            <div className="flex-shrink-0">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={(checked) => setIsCompleted(checked === true)}
                className="w-5 h-5"
              />
            </div>
          </div>

          {/* Termindetails */}
          <div className="space-y-3 text-sm">
            {/* Datum */}
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{date}</span>
            </div>

            {/* Zeit und Dauer */}
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>
                {startTime} - {endTime} 
                <span className="text-gray-500 ml-2">({durationText})</span>
              </span>
            </div>

            {/* Ort */}
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{appointment.location}</span>
            </div>

            {/* Patient */}
            <div className="flex items-center gap-3 text-gray-700">
              <User className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {appointment.patient.firstname} {appointment.patient.lastname}
                </span>
                <span className="text-xs text-gray-500">
                  Pflegegrad {appointment.patient.care_level}
                </span>
              </div>
            </div>

            {/* Notizen */}
            {appointment.notes && (
              <div className="flex items-start gap-3 text-gray-700">
                <StickyNote className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{appointment.notes}</p>
                </div>
              </div>
            )}

            {/* Termin-ID */}
            <div className="flex items-center gap-3 text-gray-500 text-xs pt-2 border-t">
              <Hash className="w-3 h-3" />
              <span>ID: {appointment.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status</span>
              <Badge variant={isCompleted ? "default" : "outline"} className="text-xs">
                {isCompleted ? "Abgeschlossen" : "Ausstehend"}
              </Badge>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
} 