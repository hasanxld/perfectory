"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"
import { GButton, GInput } from "@/components/ui-kit"
import { Icon } from "@/components/icon"
import { useAuth } from "@/lib/auth-context"
import { PhoneInput } from "@/components/phone-input"
import { PasswordStrengthMeter } from "@/components/password-strength-meter"
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validatePassword,
  generateAvatarUrl,
} from "@/lib/validation"

export default function SignupPage() {
  const { signupEmail } = useAuth()
  const router = useRouter()
  
  // Form states
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("+880 ")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Validation states
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [fullNameError, setFullNameError] = useState("")
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  
  // Calculate password strength
  const passwordStrength = useMemo(() => validatePassword(password), [password])
  
  // Generate avatar
  const avatarUrl = useMemo(() => 
    fullName.trim() ? generateAvatarUrl(fullName) : null,
    [fullName]
  )

  // Validate email on change
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    if (value.trim()) {
      const validation = validateEmail(value)
      setEmailError(validation.error || "")
    } else {
      setEmailError("")
    }
  }, [])

  // Validate full name on change
  const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFullName(value)
    
    if (value.trim()) {
      const validation = validateFullName(value)
      setFullNameError(validation.error || "")
    } else {
      setFullNameError("")
    }
  }, [])

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      fullName.trim() &&
      !fullNameError &&
      email.trim() &&
      !emailError &&
      isPhoneValid &&
      !phoneError &&
      passwordStrength.isValid
    )
  }, [fullName, fullNameError, email, emailError, isPhoneValid, phoneError, passwordStrength.isValid])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    
    // Final validation
    if (!isFormValid) {
      setError("Please fill all fields correctly")
      return
    }
    
    setLoading(true)
    try {
      await signupEmail(fullName, email, password, phone, avatarUrl || undefined)
      router.push("/verify-email")
    } catch (err) {
      setError(mapError(err))
    } finally {
      setLoading(false)
    }
  }



  return (
    <AuthShell title="Create your account" subtitle="Get 50 free credits and start generating voice">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <Icon name="danger-triangle-bold" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Auto Avatar Preview */}
        {avatarUrl && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="Your avatar"
              className="size-24 rounded-xl border-2 border-brand-1/30 shadow-lg"
            />
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name</label>
          <div className="relative">
            <GInput
              required
              value={fullName}
              onChange={handleFullNameChange}
              placeholder="Your full name"
            />
            {fullName && !fullNameError && (
              <Icon
                name="check-circle-bold"
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
              />
            )}
            {fullNameError && (
              <Icon
                name="x-circle-bold"
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
              />
            )}
          </div>
          {fullNameError && <p className="text-xs text-red-500 mt-1">{fullNameError}</p>}
        </div>

        {/* Email Field - Gmail Only */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Email Address</label>
          <div className="relative">
            <GInput
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="your.email@gmail.com"
            />
            {email && !emailError && (
              <Icon
                name="check-circle-bold"
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
              />
            )}
            {emailError && (
              <Icon
                name="x-circle-bold"
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
              />
            )}
          </div>
          {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
        </div>

        {/* Phone Number Field */}
        <PhoneInput
          value={phone}
          onChange={setPhone}
          error={phoneError}
          onValidChange={setIsPhoneValid}
        />

        {/* Password Field with Strength Meter */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <div className="relative">
            <GInput
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle password visibility"
            >
              <Icon name={showPassword ? "eye-closed-bold" : "eye-bold"} size={18} />
            </button>
          </div>
          <PasswordStrengthMeter strength={passwordStrength} />
        </div>

        {/* Submit Button */}
        <GButton
          type="submit"
          loading={loading}
          disabled={!isFormValid || loading}
          className="mt-4 w-full"
        >
          <Icon name="user-plus-bold" size={18} />
          Create Account
        </GButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="gradient-text font-medium hover:opacity-80 transition-opacity">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}

function mapError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ""
  if (code.includes("email-already-in-use")) return "This email is already registered."
  if (code.includes("invalid-email")) return "Please enter a valid email."
  if (code.includes("weak-password")) return "Password is too weak."
  if (code.includes("popup-closed")) return "Google sign-in was cancelled."
  return "Something went wrong. Please try again."
}
