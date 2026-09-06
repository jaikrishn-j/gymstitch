export enum UserRole {
    ADMIN = "admin",
    STAFF = "staff",
    MEMBER = "member"
}

export interface UserProfile {
    id: string
    email: string
    firstName: string | null
    lastname: string | null
    imageUrl: string | null
    role: UserRole
}