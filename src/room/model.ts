import type { MissionRecord, NightHint, Player, Role, Winner } from '../game/types'

export type Phase =
  | 'lobby'
  | 'reveal'
  | 'team'
  | 'vote'
  | 'voteResult'
  | 'mission'
  | 'missionResult'
  | 'assassin'
  | 'ended'

export interface Room {
  code: string
  hostUid: string
  phase: Phase
  players: Player[]
  /** Mirror of `players[].uid`, kept because security rules cannot project arrays of maps. */
  playerUids: string[]
  optionalRoles: Role[]
  /** 0-based mission number. */
  round: number
  /** 1-based proposal number within the round; the fifth rejection ends the game. */
  attempt: number
  leaderIndex: number
  team: string[]
  votedUids: string[]
  readyUids: string[]
  missionSubmitted: string[]
  missionFails: number
  missions: MissionRecord[]
  assassinTarget: string | null
  winner: Winner | null
  /** Filled in only once the game is over. */
  reveal: Record<string, Role> | null
}

/** Per-player secret, stored in a document only that player can read. */
export interface PrivateRole {
  role: Role
  hint: NightHint | null
}

export interface VoteDoc {
  uid: string
  approve: boolean
  round: number
  attempt: number
}

export function leaderUid(room: Room): string {
  return room.players[room.leaderIndex]?.uid ?? ''
}

export function playerName(room: Room, uid: string): string {
  return room.players.find((p) => p.uid === uid)?.name ?? '未知玩家'
}

export function voteId(round: number, attempt: number, uid: string): string {
  return `${round}-${attempt}-${uid}`
}
