"use client"
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { AppointmentDetails } from "./appointment-details";
import { AppointmentHoverCard } from "./appointment-hover-card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export interface Category {
  id: string;
  icon: string;
  color: string;
  label: string;
  created_at: string;
  updated_at: string | null;
  description: string;
}

export interface Patient {
  id: string;
  email: string;
  active: boolean;
  pronoun: string;
  lastname: string;
  firstname: string;
  birth_date: string;
  care_level: number;
  created_at: string;
  active_since: string;
}

export interface Appointment {
  id: string;
  created_at: string;
  updated_at: string | null;
  start: string;
  end: string;
  location: string;
  patient: Patient;
  attachments: string[];
  category: Category;
  notes: string;
  title: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
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

  // Prüfe, ob Startzeit später als Endzeit ist
  const isInvalidTimeRange = new Date(appointment.start) > new Date(appointment.end);

  return (
    <AppointmentHoverCard appointment={appointment}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 bg-white border border-gray-100 cursor-pointer">
        {/* Header mit Kategorie-Icon und Titel */}
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
            style={{ backgroundColor: `${appointment.category.color}20`, border: `1px solid ${appointment.category.color}30` }}
          >
            <span style={{ filter: 'brightness(0.8)' }}>
              {appointment.category.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-gray-900 text-lg leading-tight ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                {appointment.title}
              </h3>
              {isInvalidTimeRange && (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="destructive" className="flex items-center gap-1 cursor-help">
                      <AlertTriangle size={12} />
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="text-sm">
                      <p className="font-semibold text-red-600 mb-1">Ungültiger Zeitraum</p>
                      <p className="text-gray-600">
                        Das Startdatum ({startTime}) liegt nach dem Enddatum ({endTime}). 
                        Bitte überprüfen Sie die Zeiten.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
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

        <AppointmentDetails
          startTime={startTime}
          endTime={endTime}
          location={appointment.location}
          notes={appointment.notes}
        />
      </Card>
    </AppointmentHoverCard>
  );
} 