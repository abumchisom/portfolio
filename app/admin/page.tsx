import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <AdminDashboard />
}
