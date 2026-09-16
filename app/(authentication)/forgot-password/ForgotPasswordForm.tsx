"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type ForgotPasswordStep = "email" | "otp" | "password" | "success"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useSignIn()
  const router = useRouter()

  const [step, setStep] =
    React.useState<ForgotPasswordStep>("email")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] =
    React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSendCode = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!signIn) return

    setLoading(true)
    setError("")

    try {
      await signIn.create({ identifier: email })
      await signIn.resetPasswordEmailCode.sendCode()
      setStep("otp")
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          "Unable to send reset code. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!signIn) return

    setLoading(true)
    setError("")

    try {
      await signIn.resetPasswordEmailCode.verifyCode({
        code,
      })

      if (signIn.status === "needs_new_password") {
        setStep("password")
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          "Invalid verification code."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!signIn) return

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      })

      await signIn.finalize()
      setStep("success")
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          "Unable to reset password. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  if (step === "otp") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Check your email
            </CardTitle>

            <CardDescription>
              We sent a 6-digit verification code to{" "}
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerifyCode}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Verification code</FieldLabel>

                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={setCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                      </InputOTPGroup>

                      <InputOTPSeparator />

                      <InputOTPGroup>
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>

                      <InputOTPSeparator />

                      <InputOTPGroup>
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </Field>

                {error && (
                  <p className="text-center text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Field>
                  <Button
                    type="submit"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify code"}
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:no-underline"
                    onClick={() => {
                      setCode("")
                      setError("")
                    }}
                  >
                    Try again
                  </button>
                </FieldDescription>

                <FieldDescription className="text-center">
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:no-underline"
                    onClick={() => {
                      setStep("email")
                      setCode("")
                      setError("")
                    }}
                  >
                    Use a different email
                  </button>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "password") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Set new password
            </CardTitle>

            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleResetPassword}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="new-password">
                    New password
                  </FieldLabel>

                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm password
                  </FieldLabel>

                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    minLength={8}
                  />
                </Field>

                {error && (
                  <p className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Field>
                  <Button
                    type="submit"
                    disabled={
                      loading || !password || !confirmPassword
                    }
                  >
                    {loading
                      ? "Resetting password..."
                      : "Reset password"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-green-600"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <CardTitle className="text-xl">
              Password reset successful
            </CardTitle>

            <CardDescription>
              Your password has been successfully reset. You
              can now log in with your new password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <Field>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Back to login
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Reset your password
          </CardTitle>

          <CardDescription>
            Enter your email address and we&apos;ll send you a
            verification code to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSendCode}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  Email address
                </FieldLabel>

                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              {error && (
                <p className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Field>
                <Button
                  type="submit"
                  disabled={loading || !email}
                >
                  {loading ? "Sending code..." : "Send code"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Remember your password?{" "}
                <button
                  type="button"
                  className="underline underline-offset-4 hover:no-underline"
                  onClick={() => router.push("/login")}
                >
                  Back to login
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
