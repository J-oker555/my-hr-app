import { api } from '../lib/api';

export interface CompatibilityStats {
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

export const getCompatibilityStats = async (): Promise<CompatibilityStats> => {
  try {
    const response = await api.get('/api/applications/compatibility_stats/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de compatibilité:', error);
    throw error;
  }
};

export const analyzeCV = async (applicationId: string): Promise<any> => {
  try {
    const response = await api.post(`/api/applications/${applicationId}/analyze_cv/`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'analyse du CV:', error);
    throw error;
  }
};
