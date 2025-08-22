import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['admin', 'recruiter', 'candidate'] },
    { name: 'Utilisateurs', href: '/users', icon: '👥', roles: ['admin'] },
    { name: 'Postes', href: '/jobs', icon: '💼', roles: ['admin', 'recruiter'] },
    { name: 'Candidatures', href: '/applications', icon: '📝', roles: ['admin', 'recruiter', 'candidate'] },
    { name: 'Analytics', href: '/analytics', icon: '📈', roles: ['admin'] },
    { name: 'Mon Espace Recruteur', href: '/recruiter-dashboard', icon: '🎯', roles: ['recruiter'] },
  ];

  const filteredNavigationItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'candidate')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">HR System</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {filteredNavigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    Bonjour, {user.name}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'recruiter' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? 'Admin' :
                     user.role === 'recruiter' ? 'Recruteur' : 'Candidat'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;


