import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Redirect based on user role
  if (session.user.role === 'HOD') {
    redirect('/hod/dashboard')
  } else if (session.user.role === 'STAFF') {
    redirect('/staff/dashboard')
  } else if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  // Fallback redirect
  redirect('/auth/signin')
}
