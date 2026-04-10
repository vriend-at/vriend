import { Grade } from './constants'

export interface Gym {
  id: string
  name: string
  city: string
  description: string
  logo_url?: string
}

export interface Route {
  id: string
  gym_id: string
  name: string
  grade: Grade
  color: string
  zone: string
  setter_name: string
  set_date: string
  remove_date: string
  splat_url?: string
}

export interface SessionRoute {
  route_id: string
  completed: boolean
  attempts: number
}

export interface Session {
  id: string
  user_id: string
  gym_id: string
  date: string
  notes?: string
  routes: SessionRoute[]
}

export interface GradeCompletion {
  grade: Grade
  count: number
}

export interface TeamMember {
  id: string
  display_name: string
  avatar_initials: string
  grade_completions: GradeCompletion[]
}

export interface Team {
  id: string
  name: string
  created_by: string
  created_at: string
  invite_code?: string
  members: TeamMember[]
}

// ─── Gyms ────────────────────────────────────────────────────────────────────

export const MOCK_GYMS: Gym[] = [
  { id: 'gym-1', name: 'Block House Hamburg', city: 'Hamburg', description: 'Die größte Boulderhalle in Hamburg' },
  { id: 'gym-2', name: 'Boulderwelt München', city: 'München', description: 'Premium Bouldern in München' },
  { id: 'gym-3', name: 'DAV Kletterhalle', city: 'Berlin', description: 'Traditionelles Klettern und Bouldern' },
]

// ─── Routes ──────────────────────────────────────────────────────────────────

const today = new Date()
const daysAgo = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
const daysFromNow = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export const MOCK_ROUTES: Route[] = [
  { id: 'r1',  gym_id: 'gym-1', name: 'Sonnenaufgang',   grade: '5',   color: 'Gelb',   zone: 'Zone A', setter_name: 'Markus',  set_date: daysAgo(30), remove_date: daysFromNow(14) },
  { id: 'r2',  gym_id: 'gym-1', name: 'Mondschein',      grade: '6A',  color: 'Orange', zone: 'Zone B', setter_name: 'Lena',    set_date: daysAgo(20), remove_date: daysFromNow(5),  splat_url: '/splats/r2.splat' },
  { id: 'r3',  gym_id: 'gym-1', name: 'Sturm',           grade: '6B+', color: 'Rot',    zone: 'Zone A', setter_name: 'Markus',  set_date: daysAgo(10), remove_date: daysFromNow(3) },
  { id: 'r4',  gym_id: 'gym-1', name: 'Felsblock',       grade: '7A',  color: 'Lila',   zone: 'Zone C', setter_name: 'Felix',   set_date: daysAgo(5),  remove_date: daysFromNow(25) },
  { id: 'r5',  gym_id: 'gym-1', name: 'Kieselstein',     grade: '4',   color: 'Grün',   zone: 'Zone A', setter_name: 'Anna',    set_date: daysAgo(40), remove_date: daysFromNow(2) },
  { id: 'r6',  gym_id: 'gym-1', name: 'Wetterwand',      grade: '6C',  color: 'Dunkelrot', zone: 'Zone B', setter_name: 'Felix', set_date: daysAgo(8), remove_date: daysFromNow(20) },
  { id: 'r7',  gym_id: 'gym-1', name: 'Eisberg',         grade: '7B',  color: 'Blau',   zone: 'Zone C', setter_name: 'Lena',    set_date: daysAgo(12), remove_date: daysFromNow(18), splat_url: '/splats/r7.splat' },
  { id: 'r8',  gym_id: 'gym-1', name: 'Berggeist',       grade: '5+',  color: 'Gelb',   zone: 'Zone A', setter_name: 'Anna',    set_date: daysAgo(15), remove_date: daysFromNow(15) },
  { id: 'r9',  gym_id: 'gym-1', name: 'Vulkan',          grade: '6A+', color: 'Orange', zone: 'Zone B', setter_name: 'Markus',  set_date: daysAgo(22), remove_date: daysFromNow(8) },
  { id: 'r10', gym_id: 'gym-1', name: 'Sandstein',       grade: '4+',  color: 'Beige',  zone: 'Zone A', setter_name: 'Anna',    set_date: daysAgo(35), remove_date: daysFromNow(6) },
  { id: 'r11', gym_id: 'gym-1', name: 'Granitblock',     grade: '7C',  color: 'Blau',   zone: 'Zone C', setter_name: 'Felix',   set_date: daysAgo(3),  remove_date: daysFromNow(27) },
  { id: 'r12', gym_id: 'gym-1', name: 'Kalkfels',        grade: '6B',  color: 'Rot',    zone: 'Zone B', setter_name: 'Lena',    set_date: daysAgo(18), remove_date: daysFromNow(12) },
  { id: 'r13', gym_id: 'gym-2', name: 'Alpenglühen',     grade: '6C+', color: 'Dunkelrot', zone: 'Sektor 1', setter_name: 'Julia', set_date: daysAgo(10), remove_date: daysFromNow(20) },
  { id: 'r14', gym_id: 'gym-2', name: 'Gipfelstürmer',   grade: '7A+', color: 'Lila',   zone: 'Sektor 2', setter_name: 'Tom',   set_date: daysAgo(6),  remove_date: daysFromNow(24), splat_url: '/splats/r14.splat' },
  { id: 'r15', gym_id: 'gym-3', name: 'Berliner Mauer',  grade: '5+',  color: 'Grau',   zone: 'Halle A', setter_name: 'Klaus',  set_date: daysAgo(14), remove_date: daysFromNow(16) },
]

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    user_id: 'user-1',
    gym_id: 'gym-1',
    date: daysAgo(1),
    notes: 'Great session! Finally sent Mondschein.',
    routes: [
      { route_id: 'r1', completed: true,  attempts: 1 },
      { route_id: 'r2', completed: true,  attempts: 3 },
      { route_id: 'r3', completed: false, attempts: 4 },
      { route_id: 'r4', completed: false, attempts: 2 },
    ],
  },
  {
    id: 's2',
    user_id: 'user-1',
    gym_id: 'gym-1',
    date: daysAgo(4),
    notes: 'Focused on Zone A routes.',
    routes: [
      { route_id: 'r5', completed: true,  attempts: 1 },
      { route_id: 'r8', completed: true,  attempts: 2 },
      { route_id: 'r10',completed: true,  attempts: 1 },
      { route_id: 'r9', completed: false, attempts: 5 },
    ],
  },
  {
    id: 's3',
    user_id: 'user-1',
    gym_id: 'gym-1',
    date: daysAgo(8),
    notes: 'Short session after work.',
    routes: [
      { route_id: 'r6',  completed: true,  attempts: 2 },
      { route_id: 'r12', completed: true,  attempts: 2 },
    ],
  },
  {
    id: 's4',
    user_id: 'user-1',
    gym_id: 'gym-2',
    date: daysAgo(12),
    notes: 'Erstes Mal in der Boulderwelt – tolle Halle!',
    routes: [
      { route_id: 'r13', completed: false, attempts: 6 },
      { route_id: 'r14', completed: false, attempts: 3 },
    ],
  },
  {
    id: 's5',
    user_id: 'user-1',
    gym_id: 'gym-1',
    date: daysAgo(20),
    routes: [
      { route_id: 'r7',  completed: false, attempts: 8 },
      { route_id: 'r11', completed: false, attempts: 4 },
      { route_id: 'r1',  completed: true,  attempts: 1 },
    ],
  },
]

// ─── Teams ────────────────────────────────────────────────────────────────────

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Blockteufel',
    created_by: 'user-1',
    created_at: '2024-11-15',
    members: [
      {
        id: 'user-1',
        display_name: 'Matthias',
        avatar_initials: 'M',
        grade_completions: [
          { grade: '5',   count: 4 }, { grade: '5+',  count: 3 },
          { grade: '6A',  count: 5 }, { grade: '6A+', count: 3 },
          { grade: '6B',  count: 4 }, { grade: '6B+', count: 2 },
          { grade: '6C',  count: 2 }, { grade: '7A',  count: 1 },
        ],
      },
      {
        id: 'user-2',
        display_name: 'Sophie',
        avatar_initials: 'S',
        grade_completions: [
          { grade: '5',   count: 6 }, { grade: '5+',  count: 5 },
          { grade: '6A',  count: 6 }, { grade: '6A+', count: 4 },
          { grade: '6B',  count: 5 }, { grade: '6B+', count: 3 },
          { grade: '6C',  count: 3 }, { grade: '7A',  count: 2 },
          { grade: '7A+', count: 1 },
        ],
      },
      {
        id: 'user-3',
        display_name: 'Lukas',
        avatar_initials: 'L',
        grade_completions: [
          { grade: '5',   count: 3 }, { grade: '5+',  count: 2 },
          { grade: '6A',  count: 3 }, { grade: '6A+', count: 2 },
          { grade: '6B',  count: 2 }, { grade: '6C',  count: 1 },
        ],
      },
      {
        id: 'user-4',
        display_name: 'Jana',
        avatar_initials: 'J',
        grade_completions: [
          { grade: '5',   count: 5 }, { grade: '5+',  count: 4 },
          { grade: '6A',  count: 5 }, { grade: '6A+', count: 3 },
          { grade: '6B',  count: 4 }, { grade: '6B+', count: 2 },
          { grade: '6C',  count: 2 }, { grade: '7A',  count: 1 },
          { grade: '7B',  count: 1 },
        ],
      },
      {
        id: 'user-5',
        display_name: 'Felix',
        avatar_initials: 'F',
        grade_completions: [
          { grade: '5',   count: 2 }, { grade: '5+',  count: 2 },
          { grade: '6A',  count: 2 }, { grade: '6A+', count: 1 },
          { grade: '6B',  count: 1 },
        ],
      },
    ],
  },
  {
    id: 'team-2',
    name: 'Vertical Crew',
    created_by: 'user-3',
    created_at: '2025-01-08',
    members: [
      {
        id: 'user-3',
        display_name: 'Lukas',
        avatar_initials: 'L',
        grade_completions: [
          { grade: '5',   count: 3 }, { grade: '5+',  count: 2 },
          { grade: '6A',  count: 3 }, { grade: '6A+', count: 2 },
          { grade: '6B',  count: 2 }, { grade: '6C',  count: 1 },
        ],
      },
      {
        id: 'user-5',
        display_name: 'Felix',
        avatar_initials: 'F',
        grade_completions: [
          { grade: '5',   count: 2 }, { grade: '5+',  count: 2 },
          { grade: '6A',  count: 2 }, { grade: '6A+', count: 1 },
          { grade: '6B',  count: 1 },
        ],
      },
      {
        id: 'user-6',
        display_name: 'Mia',
        avatar_initials: 'M',
        grade_completions: [
          { grade: '5',   count: 4 }, { grade: '5+',  count: 3 },
          { grade: '6A',  count: 4 }, { grade: '6A+', count: 2 },
          { grade: '6B',  count: 3 }, { grade: '6C',  count: 1 },
        ],
      },
    ],
  },
]

// ─── Current user mock ────────────────────────────────────────────────────────

export const MOCK_USER = {
  id: 'user-1',
  display_name: 'Matthias K.',
  email: 'matthias@example.com',
  avatar_initials: 'MK',
  max_grade: '8A' as Grade,
}
