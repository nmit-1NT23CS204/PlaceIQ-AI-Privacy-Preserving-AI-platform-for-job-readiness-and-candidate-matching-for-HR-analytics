import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import AIAnalysis from './pages/AIAnalysis'
import SkillGap from './pages/SkillGap'
import MatchedJobs from './pages/MatchedJobs'
import Recommended from './pages/Recommended'
import Profile from './pages/Profile'
import RecruiterDashboard from './pages/RecruiterDashboard'
import RecruiterCandidates from './pages/RecruiterCandidates'
import AdminDashboard from './pages/AdminDashboard'
import UploadResume from './pages/UploadResume'

function AppRoutes() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  const getDefaultRoute = () => {
    if (user.role === 'recruiter') return '/recruiter/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
    return '/dashboard'
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-resume" element={<UploadResume />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/matched-jobs" element={<MatchedJobs />} />
        <Route path="/recommended" element={<Recommended />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/candidates" element={<RecruiterCandidates />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
