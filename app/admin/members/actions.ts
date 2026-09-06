// app/admin/members/actions.ts
"use server"

import { clerkClient } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { BloodGroup, UserRole } from "@/types"

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  const symbols = "!@#$%^&*"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  password += symbols.charAt(Math.floor(Math.random() * symbols.length))
  password += "1"
  return password
}

export async function createMember(formData: FormData) {
  const get = (key: string) => formData.get(key)?.toString() || ""

  const name = get("name")
  const email = get("email")

  if (!name || !email) {
    throw new Error("Name and email are required")
  }

  const clerk = await clerkClient()

  const user = await clerk.users.createUser({
    emailAddress: [email],
    password: generateTempPassword(),
    firstName: name.split(" ")[0],
    lastName: name.split(" ").slice(1).join(" ") || undefined,
    skipPasswordChecks: true,
    privateMetadata: {
      role: UserRole.MEMBER,
      phone: get("phone"),
      whatsapp: get("whatsapp"),
      residentialAddress: {
        street: get("homeStreet"),
        city: get("homeCity"),
        state: get("homeState"),
        postalCode: get("homePostalCode"),
        country: get("homeCountry"),
        landmark: get("homeLandmark") || undefined,
      },
      currentAddress: {
        street: get("currentStreet"),
        city: get("currentCity"),
        state: get("currentState"),
        postalCode: get("currentPostalCode"),
        country: get("currentCountry"),
        landmark: get("currentLandmark") || undefined,
      },
      emergencyContactName: get("emergencyContactName"),
      emergencyContactRelation: get("emergencyContactRelation"),
      emergencyContactPhone: get("emergencyContactPhone"),
      height: get("height") ? Number(get("height")) : undefined,
      bloodGroup: get("bloodGroup") || undefined,
    },
  })

  const emailAddress = user.emailAddresses[0]
  if (emailAddress) {
    await clerk.emailAddresses.updateEmailAddress(emailAddress.id, {
      verified: true,
    })
  }

  revalidatePath("/admin/members")
}

export async function deleteMember(userId: string) {
  const clerk = await clerkClient()
  await clerk.users.deleteUser(userId)
  revalidatePath("/admin/members")
}
