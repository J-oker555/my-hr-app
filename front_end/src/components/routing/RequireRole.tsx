import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

type Role = 'admin' | 'recruiter' | 'candidate'

interface RequireRoleProps {
  roles?: Role[]
  children: JSX.Element
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const user = useAuthStore(s => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}


