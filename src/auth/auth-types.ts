export type UserRole = 'member' | 'staff' | 'admin'

export type AppUser = {
    uid: string
    email: string
    name: string
    role: UserRole
}


export type AuthState = {
    user: AppUser | null
    isAuthenticated: boolean
    isLoading: boolean
}