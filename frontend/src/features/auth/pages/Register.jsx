import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import { DotmSpiral, DotmRipple, DotmDisplay } from '../../../components/DotMatrix'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)
  const { handleRegister } = useAuth()
  const navigate = useNavigate()

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  const submitForm = async (event) => {
    event.preventDefault()
    await handleRegister(formData)
    navigate('/')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center dot-matrix-bg text-neutral-200 relative overflow-hidden terminal-grid">
      <div className="scanning-line" />

      {/* Decorative background dot matrices */}
      <div className="absolute top-8 right-8 opacity-30 pointer-events-none select-none">
        <DotmSpiral size={60} dotSize={7} color="#1a1a1a" speed={0.6} pattern="full" animated opacityBase={0.04} opacityMid={0.12} opacityPeak={0.5} />
      </div>
      <div className="absolute bottom-8 left-8 opacity-30 pointer-events-none select-none">
        <DotmRipple size={60} dotSize={7} color="#1a1a1a" speed={0.8} pattern="diamond" animated opacityBase={0.04} opacityMid={0.12} opacityPeak={0.5} />
      </div>
      <div className="absolute bottom-16 right-12 opacity-15 pointer-events-none select-none">
        <DotmDisplay size={40} dotSize={5} color="#222" pattern="outline" />
      </div>
      <div className="absolute top-16 left-12 opacity-15 pointer-events-none select-none">
        <DotmDisplay size={40} dotSize={5} color="#222" pattern="cross" />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-neutral-900 bg-[#080808]/92 p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-20 glass-panel dot-matrix-panel">

        {/* Top section with animated dot matrix */}
        <div className="mb-7 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <DotmRipple
              size={52}
              dotSize={7}
              color="#404040"
              speed={1.0}
              pattern="full"
              animated
              opacityBase={0.1}
              opacityMid={0.3}
              opacityPeak={0.9}
            />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-neutral-600 animate-pulse" />
            </div>
          </div>

          <div>
            {/* <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-600 font-mono font-bold">
              // REGISTER_NODE
            </p> */}
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white font-mono uppercase">
              Register
            </h1>
            <p className="mt-1.5 text-[11px] font-mono text-neutral-600">
              Create credentials to access the network.
            </p>
          </div>
        </div>

        {/* Login link */}
        <div className="mb-6 text-center text-[11px] font-mono text-neutral-600">
          <span>Already registered? </span>
          <Link
            to="/login"
            className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={submitForm} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] font-mono uppercase tracking-widest text-neutral-600">
              Username
            </span>
            <input
              id="register-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="operator_name"
              className="w-full rounded-xl border border-neutral-900 bg-neutral-950/80 px-4 py-3 font-mono text-[12px] text-white placeholder:text-neutral-800 outline-none transition focus:border-neutral-700 focus:ring-1 focus:ring-neutral-800 hover:border-neutral-800"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-mono uppercase tracking-widest text-neutral-600">
              Email
            </span>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="operator@network.local"
              className="w-full rounded-xl border border-neutral-900 bg-neutral-950/80 px-4 py-3 font-mono text-[12px] text-white placeholder:text-neutral-800 outline-none transition focus:border-neutral-700 focus:ring-1 focus:ring-neutral-800 hover:border-neutral-800"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-mono uppercase tracking-widest text-neutral-600">
              Password
            </span>
            <input
              id="register-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-900 bg-neutral-950/80 px-4 py-3 font-mono text-[12px] text-white placeholder:text-neutral-800 outline-none transition focus:border-neutral-700 focus:ring-1 focus:ring-neutral-800 hover:border-neutral-800"
            />
          </label>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 text-[11px] font-bold uppercase tracking-wider dot-matrix-btn disabled:opacity-40 mt-2 flex items-center justify-center gap-2.5"
          >
            {loading ? (
              <>
                <DotmSpiral size={14} dotSize={2} color="#737373" speed={2} animated />
                Registering...
              </>
            ) : (
              'Generate Identity'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register
