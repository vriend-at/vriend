'use client'

import { Gym } from '@/lib/mock-data'
import { ChevronDown } from 'lucide-react'

interface Props {
  gyms: Gym[]
  selectedId: string | null
  onChange: (id: string | null) => void
}

export default function GymSelector({ gyms, selectedId, onChange }: Props) {
  const selected = gyms.find(g => g.id === selectedId)

  return (
    <div className="relative">
      <select
        value={selectedId ?? 'all'}
        onChange={e => onChange(e.target.value === 'all' ? null : e.target.value)}
        className="appearance-none w-full bg-white border border-[#e7e0d8] rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-[#1c1917] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b45309] cursor-pointer"
      >
        <option value="all">Alle Hallen</option>
        {gyms.map(gym => (
          <option key={gym.id} value={gym.id}>{gym.name}</option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] pointer-events-none"
      />
    </div>
  )
}
