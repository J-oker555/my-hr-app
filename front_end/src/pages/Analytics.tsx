import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import MetricCard from '../components/charts/MetricCard'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'

interface AnalyticsData {
  summary: {
    total_users: number
    total_jobs: number
    total_applications: number
    conversion_rate: string
    avg_processing_time_days: number
  }
  users: {
    total: number
    active: number
    inactive: number
    by_role: Record<string, number>
    new_this_month: number
  }
  jobs: {
    total: number
    open: number
    closed: number
    draft: number
    by_department: Record<string, number>
    by_seniority: Record<string, number>
  }
  applications: {
    total: number
    avg_score: number
    by_status: Record<string, number>
    this_month: number
  }
  performance: {
    conversion_rate: string
    avg_processing_time_days: number
    top_jobs: Array<{
      title: string
      department: string
      applications_count: number
    }>
  }
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/analytics/metrics/')
      setData(response.data)
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des analytics')
      console.error('Erreur analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement des analytics avancés...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error || 'Données non disponibles'}</div>
        <button 
          onClick={fetchAnalytics}
          className="btn bg-blue-600 hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    )
  }

  // Préparer les données pour les graphiques
  const roleData = Object.entries(data.users.by_role).map(([role, count]) => ({
    label: role === 'admin' ? 'Administrateurs' : role === 'recruiter' ? 'Recruteurs' : 'Candidats',
    value: count,
    color: role === 'admin' ? '#8B5CF6' : role === 'recruiter' ? '#3B82F6' : '#10B981'
  }))

  const statusData = Object.entries(data.applications.by_status).map(([status, count]) => ({
    label: status === 'received' ? 'Reçues' : 
           status === 'reviewing' ? 'En cours' :
           status === 'shortlisted' ? 'Présélectionnées' :
           status === 'rejected' ? 'Rejetées' : 'Embauchées',
    value: count,
    color: status === 'received' ? '#6B7280' :
           status === 'reviewing' ? '#F59E0B' :
           status === 'shortlisted' ? '#3B82F6' :
           status === 'rejected' ? '#EF4444' : '#10B981'
  }))

  const departmentData = Object.entries(data.jobs.by_department).map(([dept, count]) => ({
    label: dept || 'Non spécifié',
    value: count
  }))

  const seniorityData = Object.entries(data.jobs.by_seniority).map(([seniority, count]) => ({
    label: seniority || 'Non spécifié',
    value: count
  }))

  const topJobsData = data.performance.top_jobs.map(job => ({
    label: job.title,
    value: job.applications_count
  }))

  // Calculer les ratios et pourcentages
  const userActivationRate = data.users.total > 0 ? Math.round((data.users.active / data.users.total) * 100) : 0
  const jobOpenRate = data.jobs.total > 0 ? Math.round((data.jobs.open / data.jobs.total) * 100) : 0
  const applicationSuccessRate = data.applications.total > 0 ? Math.round((data.applications.avg_score / 100) * 100) : 0

  return (
    <div className="space-y-8">
      {/* En-tête avec filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Avancés</h1>
          <p className="text-gray-600 mt-2">Analyse détaillée des performances et tendances</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Trimestre'}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchAnalytics}
            className="btn bg-blue-600 hover:bg-blue-700"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Métriques de performance clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Taux d'Activation"
          value={`${userActivationRate}%`}
          icon="✅"
          color="green"
          subtitle={`${data.users.active}/${data.users.total} utilisateurs`}
        />
        <MetricCard
          title="Taux d'Emploi"
          value={`${jobOpenRate}%`}
          icon="💼"
          color="blue"
          subtitle={`${data.jobs.open}/${data.jobs.total} postes`}
        />
        <MetricCard
          title="Taux de Réussite"
          value={`${applicationSuccessRate}%`}
          icon="🎯"
          color="orange"
          subtitle={`Score moyen: ${data.applications.avg_score.toFixed(1)}`}
        />
        <MetricCard
          title="Efficacité Recrutement"
          value={data.summary.conversion_rate}
          icon="📊"
          color="purple"
          subtitle={`${data.summary.avg_processing_time_days}j de traitement`}
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition des utilisateurs */}
        <PieChart
          data={roleData}
          title="Distribution des Utilisateurs par Rôle"
        />

        {/* Statut des candidatures */}
        <PieChart
          data={statusData}
          title="Répartition des Candidatures par Statut"
        />
      </div>

      {/* Graphiques en barres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Postes par département */}
        <BarChart
          data={departmentData}
          title="Répartition des Postes par Département"
          height={300}
        />

        {/* Postes par niveau de seniorité */}
        <BarChart
          data={seniorityData}
          title="Répartition des Postes par Niveau"
          height={300}
        />
      </div>

      {/* Top des postes populaires */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Top des Postes les Plus Populaires</h3>
        <div className="space-y-4">
          {topJobsData.map((job, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{job.label}</h4>
                  <p className="text-sm text-gray-600">{job.value} candidatures</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{job.value}</div>
                <div className="text-sm text-gray-500">candidatures</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau de bord détaillé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Détails utilisateurs */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Détails Utilisateurs</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-2xl">{data.users.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Actifs</span>
              <span className="font-medium text-green-600">{data.users.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inactifs</span>
              <span className="font-medium text-red-600">{data.users.inactive}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nouveaux ce mois</span>
              <span className="font-medium text-blue-600">{data.users.new_this_month}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux d'activation</span>
                <span className="font-bold text-green-600">{userActivationRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Détails postes */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💼 Détails Postes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-2xl">{data.jobs.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ouverts</span>
              <span className="font-medium text-green-600">{data.jobs.open}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fermés</span>
              <span className="font-medium text-red-600">{data.jobs.closed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Brouillons</span>
              <span className="font-medium text-gray-600">{data.jobs.draft}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux d'ouverture</span>
                <span className="font-bold text-blue-600">{jobOpenRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Détails candidatures */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Détails Candidatures</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-2xl">{data.applications.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Score moyen</span>
              <span className="font-medium text-orange-600">{data.applications.avg_score.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ce mois</span>
              <span className="font-medium text-blue-600">{data.applications.this_month}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Par jour</span>
              <span className="font-medium text-green-600">
                {Math.round(data.applications.this_month / 30)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux de réussite</span>
                <span className="font-bold text-green-600">{applicationSuccessRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights et recommandations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Insights et Recommandations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-blue-800">
              <strong>Utilisateurs :</strong> {data.users.new_this_month > 0 ? 
                `Croissance de ${data.users.new_this_month} utilisateurs ce mois` : 
                'Aucun nouvel utilisateur ce mois'
              }
            </p>
            <p className="text-blue-800">
              <strong>Postes :</strong> {data.jobs.open > 0 ? 
                `${data.jobs.open} postes ouverts actuellement` : 
                'Aucun poste ouvert actuellement'
              }
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-blue-800">
              <strong>Performance :</strong> Taux de conversion de {data.summary.conversion_rate} 
              avec un temps de traitement moyen de {data.summary.avg_processing_time_days} jours
            </p>
            <p className="text-blue-800">
              <strong>Efficacité :</strong> {data.performance.top_jobs.length > 0 ? 
                `${data.performance.top_jobs[0].title} est le poste le plus populaire` : 
                'Pas assez de données pour analyser la popularité'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
