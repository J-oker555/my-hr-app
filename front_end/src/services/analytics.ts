import { api } from '../lib/api'

export interface AnalyticsData {
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

export interface DashboardSummary {
  quick_stats: {
    total_users: number
    total_jobs: number
    total_applications: number
    recent_applications: number
    open_jobs: number
    pending_applications: number
  }
}

export const analyticsService = {
  // Récupérer toutes les métriques complètes
  async getMetrics(): Promise<AnalyticsData> {
    const response = await api.get('/api/analytics/metrics/')
    return response.data
  },

  // Récupérer le résumé rapide pour le dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get('/api/analytics/dashboard-summary/')
    return response.data
  },

  // Récupérer les métriques avec anti-cache
  async getMetricsFresh(): Promise<AnalyticsData> {
    const response = await api.get('/api/analytics/metrics/', {
      params: { _ts: Date.now() }
    })
    return response.data
  },

  // Récupérer le résumé avec anti-cache
  async getDashboardSummaryFresh(): Promise<DashboardSummary> {
    const response = await api.get('/api/analytics/dashboard-summary/', {
      params: { _ts: Date.now() }
    })
    return response.data
  }
}
