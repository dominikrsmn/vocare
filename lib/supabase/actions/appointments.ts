"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getAppointments() {
  const supabase = createClient(await cookies());
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD Format
  
  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from("appointments")
    .select(`
      *,
      category:category(*),
      patient:patient(*)
    `)
    .gte('start', today)
    .order('start', { ascending: true });
  
  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  return appointmentsData;
}

export async function getPastAppointments(beforeDate: string, limit: number = 5) {
  const supabase = createClient(await cookies());
  
  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from("appointments")
    .select(`
      *,
      category:category(*),
      patient:patient(*)
    `)
    .lt('start', beforeDate)
    .order('start', { ascending: false })
    .limit(limit);
  
  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  return appointmentsData;
}

export async function createAppointment(appointmentData: {
  title: string;
  start: string;
  end: string;
  location: string;
  patient_id: string;
  category_id: string;
  notes?: string;
}) {
  const supabase = createClient(await cookies());
  
  // Behandle datetime-local Eingaben korrekt
  // datetime-local gibt lokale Zeit zurück, die wir als lokale Zeit interpretieren müssen
  const formatLocalDateTime = (dateTimeLocal: string) => {
    // Füge :00 für Sekunden hinzu wenn nicht vorhanden
    const fullDateTime = dateTimeLocal.includes(':') && dateTimeLocal.split(':').length === 2 
      ? dateTimeLocal + ':00' 
      : dateTimeLocal;
    
    // Erstelle Date-Objekt aus lokalem DateTime-String
    const date = new Date(fullDateTime);
    
    return date.toISOString();
  };
  
  const startISO = formatLocalDateTime(appointmentData.start);
  const endISO = formatLocalDateTime(appointmentData.end);
  
  const { data: newAppointment, error: createError } = await supabase
    .from("appointments")
    .insert({
      title: appointmentData.title,
      start: startISO,
      end: endISO,
      location: appointmentData.location,
      patient: appointmentData.patient_id,
      category: appointmentData.category_id,
      notes: appointmentData.notes || null,
    })
    .select(`
      *,
      category:category(*),
      patient:patient(*)
    `)
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return newAppointment;
}

export async function getCategories() {
  const supabase = createClient(await cookies());
  
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order('label', { ascending: true });
  
  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  return categoriesData;
}

export async function getPatients() {
  const supabase = createClient(await cookies());
  
  const { data: patientsData, error: patientsError } = await supabase
    .from("patients")
    .select("*")
    .eq('active', true)
    .order('lastname', { ascending: true });
  
  if (patientsError) {
    throw new Error(patientsError.message);
  }

  return patientsData;
}