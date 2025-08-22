import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics';
import { getCompatibilityStats } from '../services/applications';

interface AnalyticsData {
  summary: {
    total_users: number;
    total_jobs: number;
    total_applications: number;
    conversion_rate: string;
    avg_processing_time_days: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    by_role: Record<string, number>;
    new_this_month: number;
  };
  jobs: {
    total: number;
    open: number;
    closed: number;
    draft: number;
    by_department: Record<string, number>;
    by_seniority: Record<string, number>;
  };
  applications: {
    total: number;
    avg_score: number;
    by_status: Record<string, number>;
    this_month: number;
  };
  performance: {
    conversion_rate: string;
    avg_processing_time_days: number;
    top_jobs: Array<{
      title: string;
      department: string;
      applications_count: number;
    }>;
  };
}

interface CompatibilityStats {
  total_applications: number;
  average_compatibility: string;
  compatibility_distribution: {
    high_80_100: { count: number; percentage: string };
    medium_60_79: { count: number; percentage: string };
    low_0_59: { count: number; percentage: string };
  };
  top_applications: Array<{
    candidate: string;
    job: string;
    compatibility_score: string;
    status: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [compatibilityStats, setCompatibilityStats] = useState<CompatibilityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Chargement des données...');
        
        const analytics = await analyticsService.getMetrics();
        console.log('✅ Analytics chargés:', analytics);
        setAnalyticsData(analytics);
        
        try {
          const compatibility = await getCompatibilityStats();
          console.log('✅ Compatibilité chargée:', compatibility);
          setCompatibilityStats(compatibility);
        } catch (compError) {
          console.warn('⚠️ Erreur compatibilité:', compError);
        }
        
        setError(null);
      } catch (err) {
        console.error('❌ Erreur Dashboard:', err);
        setError(`Erreur lors du chargement des données: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '128px', 
            height: '128px', 
            border: '4px solid #bfdbfe', 
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Chargement du tableau de bord
          </div>
          <div style={{ color: '#6b7280' }}>Préparation de vos données...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fef2f2 0%, #fce7f3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>😞</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Oups !</h3>
            <p style={{ color: '#6b7280' }}>{error || 'Données non disponibles'}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #e0e7ff 100%)'
    }}>
      {/* Header avec gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #4f46e5 100%)',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
              ✨ Tableau de Bord HR
            </h1>
            <p style={{ fontSize: '20px', opacity: '0.9' }}>
              Votre vue d'ensemble du système de recrutement
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', marginTop: '-24px', paddingBottom: '48px' }}>
        {/* Métriques principales avec cards modernes */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            border: '1px solid #f3f4f6',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Utilisateurs</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>{analyticsData.summary.total_users}</p>
                <p style={{ fontSize: '14px', color: '#059669', marginTop: '4px' }}>↗️ +{analyticsData.users.new_this_month} ce mois</p>
              </div>
              <div style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '32px' }}>👥</span>
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            border: '1px solid #f3f4f6',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Postes Ouverts</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>{analyticsData.jobs.open}</p>
                <p style={{ fontSize: '14px', color: '#2563eb', marginTop: '4px' }}>📊 {analyticsData.summary.total_jobs} total</p>
              </div>
              <div style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '32px' }}>💼</span>
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            border: '1px solid #f3f4f6',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Candidatures</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>{analyticsData.summary.total_applications}</p>
                <p style={{ fontSize: '14px', color: '#7c3aed', marginTop: '4px' }}>📈 {analyticsData.applications.this_month} ce mois</p>
              </div>
              <div style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '32px' }}>📝</span>
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            border: '1px solid #f3f4f6',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Taux de Conversion</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>{analyticsData.summary.conversion_rate}</p>
                <p style={{ fontSize: '14px', color: '#ea580c', marginTop: '4px' }}>⏱️ {analyticsData.summary.avg_processing_time_days}j moy.</p>
              </div>
              <div style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '32px' }}>📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {/* Utilisateurs par rôle */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
              👥 Utilisateurs par Rôle
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(analyticsData.users.by_role).map(([role, count]) => (
                <div key={role} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #f9fafb 0%, #dbeafe 100%)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {role === 'admin' ? '👑' : role === 'recruiter' ? '🎯' : '🙋‍♂️'}
                    </span>
                    <span style={{ color: '#1f2937', fontWeight: '500', textTransform: 'capitalize' }}>
                      {role === 'admin' ? 'Administrateurs' : role === 'recruiter' ? 'Recruteurs' : 'Candidats'}
                    </span>
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statut des candidatures */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
              📋 Statut des Candidatures
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(analyticsData.applications.by_status).map(([status, count]) => (
                <div key={status} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #f9fafb 0%, #dcfce7 100%)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {status === 'received' ? '📨' : 
                       status === 'reviewing' ? '👀' :
                       status === 'shortlisted' ? '⭐' :
                       status === 'rejected' ? '❌' : '✅'}
                    </span>
                    <span style={{ color: '#1f2937', fontWeight: '500', textTransform: 'capitalize' }}>
                      {status === 'received' ? 'Reçues' : 
                       status === 'reviewing' ? 'En cours' :
                       status === 'shortlisted' ? 'Présélectionnées' :
                       status === 'rejected' ? 'Rejetées' : 'Embauchées'}
                    </span>
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top des postes avec design amélioré */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          border: '1px solid #f3f4f6'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
            🔥 Postes les Plus Populaires
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {analyticsData.performance.top_jobs.map((job, index) => (
              <div key={index} style={{ 
                padding: '24px', 
                border: '2px solid #f3f4f6', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontSize: '24px' }}>💼</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                      {job.applications_count}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>candidatures</div>
                  </div>
                </div>
                <h4 style={{ fontWeight: '600', color: '#1f2937', fontSize: '18px', marginBottom: '8px' }}>{job.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  <span style={{ marginRight: '8px' }}>🏢</span>
                  {job.department}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                    <div 
                      style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                        height: '8px',
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease',
                        width: `${Math.min((job.applications_count / Math.max(...analyticsData.performance.top_jobs.map(j => j.applications_count))) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


