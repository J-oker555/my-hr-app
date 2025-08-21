import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'recruiter' | 'candidate'>('recruiter')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function refresh() {
    const { data } = await api.get('/api/accounts/users/', { params: { _ts: Date.now() } })
    let list: any[] = []
    if (Array.isArray(data)) list = data
    else if (Array.isArray(data?.results)) list = data.results
    else if (Array.isArray(data?.items)) list = data.items
    else if (Array.isArray(data?.users)) list = data.users
    else if (data && typeof data === 'object') {
      // Heuristic: pick first array value in object
      const firstArr = Object.values(data).find(v => Array.isArray(v)) as any[] | undefined
      if (firstArr) list = firstArr
    }
    setUsers(list)
  }

  useEffect(() => { refresh() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name || !email) { setError('Nom et email requis'); return }
    if (!password) { setError('Mot de passe requis'); return }
    setLoadingAdd(true)
    try {
      const { data } = await api.post('/api/accounts/auth/register/', {
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role,
      })
      // Ajouter immédiatement l'utilisateur renvoyé, puis rafraîchir pour rester source-of-truth API
      if (data?.user) setUsers(prev => [data.user, ...prev])
      await refresh()
      setName('')
      setEmail('')
      setPassword('')
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Erreur lors de la création'
      setError(msg)
    } finally {
      setLoadingAdd(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Utilisateurs</h1>
        <button className="btn" onClick={() => refresh()}>Rafraîchir</button>
      </div>
      <form onSubmit={handleAdd} className="card p-4 grid gap-3 sm:grid-cols-5">
        <input placeholder="Nom" className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Mot de passe" type="password" className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" value={password} onChange={e => setPassword(e.target.value)} />
        <select className="rounded-md border px-3 py-2 bg-white dark:bg-gray-900" value={role} onChange={e => setRole(e.target.value as any)}>
          <option value="admin">Admin</option>
          <option value="recruiter">Recruteur</option>
          <option value="candidate">Candidat</option>
        </select>
        <button className="btn" disabled={loadingAdd}>{loadingAdd ? 'Ajout...' : 'Ajouter'}</button>
      </form>
      {error && (<div className="text-red-600 dark:text-red-400 text-sm">{error}</div>)}

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rôle</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td className="p-3 text-sm text-gray-500" colSpan={4}>Aucun utilisateur</td>
              </tr>
            )}
            {users.map((u: any) => (
              <tr key={u.id || u._id || u.email} className="border-t">
                <td className="p-3">{u.full_name || u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <select className="rounded-md border px-2 py-1 bg-white dark:bg-gray-900" value={u.role} onChange={async e => { await api.patch(`/api/accounts/users/${u.id || u._id}/`, { role: e.target.value }); await refresh() }}>
                    <option value="admin">Admin</option>
                    <option value="recruiter">Recruteur</option>
                    <option value="candidate">Candidat</option>
                  </select>
                </td>
                <td className="p-3 text-right">
                  <button className="btn" disabled={deletingId === u.id} onClick={async () => {
                    if (!confirm('Supprimer cet utilisateur ?')) return
                    setDeletingId(u.id || u._id)
                    try {
                      await api.delete(`/api/accounts/users/${u.id || u._id}/`)
                      await refresh()
                    } catch (e:any) {
                      alert(e?.response?.data?.detail || 'Suppression impossible')
                    } finally {
                      setDeletingId(null)
                    }
                  }}>{deletingId === u.id ? 'Suppression...' : 'Supprimer'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


