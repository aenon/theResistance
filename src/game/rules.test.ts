import { describe, expect, it } from 'vitest'
import {
  missionSucceeded,
  nextLeaderIndex,
  score,
  tallyVotes,
  winnerFromMissions,
} from './rules'
import type { MissionRecord } from './types'

const mission = (success: boolean): MissionRecord => ({ teamSize: 3, fails: success ? 0 : 1, success })

describe('tallyVotes', () => {
  it('needs a strict majority to approve', () => {
    expect(tallyVotes({ a: true, b: true, c: false }).approved).toBe(true)
    expect(tallyVotes({ a: true, b: false }).approved).toBe(false)
    expect(tallyVotes({ a: false, b: false, c: true }).approved).toBe(false)
  })
})

describe('missionSucceeded', () => {
  it('fails on a single fail card by default', () => {
    expect(missionSucceeded(5, 2, 1)).toBe(false)
    expect(missionSucceeded(5, 2, 0)).toBe(true)
  })

  it('survives one fail card on the fourth mission of a large table', () => {
    expect(missionSucceeded(7, 3, 1)).toBe(true)
    expect(missionSucceeded(7, 3, 2)).toBe(false)
  })
})

describe('winnerFromMissions', () => {
  it('waits while the score is open', () => {
    expect(winnerFromMissions([])).toBeNull()
    expect(winnerFromMissions([mission(true), mission(false)])).toBeNull()
  })

  it('ends at three', () => {
    expect(winnerFromMissions([mission(true), mission(true), mission(true)])).toBe('good')
    expect(winnerFromMissions([mission(false), mission(false), mission(false)])).toBe('evil')
  })

  it('counts the score', () => {
    expect(score([mission(true), mission(false), mission(true)])).toEqual({
      successes: 2,
      failures: 1,
    })
  })
})

describe('nextLeaderIndex', () => {
  it('wraps around the table', () => {
    expect(nextLeaderIndex(0, 5)).toBe(1)
    expect(nextLeaderIndex(4, 5)).toBe(0)
  })
})
