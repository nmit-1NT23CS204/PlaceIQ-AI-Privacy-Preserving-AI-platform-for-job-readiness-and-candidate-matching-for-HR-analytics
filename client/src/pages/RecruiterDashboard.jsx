import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, SectionCard, StatusBadge, MatchBadge } from '../components/UIComponents'
import { Briefcase, Users, UserCheck, TrendingUp, PlusCircle, Search, Loader, Zap } from 'lucide-react'
import api from '../utils/api'

const recentJobs = [
  { title: 'Data Scientist', applications: 45, status: 'Active' },
  { title: 'ML Engineer', applications: 30, status: 'Active' },
  { title: 'Backend Developer', applications: 25, status: 'Active' },
  { title: 'Data Analyst', applications: 20, status: 'Closed' },
]

const topCandidates = [
  { name: 'John Doe', match: 92, role: 'Data Scientist' },
  { name: 'Sarah Smith', match: 88, role: 'ML Engineer' },
  { name: 'Michael Lee', match: 85, role: 'Backend Developer' },
  { name: 'Emily Davis', match: 80, role: 'Data Analyst' },
]

export default function RecruiterDashboard() {
  const navigate = useNavigate()
  const [jd, setJd] = useState('')
  const [matching, setMatching] = useState(false)
  const [results, setResults] = useState([])

  const handleMatch = async () => {
    if (!jd.trim()) return
    setMatching(true)
    try {
      const res = await api.post('/recruiters/match', { description: jd })
      setResults(res.data.data)
    } catch (err) {
      console.error('Match error')
    } finally {
      setMatching(false)
    }
  }
  return (
    <div className="space-y-4">
      <PageHeader title="Recruiter Dashboard" subtitle="Overview of your job postings and candidate pipeline."
        action={
          <button className="btn-gold px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <PlusCircle className="w-3.5 h-3.5" /> Post Job
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Jobs" value="15" icon={Briefcase} color="gold" />
        <StatCard label="Total Candidates" value="250" icon={Users} color="blue" trend={8} />
        <StatCard label="Shortlisted" value="75" icon={UserCheck} color="purple" />
        <StatCard label="Hired" value="12" icon={TrendingUp} color="green" trend={4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Match Console */}
        <SectionCard title="AI Candidate Matcher" className="lg:col-span-2">
          <div className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">Paste a Job Description below to instantly find the best-fit candidates from our AI-processed talent pool.</p>
            <div className="relative">
              <textarea 
                value={jd}
                onChange={e => setJd(e.target.value)}
                placeholder="Paste Job Description here..." 
                className="w-full h-32 bg-dark-600 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-gold-500/50 outline-none resize-none"
              />
              <div className="absolute bottom-3 right-3">
                <button 
                  onClick={handleMatch}
                  disabled={matching || !jd.trim()}
                  className="btn-gold px-4 py-2 rounded-lg text-xs flex items-center gap-2 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {matching ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  {matching ? 'Analyzing Pool...' : 'Start AI Match'}
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="AI Ranked Results"
          action={<button onClick={() => navigate('/recruiter/candidates')} className="text-xs text-gold-400 hover:text-gold-300">View Full List</button>}>
          <div className="space-y-2">
            {results.length > 0 ? results.slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-600 border border-white/5 hover:border-gold-500/20 transition-all cursor-pointer">
                <span className="text-xs text-gray-500 font-mono w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500/20 to-accent-blue/20 border border-gold-500/20 flex items-center justify-center text-xs font-bold font-display text-gold-400">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{c.explanation.slice(0, 40)}...</p>
                </div>
                <MatchBadge score={c.score} />
              </div>
            )) : (
              <div className="py-12 flex flex-col items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-xs text-gray-600 px-4 italic">Submit a JD to see AI-ranked candidates here</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent Job Posts"
        action={<button className="text-xs text-gold-400 hover:text-gold-300">View All</button>}>
        <div className="space-y-0 divide-y divide-white/5">
          <div className="grid grid-cols-3 pb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Job Title</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider text-center">Applications</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider text-right">Status</span>
          </div>
          {recentJobs.map(j => (
            <div key={j.title} className="grid grid-cols-3 py-3 hover:bg-white/2 transition-colors">
              <span className="text-sm text-gray-200">{j.title}</span>
              <span className="text-sm text-gray-400 text-center">{j.applications}</span>
              <div className="flex justify-end">
                <StatusBadge status={j.status} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
