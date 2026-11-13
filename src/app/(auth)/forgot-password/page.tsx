'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/auth/callback?next=/settings` }
      )

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
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
          <h2 className="text-xl font-semibold text-[#F8FAFC]">
            Reset your password
          </h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-400">
              Check your email for a password reset link. It may take a minute
              to arrive.
            </div>
            <p className="text-center text-sm text-[#94A3B8]">
              <Link
                href="/login"
                className="font-medium text-[#8B5CF6] hover:text-[#8B5CF6]/80"
              >
                Back to sign in
              </Link>
            </p>
          </motion.div>
        ) : (
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
              disabled={loading}
              className="w-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            >
              {loading && <Spinner />}
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>

            <p className="text-center text-sm text-[#94A3B8]">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-medium text-[#8B5CF6] hover:text-[#8B5CF6]/80"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
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
