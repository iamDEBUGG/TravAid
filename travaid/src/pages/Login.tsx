import { Shield } from 'lucide-react'

export default function Login() {
  const getOAuthUrl = () => {
    const authUrl = import.meta.env.VITE_KIMI_AUTH_URL
    const appID = import.meta.env.VITE_APP_ID
    const redirectUri = `${window.location.origin}/api/oauth/callback`
    const state = btoa(redirectUri)

    const url = new URL(`${authUrl}/api/oauth/authorize`)
    url.searchParams.set('client_id', appID)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'profile')
    url.searchParams.set('state', state)

    return url.toString()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-[var(--border)] rounded-2xl p-8 sm:p-12 shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-6">
          <Shield size={32} className="text-[var(--accent)]" />
        </div>
        <h1 className="text-[24px] font-medium text-[var(--text-primary)] mb-2">Welcome to Vistara</h1>
        <p className="text-[15px] text-[var(--text-muted)] mb-8">
          Track expenses and explore travel safety insights. Login to get started.
        </p>
        <a
          href={getOAuthUrl()}
          className="inline-flex items-center justify-center gap-2 w-full bg-[var(--accent)] text-white px-6 py-3 rounded-full text-[15px] font-medium hover:bg-[var(--accent)]/90 transition-all shadow-sm"
        >
          Continue with Kimi
        </a>
        <p className="text-[12px] text-[var(--text-muted)] mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
