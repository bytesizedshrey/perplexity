import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth';
import { useSelector } from 'react-redux';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

  const { handleLogin } = useAuth(); // moved inside component
  const navigate = useNavigate()

    // stop logged in users from accessing login page
    if (!loading && user) {
      return <Navigate to="/" replace />
    }
  
  const submitForm = async (event) => {
    event.preventDefault()

    const payload = {
      email,
      password,
    }

    await handleLogin(payload)
    navigate('/')
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center dot-matrix-bg text-neutral-200 relative overflow-hidden terminal-grid">
      <div className="scanning-line"></div>
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-black/90 p-8 shadow-[0_0_80px_rgba(255,255,255,0.02)] relative z-20 backdrop-blur-md dot-matrix-panel">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 font-mono">
            // SECURE_LOGIN_GATEWAY
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white font-mono uppercase">
            Sign In
          </h1>
          <p className="mt-2 text-xs font-mono text-neutral-500 font-semibold">
            Authorization required to establish connection.
          </p>
        </div>

        <div className="mb-6 text-center text-xs font-mono text-neutral-400">
          <span>First time connecting? </span>
          <Link
            to="/register"
            className="text-white underline hover:text-neutral-300 transition-colors"
          >
            Create credentials
          </Link>
        </div>

        <form onSubmit={submitForm} className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-xs font-mono uppercase tracking-wider text-neutral-400">
              User Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="operator@network.local"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950/80 px-4 py-3 font-mono text-sm text-white placeholder:text-neutral-700 outline-none transition focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-mono uppercase tracking-wider text-neutral-400">
              Passkey
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950/80 px-4 py-3 font-mono text-sm text-white placeholder:text-neutral-700 outline-none transition focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3.5 text-xs font-bold uppercase tracking-wider dot-matrix-btn disabled:opacity-50"
          >
            {loading ? "Establishing Link..." : "Initialize Link"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login