
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