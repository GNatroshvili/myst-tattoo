import { AdminApp } from "@/components/admin/AdminApp";

/**
 * /admin: where the studio adds its artists, tattoos and styles. Everything
 * happens in the browser, which talks to the backend API; the API itself
 * refuses changes from anyone who has not signed in.
 */
export default function AdminPage() {
  return <AdminApp />;
}
