import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#94A3B8]">
        <p className="text-sm text-[#94A3B8]">Last updated: November 2024</p>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">1. Information We Collect</h2>
          <p>We collect the following information when you use Clutch Arena:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Account information: email, username, display name</li>
            <li>Game data: scores, gameplay statistics, achievements</li>
            <li>Usage data: pages visited, features used, session duration</li>
            <li>Device information: browser type, operating system, screen size</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and improve the gaming experience</li>
            <li>Calculate rankings and leaderboards</li>
            <li>Process subscriptions and payments</li>
            <li>Send relevant notifications about challenges and achievements</li>
            <li>Detect and prevent cheating or abuse</li>
            <li>Analyze usage patterns to improve the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">3. Data Sharing</h2>
          <p>
            We do not sell your personal data. Your public profile, username, and scores are visible
            to other players on leaderboards. We may share data with:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Payment processors (Razorpay, Stripe) for subscription billing</li>
            <li>Analytics services (PostHog) for platform improvement</li>
            <li>Error tracking services (Sentry) for bug detection</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">4. Data Security</h2>
          <p>
            We use industry-standard security measures including encryption, secure authentication,
            and row-level security policies. However, no system is completely secure, and we cannot
            guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">6. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. Analytics cookies
            are used with your consent to improve the platform experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">7. Contact</h2>
          <p>
            For privacy-related inquiries, please contact us through the settings page or
            email our support team.
          </p>
        </section>
      </div>
    </div>
  )
}
