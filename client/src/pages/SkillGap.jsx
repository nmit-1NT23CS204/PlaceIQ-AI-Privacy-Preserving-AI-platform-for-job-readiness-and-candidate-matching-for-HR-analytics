import React, { useState, useEffect } from 'react'
import { PageHeader, SkillBar, SectionCard } from '../components/UIComponents'
import { Target, TrendingUp, BookOpen, Loader, Search } from 'lucide-react'
import api from '../utils/api'

const roles = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "AI/ML Engineer",
  "DevOps Engineer"
]

const gapSkills = [
  { label: 'React Advanced', current: 65, target: 90, priority: 'High' },
  { label: 'Data Structures', current: 55, target: 85, priority: 'High' },
  { label: 'Communication', current: 70, target: 90, priority: 'Medium' },
  { label: 'System Design', current: 40, target: 80, priority: 'Medium' },
  { label: 'Cloud (AWS)', current: 30, target: 75, priority: 'Low' },
]

const resources = [
  { title: 'React – The Complete Guide', platform: 'Udemy', hours: 40, rating: 4.8 },
  { title: 'Data Structures & Algorithms', platform: 'Coursera', hours: 30, rating: 4.7 },
  { title: 'System Design Interview Prep', platform: 'Educative', hours: 20, rating: 4.9 },
]

export default function SkillGap() {
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer')
  const [gapData, setGapData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchGaps = async (role) => {
    setLoading(true)
    try {
      const res = await api.post('/resume/analyze-gaps', { targetRole: role })
      setGapData(res.data.data)
    } catch (err) {
      console.error('Error fetching gaps')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGaps(selectedRole)
  }, [])

  const handleRoleChange = (e) => {
    const role = e.target.value
    setSelectedRole(role)
    fetchGaps(role)
  }
  return (
    <div className="space-y-4">
      <PageHeader title="Skill Gap Analysis" subtitle="Identify what you need to improve to reach your career goals." />
      
      <div className="flex flex-col md:flex-row gap-4 items-end mb-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Select Target Role</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select 
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full bg-dark-600 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-gold-500/50 outline-none appearance-none cursor-pointer"
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-shrink-0">
          {loading && <div className="flex items-center gap-2 text-xs text-gold-400 mb-2"><Loader className="w-3 h-3 animate-spin" /> Analyzing...</div>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Missing Skills', value: gapData ? gapData.missing_skills?.length : '0', icon: Target, color: 'text-gold-400 bg-gold-500/10' },
          { label: 'Match Rate', value: gapData ? `${gapData.match_percentage}%` : '0%', icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Target Role', value: selectedRole.split(' ')[0], icon: BookOpen, color: 'text-purple-400 bg-purple-500/10' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-display text-white">{s.value}</span>
            <span className="text-xs text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      <SectionCard title="Match Details">
        <div className="space-y-5">
          {gapData ? (
            <>
              <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/10">
                <p className="text-sm text-gold-400 font-semibold mb-1">AI Suggestion</p>
                <p className="text-sm text-gray-300 leading-relaxed">{gapData.suggestion}</p>
              </div>

              <div className="space-y-4 mt-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest">Skill Breakdown</p>
                {gapData.matching_skills.map(skill => (
                   <div key={skill} className="flex items-center justify-between p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                      <span className="text-sm text-white">{skill}</span>
                      <span className="text-xs text-green-400 font-mono">Matched ✓</span>
                   </div>
                ))}
                {gapData.missing_skills.map(skill => (
                   <div key={skill} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                      <span className="text-sm text-white">{skill}</span>
                      <span className="text-xs text-red-400 font-mono">Missing ✗</span>
                   </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center gap-4">
               <Loader className="w-8 h-8 text-gold-400 animate-spin" />
               <p className="text-gray-500 text-sm">Analyzing gaps for {selectedRole}...</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Recommended Resources">
        <div className="space-y-3">
          {resources.map(r => (
            <div key={r.title} className="flex items-center gap-4 p-3 rounded-xl bg-dark-600 border border-white/5 hover:border-gold-500/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-dark-500 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                <p className="text-xs text-gray-500">{r.platform} · {r.hours}h · ⭐ {r.rating}</p>
              </div>
              <button className="btn-gold px-3 py-1.5 rounded-lg text-xs flex-shrink-0">Start</button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
