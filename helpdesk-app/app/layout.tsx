import './globals.css'
import { Inter } from 'next/font/google'
import { UserProvider } from './context/UserContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Helpdesk Ticket Management',
  description: 'A modern helpdesk ticket management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  )
} 