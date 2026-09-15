export const ROLES = [
  'merlin',
  'percival',
  'loyalServant',
  'assassin',
  'morgana',
  'mordred',
  'oberon',
  'minion',
] as const

export type Role = (typeof ROLES)[number]

export type Team = 'good' | 'evil'

export interface RoleInfo {
  id: Role
  name: string
  team: Team
  optional: boolean
  description: string
}

/** A player as stored on the public room document. */
export interface Player {
  uid: string
  name: string
}

/** What a single player is allowed to learn during the night phase. */
export interface NightHint {
  /** Shown above the list of names, explains what the list means. */
  label: string
  /** Names are shuffled so that ordering never leaks extra information. */
  names: string[]
}

export interface MissionRecord {
  /** Number of players that went on the mission. */
  teamSize: number
  fails: number
  success: boolean
}

export type Winner = 'good' | 'evil'
