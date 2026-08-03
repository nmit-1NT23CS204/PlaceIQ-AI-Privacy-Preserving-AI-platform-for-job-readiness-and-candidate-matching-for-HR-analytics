import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Upload, Brain, Target, Briefcase, BookOpen,
  User, Settings, LogOut, Bell, Search, ChevronRight, Users,
  BarChart3, Database, Menu, X, Shield
} from 'lucide-react'

const studentNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload Resume', path: '/upload-resume' },
  { icon: Brain, label: 'AI Analysis', path: '/ai-analysis' },
  { icon: Target, label: 'Skill Gap', path: '/skill-gap' },
  { icon: Briefcase, label: 'Matched Jobs', path: '/matched-jobs' },
  { icon: BookOpen, label: 'Recommended', path: '/recommended' },
  { icon: User, label: 'Profile', path: '/profile' },
]

const recruiterNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/recruiter/dashboard' },
  { icon: Briefcase, label: 'Post Job', path: '/recruiter/post-job' },
  { icon: Users, label: 'Candidates', path: '/recruiter/candidates' },
  { icon: BarChart3, label: 'Reports', path: '/recruiter/reports' },
  { icon: User, label: 'Profile', path: '/profile' },
]

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Database, label: 'Database', path: '/admin/database' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
]

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)

  const navItems = user?.role === 'recruiter' ? recruiterNav : user?.role === 'admin' ? adminNav : studentNav

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JD'
  const roleColors = { student: 'text-accent-blue', recruiter: 'text-accent-green', admin: 'text-accent-purple' }
  const roleBg = { student: 'bg-accent-blue/10', recruiter: 'bg-accent-green/10', admin: 'bg-accent-purple/10' }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 flex flex-col bg-dark-800 border-r border-white/5 transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-gold-400" />
          </div>
          {sidebarOpen && <span className="font-display text-base font-bold tracking-wider whitespace-nowrap">JobMatch <span className="text-gold-400">AI</span></span>}
        </div>

        {/* User mini-profile */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-2">
              <div className={`w-7 h-7 rounded-full ${roleBg[user?.role]} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-xs font-bold font-display ${roleColors[user?.role]}`}>{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className={`text-xs capitalize ${roleColors[user?.role]}`}>{user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`sidebar-link w-full text-left ${location.pathname === path ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{label}</span>}
              {sidebarOpen && location.pathname === path && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-white/5 space-y-0.5">
          <button className={`sidebar-link w-full ${!sidebarOpen ? 'justify-center px-2' : ''}`}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
          </button>
          <button onClick={logout} className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${!sidebarOpen ? 'justify-center px-2' : ''}`}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex items-center gap-4 px-4 border-b border-white/5 bg-dark-800/50 backdrop-blur-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input placeholder="Search anything..." className="w-full bg-dark-700 border border-white/5 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gold-500/40" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="w-8 h-8 rounded-lg bg-dark-700 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold-400 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 glass-card border border-white/10 z-50 p-3 space-y-2">
                  {['New job match: Data Scientist (92%)', 'AI Analysis complete', 'Profile viewed by recruiter'].map(n => (
                    <div key={n} className="flex items-start gap-2 p-2 rounded hover:bg-white/5">
                      <div className="w-1.5 h-1.5 bg-gold-400 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-gray-300">{n}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`w-8 h-8 rounded-lg ${roleBg[user?.role]} flex items-center justify-center`}>
              <span className={`text-xs font-bold ${roleColors[user?.role]}`}>{initials}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
