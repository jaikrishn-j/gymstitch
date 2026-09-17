"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"

export default function RegisterSSOCallbackPage() {
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
      router.push("/register")
    })
  }, [handleRedirectCallback, router])

  return null
}
