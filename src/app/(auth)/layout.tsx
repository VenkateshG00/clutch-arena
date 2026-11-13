import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clutch Arena - Sign In',
  description: 'Sign in to Clutch Arena and start competing',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.06) 40%, transparent 80%)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(248,250,252,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(248,250,252,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #8B5CF6 100%)',
              }}
            >
              CLUTCH ARENA
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-[#94A3B8]">
            Compete. Climb. Conquer.
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}
