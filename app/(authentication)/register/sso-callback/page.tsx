"use client"

import { useRouter } from "next/navigation"
import { HandleSSOCallback } from "@clerk/nextjs"

export default function RegisterSSOCallbackPage() {
  const router = useRouter()

  return (
    <HandleSSOCallback
      navigateToApp={({ session, decorateUrl }) => {
        if (session?.currentTask) {
          router.push(
            decorateUrl(`/onboarding/${session.currentTask.key}`)
          )
          return
        }
        router.push(decorateUrl("/dashboard"))
      }}
      navigateToSignIn={() => router.push("/login")}
      navigateToSignUp={() => router.push("/register")}
    />
  )
}
