import React from 'react';

interface CompatibilityScore {
  overall_score: number;
  skills_match: number;
  experience_match: number;
  semantic_similarity: number;
}

interface CompatibilityChartProps {
  compatibility: CompatibilityScore;
  candidateName: string;
  jobTitle: string;
  extractedSkills: string[];
  recommendations: string[];
}

const CompatibilityChart: React.FC<CompatibilityChartProps> = ({
  compatibility,
  candidateName,
  jobTitle,
  extractedSkills,
  recommendations
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Analyse de Compatibilité CV
        </h3>
        <div className="text-sm text-gray-600">
          <p><strong>Candidat:</strong> {candidateName}</p>
          <p><strong>Poste:</strong> {jobTitle}</p>
        </div>
      </div>

      {/* Score global */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Score Global</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(compatibility.overall_score)}`}>
            {getScoreLabel(compatibility.overall_score)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              compatibility.overall_score >= 80 ? 'bg-green-500' :
              compatibility.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${compatibility.overall_score}%` }}
          ></div>
        </div>
        <div className="text-right mt-1">
          <span className="text-2xl font-bold text-gray-800">
            {compatibility.overall_score}%
          </span>
        </div>
      </div>

      {/* Scores détaillés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {compatibility.skills_match}%
          </div>
          <div className="text-sm text-gray-600">Compétences</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {compatibility.experience_match}%
          </div>
          <div className="text-sm text-gray-600">Expérience</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {compatibility.semantic_similarity}%
          </div>
          <div className="text-sm text-gray-600">Similarité</div>
        </div>
      </div>

      {/* Compétences extraites */}
      {extractedSkills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Compétences détectées</h4>
          <div className="flex flex-wrap gap-2">
            {extractedSkills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recommandations IA</h4>
          <ul className="space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Légende des scores */}
      <div className="text-xs text-gray-500 border-t pt-3">
        <div className="flex items-center justify-between">
          <span>🟢 80-100%: Excellent</span>
          <span>🟡 60-79%: Bon</span>
          <span>🔴 0-59%: À améliorer</span>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityChart;
