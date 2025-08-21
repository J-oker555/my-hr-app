import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  async function refresh(){
    setLoading(true)
    try {
      const [appsRes, usersRes, jobsRes] = await Promise.all([
        api.get('/api/applications/', { params: { _ts: Date.now() } }),
        api.get('/api/accounts/users/', { params: { _ts: Date.now() } }),
        api.get('/api/jobs/', { params: { _ts: Date.now() } }),
      ])
      const list = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data?.results ?? appsRes.data?.items ?? [])
      setApplications(list)
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.results ?? usersRes.data?.items ?? []))
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data?.results ?? jobsRes.data?.items ?? []))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const visibleApplications = applications
  const userMap = useMemo(() => Object.fromEntries(users.map((u:any)=>[u.id||u._id,u])), [users])
  const jobMap = useMemo(() => Object.fromEntries(jobs.map((j:any)=>[j.id||j._id,j])), [jobs])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Candidatures</h1>
        <button className="btn" onClick={() => refresh()}>Rafraîchir</button>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Candidat</th>
              <th className="p-3">Poste</th>
              <th className="p-3">Score</th>
              <th className="p-3">Compatibilité</th>
              <th className="p-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td className="p-3 text-sm text-gray-500" colSpan={5}>Chargement…</td></tr>)}
            {!loading && visibleApplications.length === 0 && (<tr><td className="p-3 text-sm text-gray-500" colSpan={5}>Aucune candidature</td></tr>)}
            {!loading && visibleApplications.map((a:any) => {
              const userId = typeof a.candidate === 'string' ? a.candidate : (a.candidate?.id || a.candidate?._id)
              const jobId = typeof a.job === 'string' ? a.job : (a.job?.id || a.job?._id)
              const candidateName = a.full_name || a.fullName || userMap[userId]?.full_name || userMap[userId]?.name || '—'
              const jobTitle = a.position || a.job_title || jobMap[jobId]?.title || '—'
              return (
              <tr key={a.id || a._id} className="border-t">
                <td className="p-3">{candidateName}</td>
                <td className="p-3">{jobTitle}</td>
                <td className="p-3">{a.score ?? '—'}</td>
                <td className="p-3">{a.compatibilityPct != null ? `${a.compatibilityPct}%` : '—'}</td>
                <td className="p-3">{a.status || '—'}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}


