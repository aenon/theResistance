import { useState } from 'react'
import { ROLE_INFO } from '../game/roles'
import { markReady, startFirstRound } from '../room/api'
import type { PrivateRole, Room } from '../room/model'
import { Button, Card, Hint } from './kit'

/** The role card stays covered until tapped, so a neighbour cannot glance at it. */
export function Night({
  room,
  uid,
  secret,
  isHost,
}: {
  room: Room
  uid: string
  secret: PrivateRole | null
  isHost: boolean
}) {
  const [shown, setShown] = useState(false)
  const ready = room.readyUids.includes(uid)
  const allReady = room.readyUids.length === room.players.length

  if (!secret) return <Hint>正在发牌……</Hint>

  const info = ROLE_INFO[secret.role]

  return (
    <>
      <Card title="你的身份">
        {shown ? (
          <div className="space-y-2">
            <p
              className={`text-3xl font-bold ${
                info.team === 'evil' ? 'text-rose-400' : 'text-sky-300'
              }`}
            >
              {info.name}
            </p>
            <Hint>{info.description}</Hint>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShown(true)}
            className="w-full rounded-xl bg-slate-900 py-10 text-slate-400"
          >
            点一下看牌
          </button>
        )}
      </Card>

      {shown && (
        <Card title={secret.hint ? secret.hint.label : '你看不到任何人'}>
          {secret.hint ? (
            <div className="flex flex-wrap gap-2">
              {secret.hint.names.map((name) => (
                <span key={name} className="rounded-full bg-slate-900 px-3 py-1.5 text-sm">
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <Hint>这一局你只能靠推理。</Hint>
          )}
        </Card>
      )}

      {shown && !ready && (
        <Button
          onClick={() => {
            setShown(false)
            void markReady(room.code, uid)
          }}
        >
          记住了，扣牌
        </Button>
      )}

      {ready && <Hint>已确认 {room.readyUids.length} / {room.players.length} 人。</Hint>}

      {isHost && (
        <Button disabled={!allReady} onClick={() => void startFirstRound(room.code)}>
          开始第一轮任务
        </Button>
      )}
    </>
  )
}
