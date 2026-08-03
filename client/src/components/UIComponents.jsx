import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-wide">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, sub, icon: Icon, trend, color = 'gold' }) {
  const colors = {
    gold: 'text-gold-400 bg-gold-500/10',
    blue: 'text-accent-blue bg-accent-blue/10',
    green: 'text-accent-green bg-accent-green/10',
    purple: 'text-accent-purple bg-accent-purple/10',
  }
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-xs font-display uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-bold font-display text-white">{value}</span>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs ${trend >= 0 ? 'text-accent-green' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <span className="text-gray-500 text-xs">{sub}</span>}
    </div>
  )
}

export function SkillBar({ label, value, color = '#f5a623' }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-mono text-gray-300">{value}%</span>
      </div>
      <div className="skill-bar-track">
        <div className="skill-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

export function RadialScore({ score, size = 80, label }) {
  const r = (size / 2) * 0.75
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={size * 0.075} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f5a623" strokeWidth={size * 0.075}
            strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-gold-400 font-bold font-display" style={{ fontSize: size * 0.2 }}>{score}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-400 text-center">{label}</span>}
    </div>
  )
}

export function Badge({ text, type = 'python' }) {
  return <span className={`badge badge-${type}`}>{text}</span>
}

export function SectionCard({ title, children, action, className = '' }) {
  return (
    <div className={`glass-card p-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white font-display uppercase tracking-wider">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function MatchBadge({ score }) {
  const color = score >= 90 ? '#22c55e' : score >= 80 ? '#4f8ef7' : '#f5a623'
  return (
    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
      {score}% Match
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    Active: 'bg-green-500/20 text-green-400',
    Shortlisted: 'bg-gold-500/20 text-gold-400',
    Applied: 'bg-blue-500/20 text-blue-400',
    Closed: 'bg-red-500/20 text-red-400',
    Interview: 'bg-purple-500/20 text-purple-400',
  }
  return <span className={`badge ${map[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>
}
