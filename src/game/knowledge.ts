import { isEvil } from './roles'
import { shuffle } from './setup'
import type { NightHint, Player, Role } from './types'

/**
 * What a player learns at the start of the game. Everything a client is allowed
 * to know about other players comes from here, so the visibility rules live in
 * exactly one place.
 */
export function nightHint(
  uid: string,
  assignments: Record<string, Role>,
  players: Player[],
): NightHint | null {
  const nameOf = (id: string) => players.find((p) => p.uid === id)?.name ?? id
  const others = players.filter((p) => p.uid !== uid).map((p) => p.uid)
  const role = assignments[uid]

  switch (role) {
    case 'merlin': {
      const seen = others.filter((id) => isEvil(assignments[id]) && assignments[id] !== 'mordred')
      return { label: '你看到的坏人', names: shuffle(seen.map(nameOf)) }
    }
    case 'percival': {
      const seen = others.filter((id) => assignments[id] === 'merlin' || assignments[id] === 'morgana')
      return {
        label: seen.length > 1 ? '这两人中有一个是梅林' : '梅林是',
        names: shuffle(seen.map(nameOf)),
      }
    }
    case 'oberon':
      return null
    case 'loyalServant':
      return null
    default: {
      if (!isEvil(role)) return null
      const seen = others.filter((id) => isEvil(assignments[id]) && assignments[id] !== 'oberon')
      return { label: '你的坏人同伴', names: shuffle(seen.map(nameOf)) }
    }
  }
}
