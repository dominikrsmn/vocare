
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getAppointments() {
  const supabase = createClient(await cookies());
  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from("appointments")
    .select(`
      *,
      category:category(*)
    `);
  
  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  return appointmentsData;
}