"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAppointments } from "@/lib/context/appointments-context"

export default function DatePicker() {
  const [open, setOpen] = React.useState(false)
  const { selectedDate, setSelectedDate } = useAppointments()

  // Format date in German
  const formatGermanDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-start font-normal"
          >
            <CalendarIcon />
            {selectedDate ? formatGermanDate(selectedDate) : "Datum auswählen"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date)
              }
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
