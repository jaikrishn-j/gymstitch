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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    privateMetadata?: Record<string, any>
}