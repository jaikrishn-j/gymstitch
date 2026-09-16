"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"
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
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type RegisterStep = "register" | "verification"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp } = useSignUp()
  const router = useRouter()

  const [step, setStep] =
    React.useState<RegisterStep>("register")

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!signUp) return

    setLoading(true)
    setError("")

    try {
      await signUp.create({
        emailAddress: email,
        password,
      })

      await signUp.verifications.sendEmailCode()

      setStep("verification")
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          "Unable to create your account."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!signUp) return

    setLoading(true)
    setError("")

    try {
      await signUp.verifications.verifyEmailCode({
        code,
      })

      if (signUp.status === "complete") {
        await signUp.finalize()

        router.push("/onboarding")
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

  const handleGoogleSignUp = async () => {
    if (!signUp) return

    setLoading(true)
    setError("")

    try {
      await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: "/register/sso-callback",
        redirectCallbackUrl: "/dashboard",
      })
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          "Unable to continue with Google."
      )
      setLoading(false)
    }
  }

  if (step === "verification") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Verify your email
            </CardTitle>

            <CardDescription>
              We sent a 6-digit verification code to{" "}
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerification}>
              <FieldGroup>
                <Field>
                  <FieldLabel>
                    Verification code
                  </FieldLabel>

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
                  <p className="text-sm text-center text-destructive">
                    {error}
                  </p>
                )}

                <Field>
                  <Button
                    type="submit"
                    disabled={loading || code.length !== 6}
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify email"}
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  The code was sent to your email address.
                </FieldDescription>
              </FieldGroup>
            </form>
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
            Create an account
          </CardTitle>

          <CardDescription>
            Get started with your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>

                  Continue with Google
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="email">
                  Email
                </FieldLabel>

                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">
                  Password
                </FieldLabel>

                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
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
                    loading ||
                    !email ||
                    !password
                  }
                >
                  {loading
                    ? "Creating account..."
                    : "Create account"}
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="underline underline-offset-4 hover:no-underline"
                  >
                    Login
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a
          href="/terms"
          className="underline underline-offset-4 hover:no-underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline underline-offset-4 hover:no-underline"
        >
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  )
}
