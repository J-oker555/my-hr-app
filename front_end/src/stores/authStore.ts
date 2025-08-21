import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

type Role = 'admin' | 'recruiter' | 'candidate'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null,
  login: async (email: string, password: string) => {
    const normEmail = (email || '').trim().toLowerCase()
    const normPassword = (password || '').trim()
    try {
      const { data } = await api.post('/api/accounts/auth/login/', { email: normEmail, password: normPassword })
      const u = data.user as { id: string; email: string; full_name: string; role: Role }
      const mapped: User = { id: u.id, email: u.email, name: u.full_name, role: u.role }
      // Optionnel si JWT réactivé: localStorage.setItem('token', data.token)
      set({ user: mapped })
    } catch (e: any) {
      const code = e?.response?.data?.detail
      if (code === 'email_not_found') throw new Error('Email introuvable')
      if (code === 'invalid_password') throw new Error('Mot de passe incorrect')
      throw new Error('Erreur de connexion')
    }
  },
  logout: () => set({ user: null })
}), { name: 'auth-store' }))


