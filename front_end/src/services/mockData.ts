// Deprecated mock store: kept temporarily for type references only.
// All data should now come from backend API.
export const useMockData = () => ({ users: [], applications: [], jobs: [] } as any);

export type ApplicationStatus = 'nouvelle' | 'analysée' | 'retenue' | 'rejetée'

export interface JobItem {
  id: string
  title: string
  requiredSkills: string[]
  niceToHaveSkills?: string[]
  description?: string
  postedByUserId?: string
}

export interface ApplicationItem {
  id: string
  fullName: string
  position: string
  cvText: string
  coverLetterText?: string
  score?: number
  status: ApplicationStatus
  skills?: string[]
  recommendations?: string[]
  jobId?: string
  compatibilityPct?: number
  userId?: string
  createdAt: string
}

export interface SimpleUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'recruteur' | 'candidat'
}

interface MockState {
  users: SimpleUser[]
  applications: ApplicationItem[]
  jobs: JobItem[]
  addUser: (u: Omit<SimpleUser, 'id'>) => void
  updateUser: (id: string, changes: Partial<SimpleUser>) => void
  removeUser: (id: string) => void

  addApplication: (a: Omit<ApplicationItem, 'id' | 'status' >) => ApplicationItem
  removeApplication: (id: string) => void
  getApplicationById: (id: string) => ApplicationItem | undefined
  updateApplication: (id: string, changes: Partial<ApplicationItem>) => void

  analyzeCv: (id: string) => Promise<void>

  addJob: (j: Omit<JobItem, 'id'>) => void
  updateJob: (id: string, changes: Partial<JobItem>) => void
  removeJob: (id: string) => void
  getJobById: (id: string) => JobItem | undefined
}

function extractSkills(text: string): string[] {
  const skillList = ['JavaScript', 'TypeScript', 'React', 'Node', 'Python', 'Django', 'SQL', 'AWS', 'Docker']
  const lower = text.toLowerCase()
  return skillList.filter(s => lower.includes(s.toLowerCase()))
}

function computeCompatibilityPct(text: string, job: JobItem | undefined): number | undefined {
  if (!job) return undefined
  const detected = extractSkills(text).map(s => s.toLowerCase())
  const required = job.requiredSkills.map(s => s.toLowerCase())
  if (required.length === 0) return 0
  const matched = required.filter(s => detected.includes(s)).length
  return Math.round((matched / required.length) * 100)
}

function computeScore(text: string, job: JobItem | undefined, positionFallback: string): number {
  const detectedSkills = extractSkills(text)
  const seniorityBoost = /senior|5\+|ancien/.test(text.toLowerCase()) ? 15 : 0

  if (job) {
    const required = job.requiredSkills.map(s => s.toLowerCase())
    const nice = (job.niceToHaveSkills ?? []).map(s => s.toLowerCase())
    const detectedLower = detectedSkills.map(s => s.toLowerCase())

    const requiredMatched = required.filter(s => detectedLower.includes(s)).length
    const niceMatched = nice.filter(s => detectedLower.includes(s)).length

    const requiredCoverage = required.length ? requiredMatched / required.length : 0
    const niceCoverage = nice.length ? niceMatched / Math.max(3, nice.length) : 0

    const skillScore = Math.round(70 * requiredCoverage + 15 * Math.min(1, niceCoverage))
    return Math.min(100, skillScore + seniorityBoost)
  }

  // Fallback si pas de poste associé
  const match = detectedSkills.length * 10
  const positionBoost = text.toLowerCase().includes(positionFallback.toLowerCase()) ? 10 : 0
  return Math.min(100, match + seniorityBoost + positionBoost)
}

// Original mock store removed.


