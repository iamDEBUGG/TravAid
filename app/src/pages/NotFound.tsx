import { Link } from 'react-router'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-[var(--border)] rounded-2xl p-8 sm:p-12 shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--warning-light)] flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-[var(--warning)]" />
        </div>
        <h1 className="text-[32px] font-semibold text-[var(--text-primary)] mb-2">404</h1>
        <p className="text-[15px] text-[var(--text-muted)] mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white px-6 py-3 rounded-full text-[15px] font-medium hover:bg-[var(--accent)]/90 transition-all shadow-sm"
        >
          <Home size={18} />
          Back to TravAid
        </Link>
      </div>
    </div>
  )
}
