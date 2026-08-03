import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, Loader, ChevronDown, Code } from 'lucide-react'
import { PageHeader, SectionCard } from '../components/UIComponents'
import api from '../utils/api'

const ROLES = [
  "Full Stack Developer", "Frontend Developer", "Backend Developer", 
  "Data Scientist", "AI/ML Engineer", "DevOps Engineer"
]

export default function UploadResume() {
  const navigate = useNavigate()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [targetRole, setTargetRole] = useState('')

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (!targetRole) return setError('Please select a career goal first.')
    const f = e.dataTransfer.files[0]
    if (f) startAnalysis(f)
  }

  const handleFile = (e) => {
    if (!targetRole) return setError('Please select a career goal first.')
    const f = e.target.files[0]
    if (f) startAnalysis(f)
  }

  const startAnalysis = async (f) => {
    if (!targetRole) {
      setError('Please select a career goal first.')
      return
    }
    setFile(f)
    setAnalyzing(true)
    setError('')
    
    const formData = new FormData()
    formData.append('file', f)
    formData.append('targetRole', targetRole)

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setResult(res.data.data)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume')
    } finally {
      setAnalyzing(false)
    }
  }

  const steps = [
    'Parsing resume structure',
    'Extracting skills & experience',
    'Running AI analysis',
    'Calculating readiness score',
    'Matching with job database',
  ]

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <PageHeader title="Upload Resume" subtitle="Let AI analyze your skills and match you with the best opportunities." />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      <SectionCard>
        {!done ? (
          analyzing ? (
            <div className="py-10 flex flex-col items-center gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-gold-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
                  <Loader className="w-8 h-8 text-gold-400 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">Analyzing {file?.name}...</p>
                <p className="text-gray-500 text-sm">Our AI is processing your resume</p>
              </div>
              <div className="w-full space-y-2">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 text-sm" style={{ animationDelay: `${i * 0.5}s` }}>
                    <div className="w-4 h-4 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-pulse" />
                    </div>
                    <span className="text-gray-400">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-300 font-semibold mb-2">Select Your Career Goal</label>
                <div className="relative">
                  <select 
                    value={targetRole} 
                    onChange={(e) => {
                      setTargetRole(e.target.value)
                      setError('')
                    }}
                    className="w-full bg-dark-600 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-gold-500/50"
                  >
                    <option value="" disabled>Select a role...</option>
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div
                className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 transition-all duration-300 cursor-pointer ${dragging ? 'border-gold-400 bg-gold-500/5' : 'border-white/10 hover:border-gold-500/30'}`}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => {
                  if (!targetRole) return setError('Please select a career goal first.')
                  document.getElementById('fileInput').click()
                }}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragging ? 'bg-gold-500/20 scale-110' : 'bg-dark-600'}`}>
                  <Upload className={`w-8 h-8 ${dragging ? 'text-gold-400' : 'text-gray-500'}`} />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold mb-1">Drop your resume here</p>
                  <p className="text-gray-500 text-sm">Supports PDF, DOC, DOCX · Max 10MB</p>
                </div>
                <button className="btn-gold px-6 py-2.5 rounded-xl text-sm">Browse File</button>
                <input id="fileInput" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
              </div>
            </div>
          )
        ) : (
          <div className="py-8 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-semibold mb-1">Analysis Complete!</p>
              <p className="text-gray-400 text-sm">Your resume has been analyzed successfully</p>
            </div>
            <div className="flex items-center gap-2 bg-dark-600 rounded-xl p-3 w-full">
              <FileText className="w-5 h-5 text-gold-400" />
              <span className="text-sm text-gray-300 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-green-400">Analyzed ✓</span>
            </div>

            {result && (
              <div className="w-full space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-3 border-gold-500/20">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Readiness Score</p>
                    <p className="text-2xl font-bold text-gold-400">{result.readinessScore}%</p>
                  </div>
                  <div className="glass-card p-3 border-gold-500/20">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Skills Found</p>
                    <p className="text-2xl font-bold text-white">{result.skills?.length || 0}</p>
                  </div>
                </div>

                {result.gapData && (
                  <div className="glass-card p-4 border-white/5">
                    <h3 className="text-sm font-semibold text-white mb-3">Gap Analysis: {result.gapData.target_role}</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Match Percentage</span>
                          <span className="text-gold-400 font-bold">{result.gapData.match_percentage}%</span>
                        </div>
                        <div className="w-full bg-dark-600 rounded-full h-1.5">
                          <div className="bg-gold-500 h-1.5 rounded-full" style={{ width: `${result.gapData.match_percentage}%` }}></div>
                        </div>
                      </div>
                      
                      {result.gapData.missing_skills?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5">Missing Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.gapData.missing_skills.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded border border-red-500/20">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-dark-600 p-3 rounded-lg border border-white/5">
                        <p className="text-xs text-gray-300 leading-relaxed"><span className="text-gold-400 font-semibold">AI Recommendation:</span> {result.gapData.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {result.textPreview && (
                  <div className="glass-card p-4 border-white/5 mt-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-gold-400" />
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Raw Extracted Text Preview</h3>
                    </div>
                    <div className="bg-dark-600 p-3 rounded-lg border border-white/5 max-h-32 overflow-y-auto">
                      <p className="text-xs text-gray-400 whitespace-pre-wrap font-mono">{result.textPreview}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 italic">If the text above looks like random characters or is completely empty, your PDF is image-based or uses unsupported fonts. Please try uploading a .docx file or a standard text-based PDF.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 w-full mt-4">
              <button onClick={() => navigate('/dashboard')} className="btn-gold flex-1 py-3 rounded-xl text-sm">
                Go to Dashboard →
              </button>
              <button onClick={() => { setFile(null); setDone(false); setResult(null); setError('') }} className="btn-outline flex-1 py-3 rounded-xl text-sm border border-white/10">
                Upload Another
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Tips */}
      <SectionCard title="Resume Tips">
        <div className="grid grid-cols-2 gap-2">
          {['Include quantifiable achievements', 'List technical skills clearly', 'Add relevant certifications', 'Use action verbs'].map(t => (
            <div key={t} className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-1 h-1 rounded-full bg-gold-400 flex-shrink-0" />
              {t}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
