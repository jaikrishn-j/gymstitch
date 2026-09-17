"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"

export default function LoginSSOCallbackPage() {
  const router = useRouter()
  const { handleRedirectCallback } = useClerk()

  useEffect(() => {
    handleRedirectCallback(
      {},
      (to) => {
        router.push(to)
        return Promise.resolve()
      }
    ).catch(() => {
      router.push("/login")
    })
  }, [handleRedirectCallback, router])

  return null
}
