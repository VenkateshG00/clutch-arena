'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { registerSchema } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type FieldErrors = Partial<Record<'email' | 'password' | 'username' | 'displayName', string>>

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const parsed = registerSchema.safeParse({ email, password, username, displayName: displayName || undefined })
    if (!parsed.success) {
      const errors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors
        if (field && !errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName || username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      setEmailSent(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) {
        setError(oauthError.message)
        setGoogleLoading(false)
      }
    } catch {
      setError('Failed to initiate Google sign in.')
      setGoogleLoading(false)
    }
  }

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div
          className="rounded-xl border border-white/[0.06] p-6 text-center shadow-2xl sm:p-8"
          style={{ backgroundColor: '#111525' }}
        >
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#8B5CF6]/10">
            <svg
              className="size-7 text-[#8B5CF6]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#F8FAFC]">Check your email</h2>
          <p className="mt-2 text-sm text-[#94A3B8]">
            We sent a confirmation link to{' '}
            <span className="font-medium text-[#F8FAFC]">{email}</span>.
            <br />
            Click the link to activate your account.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="mt-6 w-full border-white/10 bg-white/[0.04] text-[#F8FAFC] hover:bg-white/[0.08]"
            onClick={() => router.push('/login')}
          >
            Back to sign in
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div
        className="rounded-xl border border-white/[0.06] p-6 shadow-2xl sm:p-8"
        style={{ backgroundColor: '#111525' }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#F8FAFC]">Create an account</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Join the arena and start competing
          </p>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#F8FAFC]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="border-white/10 bg-white/[0.04] text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus-visible:border-[#8B5CF6] focus-visible:ring-[#8B5CF6]/30"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#F8FAFC]">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="clutch_player"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="border-white/10 bg-white/[0.04] text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus-visible:border-[#8B5CF6] focus-visible:ring-[#8B5CF6]/30"
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-400">{fieldErrors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-[#F8FAFC]">
              Display Name{' '}
              <span className="font-normal text-[#94A3B8]">(optional)</span>
            </Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              className="border-white/10 bg-white/[0.04] text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus-visible:border-[#8B5CF6] focus-visible:ring-[#8B5CF6]/30"
            />
            {fieldErrors.displayName && (
              <p className="text-xs text-red-400">{fieldErrors.displayName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#F8FAFC]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="border-white/10 bg-white/[0.04] text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus-visible:border-[#8B5CF6] focus-visible:ring-[#8B5CF6]/30"
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading || googleLoading}
            className="w-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
          >
            {loading ? <Spinner /> : null}
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#94A3B8]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-[#8B5CF6] hover:text-[#8B5CF6]/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

function Spinner() {
  return (
    <svg
      className="mr-2 size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
