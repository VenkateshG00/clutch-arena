'use client'

import { useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setProfile, setSubscription, setLoading } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    async function loadUserData(userId: string, email: string) {
      setUser({ id: userId, email })
      const [{ data: profile }, { data: subscription }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('subscriptions').select('*').eq('user_id', userId).eq('status', 'active').single(),
      ])
      setProfile(profile)
      setSubscription(subscription)
      setLoading(false)
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        loadUserData(user.id, user.email!)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          loadUserData(session.user.id, session.user.email!)
        } else if (event === 'SIGNED_OUT') {
          useAuthStore.getState().reset()
        }
      }
    )

    return () => authListener.unsubscribe()
  }, [setUser, setProfile, setSubscription, setLoading])

  return <>{children}</>
}
