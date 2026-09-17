"use client"

import * as React from "react"
import Link from "next/link"
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
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type LoginStep = "login" | "verification"

/**
 * Which Clerk flow produced the current verification step.
 * `mfa` covers second-factor / Device Trust email codes, `first_factor` covers
 * a passwordless email-code sign-in.
 */
type VerificationMode = "first_factor" | "mfa"

type ClerkFlowError = {
  longMessage?: string | null
  message?: string
} | null | undefined

function resolveClerkError(
  error: ClerkFlowError,
  fallback: string
): string {
  return error?.longMessage || error?.message || fallback
}

/**
 * The signal API resolves with `{ error }` instead of throwing, but network and
 * runtime failures still reject. Normalise both shapes into one message.
 */
function resolveThrownError(
  error: unknown,
  fallback: string
): string {
  if (typeof error !== "object" || error === null) return fallback

  const candidate = error as {
    longMessage?: string | null
    message?: string
    errors?: ClerkFlowError[] | null
  }

  return (
    candidate.longMessage ||
    candidate.errors?.[0]?.longMessage ||
    candidate.errors?.[0]?.message ||
    candidate.message ||
    fallback
  )
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useSignIn()
  const router = useRouter()

  const [step, setStep] = React.useState<LoginStep>("login")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [verificationMode, setVerificationMode] =
    React.useState<VerificationMode>("mfa")

  /**
   * Turns a completed sign-in into an active session. Clerk Core 3 replaced the
   * legacy `setActive()` helper with `signIn.finalize()`.
   */
  const finalizeSignIn = async (): Promise<boolean> => {
    if (!signIn) return false

    const { error: finalizeError } = await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        // `decorateUrl` adds Clerk's Safari ITP refresh state when needed.
        const url = decorateUrl("/dashboard")

        if (url.startsWith("http")) {
          window.location.href = url
        } else {
          router.push(url)
        }
      },
    })

    if (finalizeError) {
      setError(
        resolveClerkError(
          finalizeError,
          "Unable to start your session. Please try again."
        )
      )
      return false
    }

    return true
  }

  /** Requests a fresh single-use code for the current verification step. */
  const sendVerificationCode = async (
    mode: VerificationMode
  ): Promise<boolean> => {
    if (!signIn) return false

    const { error: sendError } =
      mode === "mfa"
        ? await signIn.mfa.sendEmailCode()
        : await signIn.emailCode.sendCode()

    if (sendError) {
      setError(
        resolveClerkError(
          sendError,
          "Unable to send a verification code."
        )
      )
      return false
    }

    return true
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!signIn) return

    setLoading(true)
    setError("")

    try {
      // Password sign-in goes through `signIn.password()` in Clerk Core 3.
      // `signIn.create()` now only accepts OAuth / enterprise SSO / passkey /
      // ticket strategies.
      const { error: passwordError } = await signIn.password({
        identifier: email,
        password,
      })

      if (passwordError) {
        setError(
          resolveClerkError(
            passwordError,
            "Unable to sign in. Please check your credentials."
          )
        )
        return
      }

      if (signIn.status === "complete") {
        await finalizeSignIn()
        return
      }

      // Device Trust (enabled by default) asks for a second factor code.
      if (signIn.status === "needs_client_trust") {
        setVerificationMode("mfa")

        if (await sendVerificationCode("mfa")) {
          setStep("verification")
        }
        return
      }

      if (signIn.status === "needs_second_factor") {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code"
        )

        if (!emailCodeFactor) {
          setError(
            "This account uses an MFA method that isn't supported in this form yet."
          )
          return
        }

        setVerificationMode("mfa")

        if (await sendVerificationCode("mfa")) {
          setStep("verification")
        }
        return
      }

      // Only reachable for passwordless email-code sign-in.
      if (signIn.status === "needs_first_factor") {
        setVerificationMode("first_factor")

        if (await sendVerificationCode("first_factor")) {
          setStep("verification")
        }
        return
      }

      setError("Unable to complete sign in. Please try again.")
    } catch (err: unknown) {
      setError(
        resolveThrownError(
          err,
          "Unable to sign in. Please check your credentials."
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!signIn) return

    setLoading(true)
    setError("")

    try {
      const { error: ssoError } = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/login/sso-callback",
        redirectCallbackUrl: "/dashboard",
      })

      // On success the browser leaves the page, so keep the loading state on.
      if (ssoError) {
        setError(
          resolveClerkError(ssoError, "Unable to continue with Google.")
        )
        setLoading(false)
      }
    } catch (err: unknown) {
      setError(resolveThrownError(err, "Unable to continue with Google."))
      setLoading(false)
    }
  }

  const handleVerification = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!signIn) return

    setLoading(true)
    setError("")

    try {
      const { error: verifyError } =
        verificationMode === "mfa"
          ? await signIn.mfa.verifyEmailCode({ code })
          : await signIn.emailCode.verifyCode({ code })

      if (verifyError) {
        setError(
          resolveClerkError(verifyError, "Invalid verification code.")
        )
        return
      }

      if (signIn.status === "complete") {
        await finalizeSignIn()
        return
      }

      setError("Verification is incomplete. Please try again.")
    } catch (err: unknown) {
      setError(resolveThrownError(err, "Invalid verification code."))
    } finally {
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
              Enter the 6-digit verification code sent to{" "}
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerification}>
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
                    {loading ? "Verifying..." : "Verify email"}
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:no-underline"
                    onClick={async () => {
                      setCode("")
                      setError("")
                      if (!signIn) return

                      try {
                        await sendVerificationCode(
                          verificationMode
                        )
                      } catch {
                        setError(
                          "Unable to resend code. Please try again."
                        )
                      }
                    }}
                  >
                    Try again
                  </button>
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
            Welcome back
          </CardTitle>

          <CardDescription>
            Login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleLogin}
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">
                    Password
                  </FieldLabel>

                  <button
                    type="button"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Forgot your password?
                  </button>
                </div>

                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  disabled={loading || !email || !password}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="underline underline-offset-4 hover:no-underline"
                  >
                    Sign up
                  </Link>
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
