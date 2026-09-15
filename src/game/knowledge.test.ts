import { describe, expect, it } from 'vitest'
import { nightHint } from './knowledge'
import type { Player, Role } from './types'

const players: Player[] = [
  { uid: '1', name: '甲' },
  { uid: '2', name: '乙' },
  { uid: '3', name: '丙' },
  { uid: '4', name: '丁' },
  { uid: '5', name: '戊' },
  { uid: '6', name: '己' },
  { uid: '7', name: '庚' },
]

const assignments: Record<string, Role> = {
  '1': 'merlin',
  '2': 'percival',
  '3': 'loyalServant',
  '4': 'loyalServant',
  '5': 'assassin',
  '6': 'morgana',
  '7': 'mordred',
}

const hintNames = (uid: string, roles = assignments) =>
  (nightHint(uid, roles, players)?.names ?? []).sort()

describe('nightHint', () => {
  it('hides mordred from merlin', () => {
    expect(hintNames('1')).toEqual(['己', '戊'].sort())
  })

  it('shows merlin and morgana to percival without saying which is which', () => {
    const hint = nightHint('2', assignments, players)
    expect(hint?.names.sort()).toEqual(['甲', '己'].sort())
    expect(hint?.label).not.toContain('莫甘娜是')
  })

  it('tells loyal servants nothing', () => {
    expect(nightHint('3', assignments, players)).toBeNull()
  })

  it('lets evil players see each other, including mordred', () => {
    expect(hintNames('5')).toEqual(['庚', '己'].sort())
    expect(hintNames('7')).toEqual(['戊', '己'].sort())
  })

  it('isolates oberon in both directions', () => {
    const withOberon: Record<string, Role> = { ...assignments, '7': 'oberon' }
    expect(nightHint('7', withOberon, players)).toBeNull()
    expect(hintNames('5', withOberon)).toEqual(['己'])
    // merlin still sees oberon
    expect(hintNames('1', withOberon)).toEqual(['庚', '己', '戊'].sort())
  })

  it('never includes the player themselves', () => {
    for (const player of players) {
      expect(hintNames(player.uid)).not.toContain(player.name)
    }
  })
})
