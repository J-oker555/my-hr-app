import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const user = useAuthStore(s => s.user)
  const [title, setTitle] = useState('Développeur Frontend')
  const [required, setRequired] = useState('React, TypeScript')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'open' | 'closed'>('open')
  const [location, setLocation] = useState('')
  const [department, setDepartment] = useState('')
  const [seniority, setSeniority] = useState('')

  async function refresh(){
    setLoading(true)
    try {
      const { data } = await api.get('/api/jobs/', { params: { _ts: Date.now() } })
      const list = Array.isArray(data) ? data : (data?.results ?? data?.items ?? [])
      setJobs(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoadingAdd(true)
    try {
      const required_skills = required.split(',').map(s => s.trim()).filter(Boolean)
      // Backend n'a pas de champ "nice_to_have" → on ne l'envoie pas
      await api.post('/api/jobs/', {
        title: title.trim(),
        description: description.trim(),
        required_skills,
        location: location.trim() || undefined,
        department: department.trim() || undefined,
        seniority: seniority.trim() || undefined,
        status,
      })
      await refresh()
      setTitle('')
      setRequired('')
      setDescription('')
      setLocation('')
      setDepartment('')
      setSeniority('')
    } catch (err:any) {
      setError(err?.response?.data?.detail || 'Erreur lors de la création du poste')
    } finally {
      setLoadingAdd(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Postes</h1>

      <form onSubmit={handleAdd} className="card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" placeholder="Compétences requises (séparées par virgule)" value={required} onChange={e => setRequired(e.target.value)} />
        <input className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" placeholder="Localisation" value={location} onChange={e => setLocation(e.target.value)} />
        <input className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" placeholder="Département" value={department} onChange={e => setDepartment(e.target.value)} />
        <input className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" placeholder="Séniorité (junior/mid/senior)" value={seniority} onChange={e => setSeniority(e.target.value)} />
        <select className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" value={status} onChange={e => setStatus(e.target.value as any)}>
          <option value="open">Ouvert</option>
          <option value="closed">Fermé</option>
        </select>
        <textarea className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900 col-span-full" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <button className="btn justify-self-start" disabled={loadingAdd}>{loadingAdd ? 'Ajout...' : 'Ajouter'}</button>
      </form>
      {error && (<div className="text-red-600 dark:text-red-400 text-sm">{error}</div>)}

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Titre</th>
              <th className="p-3">Description</th>
              <th className="p-3">Localisation</th>
              <th className="p-3">Département</th>
              <th className="p-3">Séniorité</th>
              <th className="p-3">Compétences requises</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Créé le</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-3 text-sm text-gray-500" colSpan={9}>Chargement…</td></tr>
            )}
            {!loading && jobs.length === 0 && (
              <tr><td className="p-3 text-sm text-gray-500" colSpan={9}>Aucun poste</td></tr>
            )}
            {!loading && jobs.map((j:any) => (
              <tr key={j.id || j._id} className="border-t">
                <td className="p-3">{j.title}</td>
                <td className="p-3">{j.description || '—'}</td>
                <td className="p-3">{j.location || '—'}</td>
                <td className="p-3">{j.department || '—'}</td>
                <td className="p-3">{j.seniority || '—'}</td>
                <td className="p-3">{(j.required_skills || []).join(', ')}</td>
                <td className="p-3">{j.status || 'open'}</td>
                <td className="p-3">{j.created_at ? new Date(j.created_at).toLocaleString() : '—'}</td>
                <td className="p-3 text-right">
                  <button className="btn" onClick={async () => { await api.delete(`/api/jobs/${j.id || j._id}/`); await refresh() }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


