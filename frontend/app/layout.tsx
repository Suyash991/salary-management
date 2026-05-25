import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'
import { Sidebar } from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SalaryHQ — HR Manager Portal',
  description: 'Salary management tool for HR managers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Sidebar />
          <main className="ml-56 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  )
}
