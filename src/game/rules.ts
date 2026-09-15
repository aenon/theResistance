import { failsRequired } from './setup'
import type { MissionRecord, Winner } from './types'

export const ROUNDS = 5
/** Five rejected proposals in a row hand the round to the evil team. */
export const MAX_ATTEMPTS = 5

export function tallyVotes(votes: Record<string, boolean>): {
  approve: number
  reject: number
  approved: boolean
} {
  const values = Object.values(votes)
  const approve = values.filter(Boolean).length
  const reject = values.length - approve
  return { approve, reject, approved: approve > reject }
}

export function missionSucceeded(playerCount: number, round: number, fails: number): boolean {
  return fails < failsRequired(playerCount, round)
}

export function score(missions: MissionRecord[]): { successes: number; failures: number } {
  const successes = missions.filter((m) => m.success).length
  return { successes, failures: missions.length - successes }
}

export function winnerFromMissions(missions: MissionRecord[]): Winner | null {
  const { successes, failures } = score(missions)
  if (failures >= 3) return 'evil'
  if (successes >= 3) return 'good'
  return null
}

export function nextLeaderIndex(current: number, playerCount: number): number {
  return (current + 1) % playerCount
}
