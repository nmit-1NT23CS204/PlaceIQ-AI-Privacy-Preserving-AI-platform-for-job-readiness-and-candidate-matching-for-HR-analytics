import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PageHeader, SkillBar, SectionCard } from '../components/UIComponents'
import { MapPin, Mail, Plus, CheckCircle, Upload, Edit3 } from 'lucide-react'

const skills = [
  { label: 'Python', value: 90 }, { label: 'React', value: 80 },
  { label: 'SQL', value: 70 }, { label: 'Machine Learning', value: 80 }, { label: 'Communication', value: 75 },
]

const profileTasks = [
  { label: 'Add Skills', done: false },
  { label: 'Upload Resume', done: true },
  { label: 'Complete Profile', done: false },
  { label: 'Add Experience', done: false },
]

const tabs = ['Overview', 'Education', 'Experience', 'Skills', 'Certificates']

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Overview')
  const strength = 75

  return (
    <div className="space-y-4">
      <PageHeader title="Profile" subtitle="Manage your personal and professional information." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Profile Card */}
        <div className="space-y-3">
          <SectionCard>
            <div className="text-center pb-4">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500/20 to-accent-blue/20 border-2 border-gold-500/30 flex items-center justify-center text-2xl font-bold font-display text-gold-400">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'JD'}
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
                  <Edit3 className="w-3 h-3 text-dark-900" />
                </button>
              </div>
              <h2 className="text-lg font-bold font-display text-white">{user?.name || 'John Doe'}</h2>
              <p className="text-sm text-gray-400 mt-0.5">Full Stack Developer</p>
              <div className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-500">
                <Mail className="w-3 h-3" /> {user?.email || 'johndoe@example.com'}
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5 text-xs text-gray-500">
                <MapPin className="w-3 h-3" /> {user?.location || 'New York, USA'}
              </div>
              <button className="btn-outline w-full mt-3 py-2 rounded-lg text-xs border border-white/10">Edit Profile</button>
            </div>
          </SectionCard>

          {/* Profile Strength */}
          <SectionCard title="Profile Strength">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white font-display">Good</span>
                <span className="text-gold-400 font-mono font-bold">{strength}%</span>
              </div>
              <div className="skill-bar-track">
                <div className="skill-bar-fill bg-gold-500" style={{ width: `${strength}%` }} />
              </div>
              <div className="space-y-1.5 mt-2">
                {profileTasks.map(t => (
                  <div key={t.label} className="flex items-center gap-2">
                    <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${t.done ? 'text-green-400' : 'text-gray-600'}`} />
                    <span className={`text-xs ${t.done ? 'text-gray-400 line-through' : 'text-gray-300'}`}>{t.label}</span>
                    {!t.done && <Plus className="w-3 h-3 text-gold-400 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right: Detail Panel */}
        <div className="lg:col-span-2 space-y-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-dark-700 rounded-lg p-1 overflow-x-auto">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-display font-semibold whitespace-nowrap uppercase tracking-wider transition-all ${activeTab === t ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>

          {activeTab === 'Overview' && (
            <div className="space-y-3">
              <SectionCard title="About Me">
                <p className="text-sm text-gray-400 leading-relaxed">Passionate about Data Science and AI. Always eager to learn new technologies and solve real world problems. Seeking opportunities to grow in ML and software engineering.</p>
              </SectionCard>
              <SectionCard title="Skills">
                <div className="space-y-3">
                  {skills.map(s => (
                    <SkillBar key={s.label} label={s.label} value={s.value}
                      color={s.value >= 80 ? '#22c55e' : '#4f8ef7'} />
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === 'Education' && (
            <SectionCard title="Education">
              <div className="space-y-3">
                {[
                  { degree: 'B.Tech Computer Science', school: 'Nitte Meenakshi Institute of Technology', year: '2021–2025', gpa: '8.7 CGPA' },
                  { degree: 'Higher Secondary (CBSE)', school: 'St. Xavier\'s School', year: '2019–2021', gpa: '92%' },
                ].map(e => (
                  <div key={e.degree} className="p-3 rounded-xl bg-dark-600 border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-white">{e.degree}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{e.school}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gold-400 font-mono">{e.gpa}</p>
                        <p className="text-xs text-gray-500">{e.year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {activeTab === 'Experience' && (
            <SectionCard title="Experience">
              <div className="space-y-3">
                {[
                  { role: 'ML Intern', company: 'TechStart Labs', period: 'Jun–Aug 2024', desc: 'Developed ML models for customer churn prediction. Achieved 88% accuracy.' },
                  { role: 'Web Dev Intern', company: 'CodeBase Inc.', period: 'Dec–Feb 2024', desc: 'Built React dashboards and REST APIs for internal tools.' },
                ].map(e => (
                  <div key={e.role} className="p-3 rounded-xl bg-dark-600 border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-semibold text-white">{e.role}</p>
                      <span className="text-xs text-gray-500 font-mono">{e.period}</span>
                    </div>
                    <p className="text-xs text-gold-400 mb-1">{e.company}</p>
                    <p className="text-xs text-gray-400">{e.desc}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {activeTab === 'Skills' && (
            <SectionCard title="All Skills">
              <div className="grid grid-cols-2 gap-3">
                {['Python', 'React', 'SQL', 'Machine Learning', 'Node.js', 'MongoDB', 'TensorFlow', 'Git', 'Docker', 'AWS Basics'].map(s => (
                  <div key={s} className="flex items-center gap-2 p-2 rounded-lg bg-dark-600 border border-white/5 text-xs text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                    {s}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {activeTab === 'Certificates' && (
            <SectionCard title="Certificates">
              <div className="space-y-2">
                {['Python for Data Science – IBM', 'Machine Learning – Stanford (Coursera)', 'React Developer – Meta', 'AWS Cloud Practitioner'].map(c => (
                  <div key={c} className="flex items-center gap-3 p-3 rounded-lg bg-dark-600 border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-sm">🏅</div>
                    <span className="text-sm text-gray-300">{c}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
