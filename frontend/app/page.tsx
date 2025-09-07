import { redirect } from 'next/navigation';

export default function HomePage() {
  // Permanently redirect to the dashboard
  redirect('/dashboard');
}