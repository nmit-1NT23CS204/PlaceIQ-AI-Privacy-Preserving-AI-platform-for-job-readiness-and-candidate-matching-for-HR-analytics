import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageHeader, StatCard, SkillBar, SectionCard } from '../components/UIComponents'
import { Briefcase, Target, Shield, Brain, ChevronRight, Upload, Loader } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../utils/api'


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-gray-400">{label}</p>
        <p className="text-gold-400 font-bold">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [feedbackText, setFeedbackText] = React.useState('')
  const [feedbackLoading, setFeedbackLoading] = React.useState(false)

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackLoading(true);
    try {
      const res = await api.post('/resume/interview-feedback', { text: feedbackText });
      setProfile(res.data.data);
      setFeedbackText('');
    } catch (error) {
      console.error('Failed to submit feedback', error);
    } finally {
      setFeedbackLoading(false);
    }
  }

  const chartData = React.useMemo(() => {
    if (!profile || !profile.readinessHistory || profile.readinessHistory.length === 0) {
      return []
    }
    return profile.readinessHistory.map(item => {
      const date = new Date(item.date)
      return {
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: item.score
      }
    })
  }, [profile])

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/resume/profile')
        setProfile(res.data.data)
      } catch (err) {
        console.log('Profile not found or error fetching')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening with your career journey."
        action={
          <button onClick={() => navigate('/upload-resume')} className="btn-gold px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" /> Upload Resume
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Readiness Score" value={profile ? `${profile.readinessScore}%` : '0%'} icon={Brain} color="gold" trend={profile ? 5 : 0} />
        <StatCard label="Extracted Skills" value={profile ? profile.skills?.length : '0'} sub="Total skills found" icon={Briefcase} color="blue" />
        <StatCard label="Skill Gaps" value={profile ? (profile.skillGaps?.length || '0') : '0'} sub="Skills to improve" icon={Target} color="purple" />
        <StatCard label="Profile Strength" value={profile?.readinessScore > 80 ? 'Elite' : profile?.readinessScore > 60 ? 'Good' : 'Needs Work'} icon={Shield} color="green" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress Chart */}
        <SectionCard title="AI Progress Overview" className="lg:col-span-2"
          action={<span className="text-xs text-gray-500">This Week ▾</span>}>
          <ResponsiveContainer width="100%" height={160}>
            {chartData.length > 0 ? (
              <LineChart data={chartData}>
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#f5a623" strokeWidth={2} dot={{ r: 4, fill: '#f5a623' }}
                  activeDot={{ r: 6, fill: '#f5a623' }} />
              </LineChart>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No progress data available. Upload a resume to start tracking.
              </div>
            )}
          </ResponsiveContainer>
        </SectionCard>

        {/* Top Skills */}
        <SectionCard title="Top Skills">
          <div className="space-y-3">
            {profile?.skills?.slice(0, 5).map(skill => (
              <SkillBar key={skill} label={skill} value={85} // Hardcoded skill level for now as we don't have per-skill scores
                color={profile.readinessScore >= 80 ? '#22c55e' : '#f5a623'} />
            )) || (
              <p className="text-gray-500 text-sm text-center py-4">No skills analyzed yet</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload Resume CTA */}
        <SectionCard title={profile ? "Update Resume" : "Upload Resume"}>
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-gold-500/30 transition-colors cursor-pointer" onClick={() => navigate('/upload-resume')}>
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gold-400" />
            </div>
            <p className="text-gray-400 text-sm text-center">{profile ? "Keep your profile fresh" : "Let's start your AI journey"}</p>
            <button className="btn-gold px-5 py-2 rounded-lg text-xs">{profile ? "Update Resume" : "Browse File"}</button>
          </div>
        </SectionCard>

        {/* AI Recommendations */}
        <SectionCard title="AI Recommendations">
          <div className="space-y-3">
            {profile?.skillGaps?.length > 0 ? profile.skillGaps.slice(0, 3).map((gap, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-dark-600 border border-white/5 hover:border-gold-500/20 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-red-400" />
                <span className="text-sm text-gray-300 flex-1">{gap.suggestion}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">Complete a skill gap analysis to see recommendations</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Interview Feedback Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Submit Feedback */}
        <SectionCard title="Post-Interview Analysis">
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Paste your interview feedback here to update your readiness score and get AI insights.</p>
            <textarea 
              className="w-full bg-dark-600 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-gold-500/50 min-h-[100px]"
              placeholder="e.g. The candidate showed strong problem solving skills but needs to improve on system design..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <button 
              className="btn-gold px-4 py-2 rounded-lg text-xs w-full disabled:opacity-50"
              onClick={handleFeedbackSubmit}
              disabled={feedbackLoading || !feedbackText.trim()}
            >
              {feedbackLoading ? 'Analyzing...' : 'Analyze Feedback'}
            </button>
          </div>
        </SectionCard>

        {/* Feedback History/Insights */}
        <SectionCard title="Latest Interview Insights">
          <div className="space-y-3">
            {profile?.interviewFeedback?.length > 0 ? (
              [...profile.interviewFeedback].reverse().slice(0, 2).map((fb, i) => (
                <div key={i} className="p-3 rounded-lg bg-dark-600 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${fb.sentiment === 'Positive' ? 'text-green-400' : 'text-red-400'}`}>
                      {fb.sentiment} Impact
                    </span>
                    <span className="text-xs text-gray-500">{new Date(fb.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-300">{fb.summary}</p>
                  {fb.competencies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {fb.competencies.map(c => <span key={c} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{c}</span>)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500 py-8">
                No feedback analyzed yet.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
