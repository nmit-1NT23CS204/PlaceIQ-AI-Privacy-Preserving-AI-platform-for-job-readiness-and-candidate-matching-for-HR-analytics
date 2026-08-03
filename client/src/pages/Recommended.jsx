import React, { useState } from 'react'
import { PageHeader, SkillBar, SectionCard } from '../components/UIComponents'
import { Star, Clock, Play } from 'lucide-react'

const courses = [
  { id: 1, title: 'Complete Python Course', subtitle: 'Beginner to Advanced', rating: 4.8, hours: 12, students: '45K', color: '#4f8ef7', emoji: '🐍', type: 'Courses' },
  { id: 2, title: 'Improve SQL Skills', subtitle: 'Master SQL for Data', rating: 4.9, hours: 8, students: '31K', color: '#22c55e', emoji: '🗄️', type: 'Courses' },
  { id: 3, title: 'Build 2 Projects', subtitle: 'Enhance your portfolio', rating: 4.9, hours: 6, students: '39K', color: '#7c5cbf', emoji: '🔨', type: 'Projects' },
  { id: 4, title: 'Machine Learning A-Z', subtitle: 'Learn ML from scratch', rating: 4.8, hours: 20, students: '22K', color: '#f5a623', emoji: '🤖', type: 'Courses' },
]

const skillsToImprove = [
  { label: 'React', level: 'Advanced Level', value: 85, color: '#22d3ee' },
  { label: 'Data Structures', level: 'Advanced Level', value: 70, color: '#f5a623' },
  { label: 'Communication', level: 'Intermediate Level', value: 60, color: '#7c5cbf' },
]

const tabs = ['All', 'Courses', 'Projects', 'Jobs', 'Skills']

export default function Recommended() {
  const [tab, setTab] = useState('All')

  const filtered = tab === 'All' ? courses : courses.filter(c => c.type === tab)

  return (
    <div className="space-y-4">
      <PageHeader title="Recommended" subtitle="Personalized recommendations to accelerate your career." />

      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-display font-semibold uppercase tracking-wider transition-all ${tab === t ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filtered.map(c => (
          <div key={c.id} className="glass-card p-4 hover:border-gold-500/20 transition-all border border-white/5 cursor-pointer group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: `${c.color}20`, border: `1px solid ${c.color}30` }}>
              {c.emoji}
            </div>
            <h3 className="text-sm font-semibold text-white mb-0.5">{c.title}</h3>
            <p className="text-xs text-gray-500 mb-3">{c.subtitle}</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                <span className="text-xs text-gray-300">{c.rating}</span>
              </div>
              <span className="text-gray-600">·</span>
              <div className="flex items-center gap-0.5">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-400">{c.hours}h</span>
              </div>
            </div>
            <button className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group-hover:opacity-100"
              style={{ background: `${c.color}20`, color: c.color, border: `1px solid ${c.color}30` }}>
              <Play className="w-3 h-3" /> Start Now
            </button>
          </div>
        ))}
      </div>

      <SectionCard title="Top Skills to Improve">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {skillsToImprove.map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-dark-600 border border-white/5 space-y-3">
              <div>
                <p className="text-sm font-semibold text-white">{s.label}</p>
                <p className="text-xs text-gray-500">{s.level}</p>
              </div>
              <SkillBar label="" value={s.value} color={s.color} />
              <button className="w-full py-2 rounded-lg text-xs font-semibold" style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}30` }}>
                Start Learning
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
