import { ReactNode } from 'react'
import { DashboardNav } from '@/components/layout/dashboard-nav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
