import { useState } from 'react'
import { ROLE_INFO } from '../game/roles'
import { assassinate, playAgain } from '../room/api'
import { playerName, type PrivateRole, type Room } from '../room/model'
import { Button, Card, Chip, Hint } from './kit'

export function AssassinPhase({
  room,
  uid,
  secret,
}: {
  room: Room
  uid: string
  secret: PrivateRole | null
}) {
  const [target, setTarget] = useState<string | null>(null)
  const isAssassin = secret?.role === 'assassin'

  if (room.assassinTarget) {
    return (
      <Card title="刺客出手了">
        <Hint>目标是 {playerName(room, room.assassinTarget)}，等待结果……</Hint>
      </Card>
    )
  }

  if (!isAssassin) {
    return (
      <Card title="好人拿下三次任务">
        <Hint>刺客正在指认梅林，指对了坏人翻盘。</Hint>
      </Card>
    )
  }

  return (
    <>
      <Card title="指认梅林">
        <div className="flex flex-wrap gap-2">
          {room.players
            .filter((player) => player.uid !== uid)
            .map((player) => (
              <Chip key={player.uid} selected={target === player.uid} onClick={() => setTarget(player.uid)}>
                {player.name}
              </Chip>
            ))}
        </div>
      </Card>
      <Button tone="danger" disabled={!target} onClick={() => void assassinate(room.code, target!)}>
        刺杀
      </Button>
    </>
  )
}

export function Ended({ room, isHost }: { room: Room; isHost: boolean }) {
  const reveal = room.reveal ?? {}
  const good = room.winner === 'good'
  return (
    <>
      <Card title="本局结束">
        <p className={`text-3xl font-bold ${good ? 'text-sky-300' : 'text-rose-400'}`}>
          {good ? '好人获胜' : '坏人获胜'}
        </p>
        {room.assassinTarget && (
          <Hint>刺客指认了 {playerName(room, room.assassinTarget)}。</Hint>
        )}
      </Card>

      <Card title="身份公开">
        <ul className="space-y-1">
          {room.players.map((player) => {
            const role = reveal[player.uid]
            const info = role ? ROLE_INFO[role] : null
            return (
              <li key={player.uid} className="flex justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                <span>{player.name}</span>
                <span className={info?.team === 'evil' ? 'text-rose-400' : 'text-sky-300'}>
                  {info ? info.name : '等待上报…'}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

      {isHost && <Button onClick={() => void playAgain(room.code)}>再来一局</Button>}
    </>
  )
}
