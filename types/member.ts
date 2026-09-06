export enum BloodGroup {
    APositive = "A+",
    ANegative = "A-",
    BPositive = "B+",
    BNegative = "B-",
    ABPositive = "AB+",
    ABNegative = "AB-",
    OPositive = "O+",
    ONegative = "O-"
}

export interface Address {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    landmark?: string
}

export interface MemberDetails {
    // Personal Details
    name: string
    phone: string
    whatsapp?: string
    
    // Detailed Addresses
    residentialAddress: Address
    currentAddress: Address
    
    // Emergency Contact Details
    emergencyContactName: string
    emergencyContactRelation: string
    emergencyContactPhone: string

    // Optional Details
    height?: number // Height in centimeters
    bloodGroup?: BloodGroup
}