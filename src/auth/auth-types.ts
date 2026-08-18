export type UserRole = 'member' | 'staff' | 'admin'

export type PermModule = 'member' | 'plan' | 'equipment' | 'payments'
export type PermLevel = 'read' | 'full'
export type Permission = Record<PermModule, PermLevel | null>

export type AppUser = {
    uid: string
    email: string
    name: string
    role: UserRole
    permission?: Permission
}


export type AuthState = {
    user: AppUser | null
    isAuthenticated: boolean
    isLoading: boolean
}