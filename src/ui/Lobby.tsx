import { OPTIONAL_ROLES, ROLE_INFO } from '../game/roles'
import { describeSetup, validateSetup } from '../game/setup'
import type { Role } from '../game/types'
import { setOptionalRoles, startGame } from '../room/api'
import type { Room } from '../room/model'
import { Button, Card, Chip, Hint } from './kit'

export function Lobby({ room, isHost }: { room: Room; isHost: boolean }) {
  const errors = validateSetup(room.players.length, room.optionalRoles)

  const toggle = (role: Role) => {
    const next = room.optionalRoles.includes(role)
      ? room.optionalRoles.filter((r) => r !== role)
      : [...room.optionalRoles, role]
    void setOptionalRoles(room.code, next)
  }

  return (
    <>
      <Card title="房间号">
        <p className="text-center text-5xl font-bold tracking-[0.3em]">{room.code}</p>
        <Hint>把这个号码或当前网址发给同桌的人。</Hint>
      </Card>

      <Card title={`玩家 ${room.players.length} 人 · ${describeSetup(room.players.length)}`}>
        <ul className="space-y-1">
          {room.players.map((player) => (
            <li key={player.uid} className="flex justify-between rounded-lg bg-slate-900/60 px-3 py-2">
              <span>{player.name}</span>
              {player.uid === room.hostUid && <span className="text-xs text-indigo-400">房主</span>}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="特殊角色">
        <div className="flex flex-wrap gap-2">
          {OPTIONAL_ROLES.map((role) => (
            <Chip
              key={role}
              selected={room.optionalRoles.includes(role)}
              disabled={!isHost}
              onClick={() => toggle(role)}
            >
              {ROLE_INFO[role].name}
            </Chip>
          ))}
        </div>
        <ul className="mt-3 space-y-1">
          {room.optionalRoles.map((role) => (
            <li key={role} className="text-xs text-slate-400">
              <span className="text-slate-300">{ROLE_INFO[role].name}</span>：{ROLE_INFO[role].description}
            </li>
          ))}
        </ul>
      </Card>

      {errors.map((error) => (
        <p key={error} className="text-sm text-amber-400">
          {error}
        </p>
      ))}

      {isHost ? (
        <Button disabled={errors.length > 0} onClick={() => void startGame(room)}>
          发牌开始
        </Button>
      ) : (
        <Hint>等房主发牌……</Hint>
      )}
    </>
  )
}
