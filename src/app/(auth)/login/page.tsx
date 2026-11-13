'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { loginSchema } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      router.push(redirectTo)
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
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
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
          <h2 className="text-xl font-semibold text-[#F8FAFC]">Welcome back</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login form */}

        {/* Email / Password form */}
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
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#F8FAFC]">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#8B5CF6] hover:text-[#8B5CF6]/80"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border-white/10 bg-white/[0.04] text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus-visible:border-[#8B5CF6] focus-visible:ring-[#8B5CF6]/30"
            />
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
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#94A3B8]">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-[#8B5CF6] hover:text-[#8B5CF6]/80"
          >
            Sign up
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
