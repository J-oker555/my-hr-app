import { useEffect, useState } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'candidate'
  })

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/accounts/users/', { params: { _ts: Date.now() } })
      const list = Array.isArray(response.data) ? response.data : (response.data?.results ?? response.data?.items ?? [])
      setUsers(list)
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Tous les champs sont requis')
      return
    }

    try {
      await api.post('/api/accounts/auth/register/', formData)
      setFormData({ full_name: '', email: '', password: '', role: 'candidate' })
      await refresh()
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    try {
      await api.delete(`/api/accounts/users/${userId}/`)
      await refresh()
      setError(null)
    } catch (err: any) {
      setError('Erreur lors de la suppression')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/api/accounts/users/${userId}/`, { role: newRole })
      await refresh()
      setError(null)
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du rôle')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              👥 Gestion des Utilisateurs
            </h1>
            <p className="text-xl opacity-90">
              Administration complète de votre équipe et candidats
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 pb-12">
        {/* En-tête avec bouton rafraîchir */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Utilisateurs du Système</h2>
              <p className="text-gray-600">Gérez les comptes et les rôles</p>
            </div>
          </div>
          <button 
            onClick={refresh}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🔄 Rafraîchir
          </button>
        </div>

        {/* Formulaire de création */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl">
              <span className="text-2xl">➕</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Créer un nouvel utilisateur</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                placeholder="Nom complet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                placeholder="Mot de passe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
              >
                <option value="admin">👑 Administrateur</option>
                <option value="recruiter">🎯 Recruteur</option>
                <option value="candidate">🙋‍♂️ Candidat</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                ➕ Ajouter l'utilisateur
              </button>
            </div>
          </form>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                <span className="text-xl">📋</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Liste des utilisateurs</h2>
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600">Chargement des utilisateurs...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <div className="text-xl text-gray-500 mb-2">Aucun utilisateur trouvé</div>
              <div className="text-gray-400">Commencez par créer votre premier utilisateur</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">👤 Nom</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">📧 Email</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">🎯 Rôle</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">📊 Statut</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">⚡ Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-blue-600">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-medium">{user.email}</div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-300"
                        >
                          <option value="admin">👑 Administrateur</option>
                          <option value="recruiter">🎯 Recruteur</option>
                          <option value="candidate">🙋‍♂️ Candidat</option>
                        </select>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-2 text-sm font-semibold rounded-full ${
                          user.is_active 
                            ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                            : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            user.is_active ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 border border-red-200 hover:border-red-300"
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


