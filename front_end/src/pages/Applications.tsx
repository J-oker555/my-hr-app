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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              📝 Candidatures
            </h1>
            <p className="text-xl opacity-90">
              Suivi des candidatures et analyse des profils
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 pb-12">
        {/* En-tête avec bouton rafraîchir */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Gestion des Candidatures</h2>
              <p className="text-gray-600">Analysez et suivez vos candidats</p>
            </div>
          </div>
          <button 
            onClick={() => refresh()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🔄 Rafraîchir
          </button>
        </div>

        {/* Tableau des candidatures */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">Liste des Candidatures</h3>
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600">Chargement des candidatures...</div>
            </div>
          ) : visibleApplications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-xl text-gray-500 mb-2">Aucune candidature trouvée</div>
              <div className="text-gray-400">Les candidatures apparaîtront ici</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">👤 Candidat</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">💼 Poste</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">⭐ Score</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">🎯 Compatibilité</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">📊 Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {visibleApplications.map((a:any) => {
                    const userId = typeof a.candidate === 'string' ? a.candidate : (a.candidate?.id || a.candidate?._id)
                    const jobId = typeof a.job === 'string' ? a.job : (a.job?.id || a.job?._id)
                    const candidateName = a.full_name || a.fullName || userMap[userId]?.full_name || userMap[userId]?.name || '—'
                    const jobTitle = a.position || a.job_title || jobMap[jobId]?.title || '—'
                    const compatibilityScore = a.compatibilityPct != null ? a.compatibilityPct : (a.score || 0)
                    
                    return (
                      <tr key={a.id || a._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
                        <td className="px-8 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-purple-600">
                                {candidateName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm font-semibold text-gray-900">{candidateName}</div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="text-sm text-gray-600 font-medium">{jobTitle}</div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="text-lg font-bold text-blue-600">{a.score ?? '—'}</div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  compatibilityScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                  compatibilityScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                  'bg-gradient-to-r from-red-400 to-red-600'
                                }`}
                                style={{ width: `${Math.min(compatibilityScore, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">
                              {compatibilityScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`inline-flex items-center px-3 py-2 text-sm font-semibold rounded-full ${
                            a.status === 'received' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' :
                            a.status === 'reviewing' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' :
                            a.status === 'shortlisted' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' :
                            a.status === 'rejected' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300' :
                            'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                          }`}>
                            <span className="w-2 h-2 rounded-full mr-2 ${
                              a.status === 'received' ? 'bg-blue-500' :
                              a.status === 'reviewing' ? 'bg-yellow-500' :
                              a.status === 'shortlisted' ? 'bg-green-500' :
                              a.status === 'rejected' ? 'bg-red-500' :
                              'bg-gray-500'
                            }"></span>
                            {a.status === 'received' ? 'Reçue' :
                             a.status === 'reviewing' ? 'En cours' :
                             a.status === 'shortlisted' ? 'Présélectionnée' :
                             a.status === 'rejected' ? 'Rejetée' :
                             a.status || '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


