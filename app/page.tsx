import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to dashboard for now
  // TODO: Add proper landing page or authentication check
  redirect('/dashboard')
}
