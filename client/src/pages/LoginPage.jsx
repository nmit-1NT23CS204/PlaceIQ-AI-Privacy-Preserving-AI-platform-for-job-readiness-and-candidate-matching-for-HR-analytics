import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Brain, TrendingUp, Users, Zap } from 'lucide-react'

export default function LoginPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register({ name, email, password, role })
      }
    } catch (err) {
      setError(err.message || `Failed to ${mode}`)
    }
  }

  const handleSocialLogin = async (provider) => {
    setError('')
    try {
      if (provider === 'google') await signInWithGoogle()
      if (provider === 'github') await signInWithGithub()
    } catch (err) {
      setError(err.message || 'Social login failed')
    }
  }

  const features = [
    { icon: Brain, label: 'AI Resume Analysis', desc: 'Deep analysis of your resume' },
    { icon: TrendingUp, label: 'Job Readiness Prediction', desc: 'Get your readiness score' },
    { icon: Users, label: 'Smart Job Matching', desc: 'Get jobs that best match you' },
    { icon: Zap, label: 'Skill Gap Insights', desc: 'Identify gaps and improve' },
  ]

  return (
    <div className="min-h-screen bg-dark-900 flex" style={{ backgroundImage: 'linear-gradient(rgba(79,142,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-12 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-gold-400" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider text-white">JobMatch <span className="text-gold-400">AI</span></span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
              <span className="text-gold-400 text-xs font-display uppercase tracking-widest">AI Powered Platform</span>
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight text-white mb-4">
              Job Readiness &<br />
              <span className="text-gold-400">Matching Platform</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">Upload your resume, analyze your skills, and get matched with the best opportunities using AI.</p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass-card p-4 hover:border-gold-500/20 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-gold-400" />
                </div>
                <p className="text-white text-sm font-semibold mb-0.5">{label}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>

          {/* Mock score display */}
          <div className="glass-card p-5 gold-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Resume Analysis</span>
              <span className="text-gold-400 text-xs font-mono">Analysed resume.pdf</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#f5a623" strokeWidth="6"
                    strokeDasharray={`${82 * 1.508} ${100 * 1.508}`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-gold-400 text-sm font-bold font-display">82%</span>
              </div>
              <div>
                <div className="text-white font-semibold">Readiness Score</div>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-gray-400">Skill Gap: <span className="text-accent-blue">05</span></span>
                  <span className="text-xs text-gray-400">Matches: <span className="text-accent-green">12</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-gray-600 text-xs relative z-10">© 2025 JobMatch AI · Privacy-Preserving Platform · Federated Learning</div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 gold-border">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-white mb-1">
                {mode === 'login' ? 'Welcome Back! 👋' : 'Create Account ✨'}
              </h2>
              <p className="text-gray-400 text-sm">
                {mode === 'login' ? 'Login to continue your journey' : 'Join us to start your career journey'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-6 text-center animate-shake">
                {error}
              </div>
            )}

            {/* Role Tabs */}
            <div className="flex gap-1 bg-dark-600 rounded-lg p-1 mb-6">
              {['student', 'recruiter', 'admin'].map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-xs font-display font-semibold uppercase tracking-wider rounded-md transition-all duration-200 ${role === r ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'}`}>
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-display uppercase tracking-wider">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Doe" className="input-dark" required />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-display uppercase tracking-wider">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input-dark" required />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-gray-400 font-display uppercase tracking-wider">Password</label>
                  {mode === 'login' && <span className="text-xs text-gold-400 hover:text-gold-300 cursor-pointer">Forgot Password?</span>}
                </div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••" className="input-dark pr-10" required minLength={6} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {mode === 'login' && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="accent-gold-500" />
                  <label htmlFor="remember" className="text-sm text-gray-400">Remember Me</label>
                </div>
              )}

              <button type="submit"
                className="btn-gold w-full py-3 rounded-lg text-sm mt-2 hover:shadow-glow transition-shadow">
                {mode === 'login' ? 'Login →' : 'Register Now ✨'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-gray-500 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleSocialLogin('google')} className="flex-1 py-2.5 rounded-lg bg-dark-600 border border-white/5 hover:border-white/20 text-gray-400 hover:text-white text-sm font-semibold transition-all">
                Google
              </button>
              <button onClick={() => handleSocialLogin('github')} className="flex-1 py-2.5 rounded-lg bg-dark-600 border border-white/5 hover:border-white/20 text-gray-400 hover:text-white text-sm font-semibold transition-all">
                GitHub
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-5">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-gold-400 hover:text-gold-300 cursor-pointer font-medium"
              >
                {mode === 'login' ? 'Create Account' : 'Login instead'}
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
