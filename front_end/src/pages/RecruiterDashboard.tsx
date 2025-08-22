import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  department: string;
  seniority: string;
  required_skills: string[];
  status: string;
  created_at: string;
  applications_count: number;
}

interface Application {
  id: string;
  candidate: {
    full_name: string;
    email: string;
  };
  job: {
    title: string;
  };
  status: string;
  score: number;
  created_at: string;
  extracted_skills: string[];
  recommendations: string[];
}

interface RecruiterStats {
  total_jobs: number;
  open_jobs: number;
  closed_jobs: number;
  total_applications: number;
  recent_applications: number;
  top_jobs: Array<{
    title: string;
    applications_count: number;
    status: string;
  }>;
}

const RecruiterDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'recruiter') {
      setError('Accès réservé aux recruteurs');
      setLoading(false);
      return;
    }

    fetchRecruiterData();
  }, [user]);

  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les jobs du recruteur
      const jobsResponse = await api.get('/api/jobs/my_jobs/');
      setMyJobs(jobsResponse.data.jobs);
      
      // Récupérer les statistiques
      const statsResponse = await api.get('/api/jobs/recruiter_stats/');
      setStats(statsResponse.data);
      
      // Récupérer toutes les candidatures pour ses jobs
      const applicationsResponse = await api.get('/api/applications/recruiter_applications/');
      setApplications(applicationsResponse.data.applications_by_job);
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Chargement du tableau de bord recruteur...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold mb-2">Erreur</h3>
          <p>{error}</p>
        </div>
        <button 
          onClick={fetchRecruiterData} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  if (user?.role !== 'recruiter') {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h3 className="font-bold mb-2">Accès restreint</h3>
          <p>Cette page est réservée aux recruteurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Recruteur</h1>
        <p className="text-gray-600">Gérez vos offres d'emploi et suivez les candidatures</p>
      </div>

      {/* Statistiques du recruteur */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💼</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_jobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jobs Ouverts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.open_jobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_applications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🆕</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nouvelles (7j)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recent_applications}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mes Jobs */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes Offres d'Emploi</h2>
        
        {myJobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore créé d'offres d'emploi</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Créer ma première offre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">📍</span>
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">🏢</span>
                    {job.department}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">👤</span>
                    {job.seniority}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {job.applications_count} candidature(s)
                  </span>
                  <button 
                    onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {selectedJob === job.id ? 'Masquer' : 'Voir'} candidatures
                  </button>
                </div>
                
                {/* Candidatures pour ce job */}
                {selectedJob === job.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Candidatures pour ce poste</h4>
                    <div className="space-y-2">
                      {applications[job.title] ? (
                        applications[job.title].map((app: Application) => (
                          <div key={app.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-900">{app.candidate.full_name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{app.candidate.email}</div>
                            {app.score > 0 && (
                              <div className="text-sm text-blue-600">
                                Score de compatibilité: {app.score}%
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Aucune candidature pour ce poste</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top des jobs par candidatures */}
      {stats?.top_jobs && stats.top_jobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Jobs les Plus Populaires</h2>
          <div className="space-y-3">
            {stats.top_jobs.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-600 capitalize">{job.status}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{job.applications_count} candidatures</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
