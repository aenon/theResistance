import { ROLE_INFO, isEvil } from './roles'
import type { Role } from './types'

export const MIN_PLAYERS = 5
export const MAX_PLAYERS = 10

/** Number of evil players for each supported table size. */
const EVIL_COUNT: Record<number, number> = {
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 3,
  10: 4,
}

/** Mission team sizes for rounds 1-5, indexed by player count. */
const MISSION_SIZES: Record<number, [number, number, number, number, number]> = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
}

export function evilCount(playerCount: number): number {
  return EVIL_COUNT[playerCount] ?? 0
}

export function goodCount(playerCount: number): number {
  return playerCount - evilCount(playerCount)
}

export function missionSize(playerCount: number, round: number): number {
  return MISSION_SIZES[playerCount][round]
}

/** From 7 players on, the fourth mission only fails with two fail cards. */
export function failsRequired(playerCount: number, round: number): number {
  return playerCount >= 7 && round === 3 ? 2 : 1
}

export function validateSetup(playerCount: number, optionalRoles: Role[]): string[] {
  const errors: string[] = []
  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    errors.push(`人数需要在 ${MIN_PLAYERS} 到 ${MAX_PLAYERS} 之间，当前 ${playerCount} 人。`)
    return errors
  }

  const chosen = new Set(optionalRoles)
  if (chosen.has('merlin') !== chosen.has('assassin')) {
    errors.push('梅林和刺客必须同时选择，否则好人赢下三局后没有刺杀环节。')
  }
  if (chosen.has('percival') && !chosen.has('merlin')) {
    errors.push('派西维尔需要梅林在场，否则他没有可认的人。')
  }
  if (chosen.has('morgana') && !chosen.has('percival')) {
    errors.push('莫甘娜需要派西维尔在场，否则她的伪装没有意义。')
  }
  if (chosen.has('mordred') && !chosen.has('merlin')) {
    errors.push('莫德雷德需要梅林在场，否则他的隐身没有意义。')
  }

  const chosenGood = optionalRoles.filter((r) => !isEvil(r)).length
  const chosenEvil = optionalRoles.filter(isEvil).length
  if (chosenEvil > evilCount(playerCount)) {
    errors.push(`${playerCount} 人局只有 ${evilCount(playerCount)} 个坏人，放不下 ${chosenEvil} 个特殊坏人。`)
  }
  if (chosenGood > goodCount(playerCount)) {
    errors.push(`${playerCount} 人局只有 ${goodCount(playerCount)} 个好人，放不下 ${chosenGood} 个特殊好人。`)
  }
  return errors
}

/** Expands the chosen optional roles into the full deck for the table. */
export function buildDeck(playerCount: number, optionalRoles: Role[]): Role[] {
  const deck = [...optionalRoles]
  const evilMissing = evilCount(playerCount) - optionalRoles.filter(isEvil).length
  const goodMissing = goodCount(playerCount) - optionalRoles.filter((r) => !isEvil(r)).length
  for (let i = 0; i < evilMissing; i++) deck.push('minion')
  for (let i = 0; i < goodMissing; i++) deck.push('loyalServant')
  return deck
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function assignRoles(uids: string[], optionalRoles: Role[]): Record<string, Role> {
  const deck = shuffle(buildDeck(uids.length, optionalRoles))
  return Object.fromEntries(uids.map((uid, i) => [uid, deck[i]]))
}

export function describeSetup(playerCount: number): string {
  return `${goodCount(playerCount)} 好人 / ${evilCount(playerCount)} 坏人`
}

export function roleLabel(role: Role): string {
  return ROLE_INFO[role].name
}
