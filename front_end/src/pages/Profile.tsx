import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { api } from '../lib/api'

export default function Profile() {
  const { user } = useAuthStore()
  const [cvInfo, setCvInfo] = useState<{ filename?: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadCv() {
    if (!user) return
    try {
      const { data } = await api.get(`/api/accounts/users/${user.id}/download-cv/`)
      setCvInfo(data)
    } catch {
      setCvInfo(null)
    }
  }

  useEffect(() => { loadCv() }, [user?.id])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Veuillez sélectionner un fichier PDF')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('cv_file', file)
      await api.post(`/api/accounts/users/${user!.id}/upload-cv/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await loadCv()
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Échec de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mon profil</h1>

      <div className="card p-4 grid gap-3 max-w-xl">
        <div><span className="text-gray-500">Nom:</span> {user?.name}</div>
        <div><span className="text-gray-500">Email:</span> {user?.email}</div>
        <div><span className="text-gray-500">Rôle:</span> {user?.role}</div>
      </div>

      <div className="card p-4 grid gap-3 max-w-xl">
        <h2 className="font-medium">Mon CV (PDF)</h2>
        {cvInfo ? (
          <div className="flex items-center gap-3">
            <a className="btn" href={`/api/accounts/users/${user!.id}/cv/`}>Télécharger</a>
            <span className="text-sm text-gray-600 dark:text-gray-300">{cvInfo.filename || 'cv.pdf'}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">Aucun CV</div>
        )}
        <div>
          <input type="file" accept="application/pdf" onChange={handleUpload} />
        </div>
        {error && (<div className="text-red-600 dark:text-red-400 text-sm">{error}</div>)}
        {uploading && (<div className="text-sm">Upload en cours…</div>)}
      </div>
    </div>
  )
}


