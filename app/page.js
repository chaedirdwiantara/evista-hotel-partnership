import { redirect } from "next/navigation";

/**
 * Root Landing Page
 * 
 * Redirects to the primary hotel partner (Classic Hotel)
 * In the future, this could be a hotel selector page or company homepage.
 */
export default function Home() {
  // For now, redirect directly to Classic Hotel
  // In production, you might want to:
  // 1. Show a hotel selector if multiple hotels exist
  // 2. Redirect based on subdomain/domain
  // 3. Show Evista company homepage
  
  redirect("/hotels/classic-hotel");
}
