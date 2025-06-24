import { Clock, MapPin, StickyNote } from "lucide-react";

interface AppointmentDetailsProps {
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
}

export function AppointmentDetails({ startTime, endTime, location, notes }: AppointmentDetailsProps) {
  return (
    <div className="space-y-1 text-muted-foreground">
      {/* Zeitangabe */}
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        <span className="font-medium">
          {startTime} bis {endTime} Uhr
        </span>
      </div>

      {/* Ort */}
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        <span>{location}</span>
      </div>

      {/* Notizen */}
      {notes && (
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          <span>{notes}</span>
        </div>
      )}
    </div>
  );
} 