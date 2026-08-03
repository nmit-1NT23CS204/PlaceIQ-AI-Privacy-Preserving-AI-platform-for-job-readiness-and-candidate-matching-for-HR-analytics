import React, { useState, useEffect } from 'react'
import { PageHeader, MatchBadge, SectionCard } from '../components/UIComponents'
import { MapPin, Clock, Bookmark, ExternalLink, Filter } from 'lucide-react'

import api from '../utils/api'

const badgeColor = { Python: 'python', 'Machine Learning': 'ml', SQL: 'sql', TensorFlow: 'tf', 'Node.js': 'node', Express: 'node', MongoDB: 'ml', Excel: 'excel', 'Power BI': 'excel', React: 'react', TypeScript: 'react', CSS: 'react', ML: 'ml' }

export default function MatchedJobs() {
  const [tab, setTab] = useState('Best Matches')
  const [saved, setSaved] = useState({})
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const res = await api.get('/jobs/match')
        setJobs(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch jobs')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const tabs = ['Best Matches', 'Recent', 'Saved Jobs']

  const displayJobs = tab === 'Saved Jobs' ? jobs.filter(j => j.saved || saved[j.id]) : jobs

  return (
    <div className="space-y-4">
      <PageHeader title="Matched Jobs" subtitle="AI-curated job matches based on your profile and skills." />

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-dark-700 rounded-lg p-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-display font-semibold uppercase tracking-wider transition-all ${tab === t ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
        <button className="btn-outline px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-white/10">
          <Filter className="w-3 h-3" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <p className="text-gray-400 text-sm">Fetching and matching live jobs from market...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center py-10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : displayJobs.length === 0 ? (
        <div className="flex justify-center py-10">
          <p className="text-gray-400 text-sm">No jobs found.</p>
        </div>
      ) : (
        <div className="space-y-3">
        {displayJobs.map(job => (
          <div key={job.id} className="glass-card p-4 hover:border-gold-500/20 transition-all duration-200 border border-white/5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {job.logo ? (
                  <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-xl object-contain bg-white flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-dark-500 border border-white/10 flex items-center justify-center flex-shrink-0 text-lg">
                    {job.title[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                    <MatchBadge score={job.match} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" />{job.type}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {job.skills.map(s => (
                      <span key={s} className={`badge badge-${badgeColor[s] || 'python'}`}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-gold px-4 py-2 rounded-lg text-xs flex items-center gap-1 justify-center">
                  View <ExternalLink className="w-3 h-3" />
                </a>
                <button onClick={() => setSaved(p => ({ ...p, [job.id]: !p[job.id] }))}
                  className={`btn-outline px-4 py-2 rounded-lg text-xs border border-white/10 flex items-center justify-center ${saved[job.id] || job.saved ? 'text-gold-400' : ''}`}>
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  )
}
