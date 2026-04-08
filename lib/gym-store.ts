const KEY = 'vriend_last_gym_id'

export function getLastGymId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEY)
}

export function setLastGymId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, id)
}
