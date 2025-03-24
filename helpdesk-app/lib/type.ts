import { TicketStatus, UserRole } from '@prisma/client'

export interface Ticket {
    id: string
    title: string
    description: string
    contactInfo: string
    status: TicketStatus
    createdAt: string
    updatedAt: string
}

export interface User {
    id: string
    username: string
    role: UserRole
}

export interface UserContextType {
    user: User | null
    login: (username: string, password: string) => Promise<void>
    logout: () => void
    isLoading: boolean
    openLoginModal: () => void
}