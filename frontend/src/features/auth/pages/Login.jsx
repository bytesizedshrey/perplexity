import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { handleLogin } = useAuth(); // moved inside component
  const navigate = useNavigate()

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
    <div
      className="min-h-screen flex items-center justify-center bg-[#050505] text-white"
      style={{
        backgroundColor: '#050505',
        backgroundImage:
          'radial-gradient(circle, rgba(148,163,184,0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="w-full max-w-md rounded-[2rem] border border-slate-700/70 bg-slate-950/95 p-8 shadow-[0_32px_120px_rgba(0,0,0,0.6)]">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Secure login
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email and password to continue.
          </p>
        </div>

        <div className="mb-6 text-center text-sm text-slate-400">
          <span>New here? </span>
          <Link
            to="/register"
            className="text-slate-200 underline hover:text-white transition"
          >
            Create an account
          </Link>
        </div>

        <form onSubmit={submitForm} className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-600"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-3xl bg-gradient-to-r from-slate-800 via-slate-900 to-black px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login