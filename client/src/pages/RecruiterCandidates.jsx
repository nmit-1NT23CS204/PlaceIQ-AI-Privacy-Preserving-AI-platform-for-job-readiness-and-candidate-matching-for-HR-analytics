import React, { useState } from 'react'
import { PageHeader, MatchBadge, StatusBadge, SectionCard } from '../components/UIComponents'
import { Search, Filter, Eye } from 'lucide-react'

const candidates = [
  { name: 'John Doe', email: 'johndoe@example.com', title: 'Data Scientist', skills: ['Python', 'ML'], exp: '3 Yrs', match: 92, status: 'Shortlisted' },
  { name: 'Sarah Smith', email: 'sarah@example.com', title: 'ML Engineer', skills: ['Python', 'TensorFlow'], exp: '4 Yrs', match: 88, status: 'Shortlisted' },
  { name: 'Michael Lee', email: 'michael@example.com', title: 'Backend Developer', skills: ['Node.js', 'Express'], exp: '3 Yrs', match: 85, status: 'Applied' },
  { name: 'Emily Davis', email: 'emily@example.com', title: 'Data Analyst', skills: ['SQL', 'Excel'], exp: '2 Yrs', match: 80, status: 'Applied' },
  { name: 'Alex Johnson', email: 'alex@example.com', title: 'React Developer', skills: ['React', 'TypeScript'], exp: '2 Yrs', match: 76, status: 'Applied' },
]

const badgeColor = { Python: 'python', ML: 'ml', TensorFlow: 'tf', 'Node.js': 'node', Express: 'node', SQL: 'sql', Excel: 'excel', React: 'react', TypeScript: 'react' }

export default function RecruiterCandidates() {
  const [search, setSearch] = useState('')
  const [jobFilter, setJobFilter] = useState('All Jobs')
  const [skillFilter, setSkillFilter] = useState('All Skills')

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Candidates" subtitle="Browse and manage all applicants across your job postings." />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search candidates..." className="input-dark pl-9 text-xs py-2" />
        </div>
        <select value={jobFilter} onChange={e => setJobFilter(e.target.value)}
          className="input-dark text-xs py-2 w-36 bg-dark-600">
          {['All Jobs', 'Data Scientist', 'ML Engineer', 'Backend Developer', 'Data Analyst'].map(j => (
            <option key={j}>{j}</option>
          ))}
        </select>
        <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
          className="input-dark text-xs py-2 w-32 bg-dark-600">
          {['All Skills', 'Python', 'React', 'SQL', 'ML'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <SectionCard title={`Candidates (${filtered.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Job Title', 'Skills', 'Experience', 'Match Score', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left pb-3 text-xs text-gray-500 uppercase tracking-wider font-display pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(c => (
                <tr key={c.email} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500/20 to-accent-blue/20 border border-gold-500/20 flex items-center justify-center text-xs font-bold text-gold-400">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium whitespace-nowrap">{c.name}</p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-300 whitespace-nowrap">{c.title}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-1 flex-wrap">
                      {c.skills.map(s => (
                        <span key={s} className={`badge badge-${badgeColor[s] || 'python'}`}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-400 whitespace-nowrap">{c.exp}</td>
                  <td className="py-3 pr-4"><MatchBadge score={c.match} /></td>
                  <td className="py-3 pr-4"><StatusBadge status={c.status} /></td>
                  <td className="py-3">
                    <button className="btn-outline px-3 py-1.5 rounded-lg text-xs border border-white/10 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <span className="text-xs text-gray-500">Page 1 of 3</span>
          <div className="flex gap-1">
            {[1, 2, 3, '...', 10].map(p => (
              <button key={p} className={`w-7 h-7 rounded text-xs font-mono ${p === 1 ? 'bg-gold-500 text-dark-900' : 'bg-dark-600 text-gray-400 hover:text-white'}`}>{p}</button>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
