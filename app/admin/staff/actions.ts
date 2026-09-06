// app/admin/staff/actions.ts
"use server"

import { clerkClient } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { UserRole } from "@/types"
import { PERMISSION_MODULES } from "@/types/permissions"

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

export async function createStaff(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  const permissions: { name: string }[] = []

  for (const mod of PERMISSION_MODULES) {
    const level = formData.get(`permission_${mod.key}`)
    if (level && level !== "null") {
      permissions.push({
        name: `${mod.key}:${level}`,
      })
    }
  }

  const clerk = await clerkClient()

  const user = await clerk.users.createUser({
    emailAddress: [email],
    password: generateTempPassword(),
    firstName: name.split(" ")[0],
    lastName: name.split(" ").slice(1).join(" ") || undefined,
    skipPasswordChecks: true,
    privateMetadata: {
      role: UserRole.STAFF,
      permission: permissions,
    },
  })

  const emailAddress = user.emailAddresses[0]
  if (emailAddress) {
    await clerk.emailAddresses.updateEmailAddress(emailAddress.id, {
      verified: true,
    })
  }

  revalidatePath("/admin/staff")
}

export async function updateStaff(
  userId: string,
  formData: FormData
) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  const permissions: { name: string }[] = []

  for (const mod of PERMISSION_MODULES) {
    const level = formData.get(`permission_${mod.key}`)
    if (level && level !== "null") {
      permissions.push({
        name: `${mod.key}:${level}`,
      })
    }
  }

  const clerk = await clerkClient()

  const [firstName, ...rest] = name.split(" ")
  const lastName = rest.join(" ") || undefined

  await clerk.users.updateUser(userId, {
    firstName,
    lastName,
    privateMetadata: {
      role: UserRole.STAFF,
      permission: permissions,
    },
  })

  const user = await clerk.users.getUser(userId)
  const currentEmail = user.emailAddresses[0]?.emailAddress

  if (email && email !== currentEmail) {
    await clerk.emailAddresses.createEmailAddress({
      userId,
      emailAddress: email,
      verified: true,
      primary: true,
    })

    if (currentEmail) {
      const oldEmail = user.emailAddresses.find(
        (e) => e.emailAddress === currentEmail
      )
      if (oldEmail && oldEmail.id) {
        await clerk.emailAddresses.deleteEmailAddress(oldEmail.id)
      }
    }
  }

  revalidatePath("/admin/staff")
}

export async function deleteStaff(userId: string) {
  const clerk = await clerkClient()
  await clerk.users.deleteUser(userId)
  revalidatePath("/admin/staff")
}