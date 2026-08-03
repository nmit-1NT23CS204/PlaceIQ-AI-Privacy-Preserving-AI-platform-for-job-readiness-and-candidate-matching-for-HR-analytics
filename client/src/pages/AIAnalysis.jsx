import React from 'react'
import { PageHeader, SkillBar, RadialScore, SectionCard } from '../components/UIComponents'
import { Download, CheckCircle, AlertCircle } from 'lucide-react'

const skills = [
  { label: 'Python', value: 90 }, { label: 'React', value: 85 },
  { label: 'Machine Learning', value: 70 }, { label: 'SQL', value: 65 }, { label: 'Communication', value: 60 },
]

const strengths = ['Problem Solving', 'Data Structures', 'Python', 'Teamwork']
const recs = ['Improve React Skills', 'Learn Advanced SQL', 'Build Real World Projects']

const careerPaths = [
  { title: 'Data Scientist', match: 92, color: '#f5a623' },
  { title: 'ML Engineer', match: 88, color: '#4f8ef7' },
  { title: 'Backend Developer', match: 85, color: '#22c55e' },
  { title: 'Data Analyst', match: 80, color: '#7c5cbf' },
]

export default function AIAnalysis() {
  return (
    <div className="space-y-4">
      <PageHeader title="AI Analysis Result" subtitle="Detailed breakdown of your resume and skills"
        action={
          <button className="btn-outline px-4 py-2 rounded-lg text-xs flex items-center gap-2 border border-white/10">
            <Download className="w-3.5 h-3.5" /> Download Report
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall Score */}
        <SectionCard title="Overall Readiness Score">
          <div className="flex flex-col items-center py-4">
            <RadialScore score={82} size={120} />
            <p className="text-gray-400 text-xs mt-3 text-center">You are well prepared! Keep improving 🎯</p>
          </div>
        </SectionCard>

        {/* Skill Gap Analysis */}
        <SectionCard title="Skill Gap Analysis" className="lg:col-span-2">
          <div className="space-y-3">
            {skills.map(s => (
              <SkillBar key={s.label} label={s.label} value={s.value}
                color={s.value >= 80 ? '#22c55e' : s.value >= 70 ? '#4f8ef7' : '#f5a623'} />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strengths */}
        <SectionCard title="Strengths">
          <div className="space-y-2">
            {strengths.map(s => (
              <div key={s} className="flex items-center gap-3 p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">{s}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recommendations */}
        <SectionCard title="Recommendations">
          <div className="space-y-2">
            {recs.map(r => (
              <div key={r} className="flex items-center gap-3 p-2.5 rounded-lg bg-gold-500/5 border border-gold-500/10">
                <AlertCircle className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">{r}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Career Path Suggestions */}
      <SectionCard title="Career Path Suggestions">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {careerPaths.map(cp => (
            <div key={cp.title} className="glass-card p-4 text-center border border-white/5 hover:border-gold-500/20 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${cp.color}20`, border: `1px solid ${cp.color}30` }}>
                <span className="text-lg">💼</span>
              </div>
              <p className="text-sm font-semibold text-white mb-1">{cp.title}</p>
              <span className="text-xs font-bold font-mono" style={{ color: cp.color }}>{cp.match}% Match</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
