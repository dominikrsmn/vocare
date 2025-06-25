"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { useAppointments } from "@/lib/context/appointments-context";
import { createAppointment, getCategories, getPatients } from "@/lib/supabase/actions/appointments";
import { Category, Patient } from "@/components/appointment-card";

interface CreateAppointmentFormProps {
  onClose?: () => void;
}

export function CreateAppointmentForm({ onClose }: CreateAppointmentFormProps) {
  const { addAppointment, refreshAppointments } = useAppointments();
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    location: "",
    patient_id: "",
    category_id: "",
    notes: "",
  });
  
  // Loading und Data States
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Lade Kategorien und Patienten beim Mount
  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [categoriesData, patientsData] = await Promise.all([
        getCategories(),
        getPatients()
      ]);
      setCategories(categoriesData || []);
      setPatients(patientsData || []);
    } catch (error) {
      console.error("Fehler beim Laden der Formulardaten:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    if (!formData.title || !formData.start || !formData.end || !formData.location || !formData.patient_id || !formData.category_id) {
      alert("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    try {
      setIsLoading(true);
      
      const newAppointment = await createAppointment({
        title: formData.title,
        start: formData.start,
        end: formData.end,
        location: formData.location,
        patient_id: formData.patient_id,
        category_id: formData.category_id,
        notes: formData.notes,
      });

      // Füge den neuen Termin zum lokalen State hinzu
      addAppointment(newAppointment);
      
      // Formular zurücksetzen
      setFormData({
        title: "",
        start: "",
        end: "",
        location: "",
        patient_id: "",
        category_id: "",
        notes: "",
      });

      // Optional: Schließe das Formular
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Fehler beim Erstellen des Termins:", error);
      alert("Fehler beim Erstellen des Termins. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      title: "",
      start: "",
      end: "",
      location: "",
      patient_id: "",
      category_id: "",
      notes: "",
    });
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);
  const selectedPatient = patients.find(pat => pat.id === formData.patient_id);

  const hasFormData = Object.values(formData).some(value => value !== "");

  if (loadingData) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center text-muted-foreground">
          Lade Formulardaten...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Neuen Termin erstellen</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titel */}
        <div className="space-y-2">
          <Label htmlFor="title">Titel *</Label>
          <Input
            id="title"
            placeholder="Titel des Termins eingeben..."
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
          />
        </div>

        {/* Kategorie */}
        <div className="space-y-3">
          <Label>Kategorie *</Label>
          {categories.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    formData.category_id === category.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => handleInputChange("category_id", category.id)}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium">{category.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Kategorien verfügbar</p>
          )}
          {selectedCategory && (
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ 
                backgroundColor: `${selectedCategory.color}15`,
                color: selectedCategory.color,
                border: `1px solid ${selectedCategory.color}30`
              }}
            >
              {selectedCategory.icon} {selectedCategory.label}
            </Badge>
          )}
        </div>

        {/* Patient */}
        <div className="space-y-3">
          <Label>Patient *</Label>
          {patients.length > 0 ? (
            <div className="space-y-1">
              <select
                className="w-full p-2 border rounded-md"
                value={formData.patient_id}
                onChange={(e) => handleInputChange("patient_id", e.target.value)}
                required
              >
                <option value="">Patient auswählen...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstname} {patient.lastname}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Patienten verfügbar</p>
          )}
          {selectedPatient && (
            <Badge variant="secondary" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              {selectedPatient.firstname} {selectedPatient.lastname}
            </Badge>
          )}
        </div>

        {/* Datum und Zeit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Start *</Label>
            <Input
              id="start"
              type="datetime-local"
              value={formData.start}
              onChange={(e) => handleInputChange("start", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">Ende *</Label>
            <Input
              id="end"
              type="datetime-local"
              value={formData.end}
              onChange={(e) => handleInputChange("end", e.target.value)}
              required
            />
          </div>
        </div>

        {/* Ort */}
        <div className="space-y-2">
          <Label htmlFor="location">Ort *</Label>
          <Input
            id="location"
            placeholder="Ort des Termins eingeben..."
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            required
          />
        </div>

        {/* Notizen */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notizen</Label>
          <textarea
            id="notes"
            placeholder="Optionale Notizen zum Termin..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="w-full p-2 border rounded-md resize-vertical min-h-[80px]"
            rows={3}
          />
        </div>

        {/* Aktionen */}
        <div className="pt-4 border-t space-y-3">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Erstelle Termin...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Termin erstellen
              </>
            )}
          </Button>
          
          <Button 
            type="button"
            variant="outline" 
            className="w-full" 
            onClick={handleClear}
            disabled={!hasFormData || isLoading}
          >
            Formular zurücksetzen
          </Button>
        </div>
      </form>
    </div>
  );
} 