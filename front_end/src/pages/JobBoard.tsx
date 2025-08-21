import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { fileToText } from '../utils/fileToText'
import { api } from '../lib/api'

export default function JobBoard() {
  const [jobs, setJobs] = useState<any[]>([])
  const [myApps, setMyApps] = useState<any[]>([])
  const user = useAuthStore(s => s.user)

  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [cvText, setCvText] = useState('')
  const [coverLetterText, setCoverLetterText] = useState('')

  const myApplicationsByJob = useMemo(() => {
    if (!user) return {}
    const map: Record<string, { id: string; status: string; score?: number }> = {}
    for (const a of myApps) {
      if (a.candidate === user.id && a.job) {
        map[a.job] = { id: a.id, status: a.status, score: a.score }
      }
    }
    return map
  }, [myApps, user])

  async function refresh() {
    const [jobsRes, appsRes] = await Promise.all([
      api.get('/api/jobs/'),
      api.get('/api/applications/'),
    ])
    setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data?.results ?? [])
    setMyApps(Array.isArray(appsRes.data) ? appsRes.data : appsRes.data?.results ?? [])
  }

  useEffect(() => { refresh() }, [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await fileToText(file)
    setCvText(text)
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !selectedJobId || !cvText) return
    // Création simple: on crée une application liée au job et au candidat
    await api.post('/api/applications/', { candidate: user.id, job: selectedJobId })
    // Option: une route pour déclencher l'analyse pourrait être appelée ici
    await refresh()
    setCvText('')
    setCoverLetterText('')
    setSelectedJobId('')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Postes publiés</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {jobs.map(job => {
          const id = job.id || job._id
          const myApp = myApplicationsByJob[id]
          const isSelected = selectedJobId === job.id
          return (
            <div key={id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-medium">{job.title}</div>
                  {job.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{job.description}</div>
                  )}
                </div>
                {myApp ? (
                  <span className="text-sm">Ma candidature: {myApp.status} {myApp.score != null ? `· ${myApp.score}%` : ''}</span>
                ) : (
                  <button className="btn" onClick={() => setSelectedJobId(isSelected ? '' : id)}>
                    {isSelected ? 'Annuler' : 'Postuler'}
                  </button>
                )}
              </div>

              <div className="text-sm">
                <div className="mb-1"><span className="text-gray-500">Compétences requises:</span> {(job.required_skills || []).join(', ') || '—'}</div>
              </div>

              {isSelected && !myApp && (
                <form onSubmit={handleApply} className="grid gap-3 border-t pt-3">
                  <div className="grid gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-300">CV (texte)</label>
                    <textarea className="min-h-[120px] rounded-md border px-3 py-2 bg-white dark:bg-gray-900" value={cvText} onChange={e => setCvText(e.target.value)} />
                    <input type="file" aria-label="Uploader CV" onChange={handleFileUpload} />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn" type="submit">Confirmer la candidature</button>
                    <button type="button" className="btn" onClick={() => setSelectedJobId('')}>Annuler</button>
                  </div>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


