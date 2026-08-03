import React, { useState, useEffect } from 'react'
import { PageHeader, StatCard, SectionCard } from '../components/UIComponents'
import { Users, Activity, Briefcase, FileText, Database, Server, Cpu, HardDrive, Plus, Loader, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../utils/api'

const growthData = [
  { month: 'Jan', users: 900 }, { month: 'Feb', users: 1000 }, { month: 'Mar', users: 1050 },
  { month: 'Apr', users: 1100 }, { month: 'May', users: 1180 }, { month: 'Jun', users: 1200 }, { month: 'Jul', users: 1250 },
]

const appData = [
  { name: 'Applied', value: 60, color: '#4f8ef7' },
  { name: 'Shortlisted', value: 20, color: '#f5a623' },
  { name: 'Interview', value: 10, color: '#7c5cbf' },
  { name: 'Hired', value: 10, color: '#22c55e' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-gray-400">{label}</p>
        <p className="text-gold-400 font-bold">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, drivesRes] = await Promise.all([
          api.get('/tpo/analytics'),
          api.get('/tpo/drives')
        ])
        setStats(statsRes.data.data)
        setDrives(drivesRes.data.data)
      } catch (err) {
        console.error('Error fetching admin data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  const appData = stats?.applicationStats?.length > 0 
    ? stats.applicationStats.map(s => ({
        name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
        value: s.count,
        color: s._id === 'offered' ? '#22c55e' : s._id === 'shortlisted' ? '#f5a623' : '#4f8ef7'
      }))
    : [
        { name: 'Applied', value: 100, color: '#4f8ef7' }
      ]
  const systemStatus = [
    { label: 'System Status', value: 'Running', color: 'text-green-400 bg-green-500/10', icon: Server },
    { label: 'AI Model Status', value: 'Active', color: 'text-blue-400 bg-blue-500/10', icon: Cpu },
    { label: 'Database', value: 'Connected', color: 'text-purple-400 bg-purple-500/10', icon: Database },
    { label: 'Storage Used', value: '45%', color: 'text-gold-400 bg-gold-500/10', icon: HardDrive },
  ]

  return (
    <div className="space-y-4">
      <PageHeader 
        title="TPO Dashboard" 
        subtitle="Institutional placement analytics and drive management." 
        action={
          <button className="btn-gold px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Drive
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Students" value={stats?.totalStudents || '0'} icon={Users} color="blue" />
        <StatCard label="Active Drives" value={drives?.length || '0'} icon={Briefcase} color="gold" />
        <StatCard label="Avg Readiness" value={stats ? `${Math.round(stats.overallReadiness)}%` : '0%'} icon={Cpu} color="green" />
        <StatCard label="Total Applications" value={stats?.applicationStats?.reduce((a, b) => a + b.count, 0) || '0'} icon={FileText} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="User Growth">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={growthData}>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[800, 1300]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="users" fill="#f5a623" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Applications Overview">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie data={appData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {appData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {appData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-gray-400">{d.name}</span>
                  <span className="text-xs font-mono ml-auto" style={{ color: d.color }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Placement Drives */}
      <SectionCard title="Live Placement Drives" 
        action={<button className="text-xs text-gold-400 font-semibold hover:underline">View All</button>}>
        <div className="space-y-3">
          {drives?.length > 0 ? drives.slice(0, 5).map(drive => (
            <div key={drive._id} className="flex items-center gap-4 p-3 rounded-xl bg-dark-600 border border-white/5 hover:border-gold-500/20 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-dark-500 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{drive.title}</p>
                <p className="text-xs text-gray-500">{drive.company} · Deadline: {new Date(drive.deadline).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${drive.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {drive.status}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-sm text-center py-8">No active drives found</p>
          )}
        </div>
      </SectionCard>

      {/* Institutional Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Institutional Highlights" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-xs text-gray-500 uppercase mb-1">Top Skills in Campus</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Python', 'React', 'SQL', 'Java', 'NLP'].map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-dark-600 text-blue-400 border border-blue-400/20">{s}</span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/10">
              <p className="text-xs text-gray-500 uppercase mb-1">AI Readiness Trend</p>
              <p className="text-xl font-bold text-gold-400">+12% <span className="text-xs font-normal text-gray-500 ml-1">vs last month</span></p>
            </div>
          </div>
        </SectionCard>
        
        <SectionCard title="Quick Actions">
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg bg-dark-600 hover:bg-gold-500/10 text-sm text-gray-300 transition-colors">Generate Placement Report</button>
            <button className="w-full text-left p-3 rounded-lg bg-dark-600 hover:bg-gold-500/10 text-sm text-gray-300 transition-colors">Broadcast Student Alert</button>
            <button className="w-full text-left p-3 rounded-lg bg-dark-600 hover:bg-gold-500/10 text-sm text-gray-300 transition-colors">Configure AI Thresholds</button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
