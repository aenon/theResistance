import { describe, expect, it } from 'vitest'
import { isEvil } from './roles'
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  assignRoles,
  buildDeck,
  evilCount,
  failsRequired,
  goodCount,
  missionSize,
  validateSetup,
} from './setup'
import type { Role } from './types'

const sizes = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS)

describe('table composition', () => {
  it('matches the printed rulebook', () => {
    expect(sizes.map(evilCount)).toEqual([2, 2, 3, 3, 3, 4])
    expect(sizes.map(goodCount)).toEqual([3, 4, 4, 5, 6, 6])
  })

  it('never sends more players than are seated', () => {
    for (const count of sizes) {
      for (let round = 0; round < 5; round++) {
        expect(missionSize(count, round)).toBeLessThanOrEqual(count)
        expect(missionSize(count, round)).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('requires two fails only on the fourth mission of large tables', () => {
    expect(failsRequired(7, 3)).toBe(2)
    expect(failsRequired(10, 3)).toBe(2)
    expect(failsRequired(6, 3)).toBe(1)
    expect(failsRequired(7, 2)).toBe(1)
  })
})

describe('validateSetup', () => {
  it('accepts the classic five player setup', () => {
    expect(validateSetup(5, ['merlin', 'assassin'])).toEqual([])
  })

  it('rejects merlin without an assassin', () => {
    expect(validateSetup(5, ['merlin'])).toHaveLength(1)
  })

  it('rejects dependent roles whose anchor is missing', () => {
    expect(validateSetup(7, ['morgana', 'assassin'])).not.toEqual([])
    expect(validateSetup(7, ['percival', 'merlin', 'assassin'])).toEqual([])
    expect(validateSetup(7, ['mordred', 'assassin'])).not.toEqual([])
  })

  it('rejects more special evils than the table has evil seats', () => {
    const errors = validateSetup(5, ['merlin', 'assassin', 'morgana', 'percival', 'mordred'])
    expect(errors.some((e) => e.includes('坏人'))).toBe(true)
  })

  it('rejects unsupported player counts', () => {
    expect(validateSetup(4, [])).toHaveLength(1)
    expect(validateSetup(11, [])).toHaveLength(1)
  })
})

describe('buildDeck', () => {
  it('fills the table with plain roles and keeps the balance', () => {
    for (const count of sizes) {
      const deck = buildDeck(count, ['merlin', 'assassin'])
      expect(deck).toHaveLength(count)
      expect(deck.filter(isEvil)).toHaveLength(evilCount(count))
    }
  })

  it('keeps every chosen optional role', () => {
    const optional: Role[] = ['merlin', 'percival', 'assassin', 'morgana', 'mordred']
    const deck = buildDeck(8, optional)
    for (const role of optional) expect(deck).toContain(role)
  })
})

describe('assignRoles', () => {
  it('gives every player exactly one role from the deck', () => {
    const uids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const assignments = assignRoles(uids, ['merlin', 'assassin', 'percival', 'morgana'])
    expect(Object.keys(assignments).sort()).toEqual([...uids].sort())
    const dealt = Object.values(assignments).sort()
    expect(dealt).toEqual(buildDeck(7, ['merlin', 'assassin', 'percival', 'morgana']).sort())
  })
})
