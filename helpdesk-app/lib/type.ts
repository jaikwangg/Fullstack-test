import { UserRole } from '@prisma/client'
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

export interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
    onLogin: (username: string, password: string) => Promise<void>
}

export interface Params {
    params: { id: string };
}