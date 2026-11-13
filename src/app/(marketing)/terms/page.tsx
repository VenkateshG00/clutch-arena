import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#94A3B8]">
        <p className="text-sm text-[#94A3B8]">Last updated: November 2024</p>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Clutch Arena, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, you may not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">2. Description of Service</h2>
          <p>
            Clutch Arena is a competitive casual gaming platform that provides browser-based mini-games,
            leaderboards, daily challenges, and social features. The service is provided &quot;as is&quot;
            and may be modified at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">3. User Accounts</h2>
          <p>
            You must create an account to access certain features. You are responsible for maintaining
            the security of your account credentials. You must provide accurate information during registration.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">4. Fair Play</h2>
          <p>
            You agree not to use cheats, exploits, automation tools, or any method to gain an unfair
            advantage. Violations may result in account suspension or permanent ban. All scores must
            be achieved through legitimate gameplay.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">5. Subscriptions and Payments</h2>
          <p>
            Premium subscriptions are billed on a recurring basis. You may cancel at any time.
            Refunds are handled according to our refund policy and applicable laws. Premium features
            do not provide competitive scoring advantages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">6. Intellectual Property</h2>
          <p>
            All games, content, and branding on Clutch Arena are owned by us. You may not copy,
            modify, or distribute any part of the platform without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">7. Limitation of Liability</h2>
          <p>
            Clutch Arena is provided without warranties. We are not liable for any indirect, incidental,
            or consequential damages arising from your use of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mt-8 mb-3">8. Changes to Terms</h2>
          <p>
            We reserve the right to update these terms. Continued use after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  )
}
