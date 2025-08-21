import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const user = useAuthStore(s => s.user)
  const [title, setTitle] = useState('Développeur Frontend')
  const [required, setRequired] = useState('React, TypeScript')
  const [nice, setNice] = useState('Node, AWS')
  const [description, setDescription] = useState('')

  async function refresh(){
    const { data } = await api.get('/api/jobs/')
    setJobs(data)
  }

  useEffect(() => { refresh() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const required_skills = required.split(',').map(s => s.trim()).filter(Boolean)
    const nice_to_have = nice.split(',').map(s => s.trim()).filter(Boolean)
    await api.post('/api/jobs/', { title, description, required_skills, nice_to_have })
    await refresh()
    setTitle('')
    setRequired('')
    setNice('')
    setDescription('')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Postes</h1>

      <form onSubmit={handleAdd} className="card p-4 grid gap-3">
        <input className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" placeholder="Compétences requises (séparées par virgule)" value={required} onChange={e => setRequired(e.target.value)} />
        <input className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" placeholder="Nice-to-have (séparées par virgule)" value={nice} onChange={e => setNice(e.target.value)} />
        <textarea className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <button className="btn justify-self-start">Ajouter</button>
      </form>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Titre</th>
              <th className="p-3">Requis</th>
              <th className="p-3">Nice</th>
              <th className="p-3">Publié par</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j:any) => (
              <tr key={j.id} className="border-t">
                <td className="p-3">{j.title}</td>
                <td className="p-3">
                  <input className="rounded-md border px-2 py-1 bg-white dark:bg-gray-900 w-full" value={(j.required_skills||[]).join(', ')} onChange={async e => { await api.patch(`/api/jobs/${j.id}/`, { required_skills: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean) }); await refresh() }} />
                </td>
                <td className="p-3">
                  <input className="rounded-md border px-2 py-1 bg-white dark:bg-gray-900 w-full" value={(j.nice_to_have ?? []).join(', ')} onChange={async e => { await api.patch(`/api/jobs/${j.id}/`, { nice_to_have: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean) }); await refresh() }} />
                </td>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-300">{j.postedByUserId ? (j.postedByUserId === user?.id ? (user?.name || 'Moi') : j.postedByUserId) : '—'}</td>
                <td className="p-3 text-right">
                  <button className="btn" onClick={async () => { await api.delete(`/api/jobs/${j.id}/`); await refresh() }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


