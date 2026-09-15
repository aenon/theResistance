import { useEffect, useState } from 'react'
import { joinRoom, publishRole, resolveAssassination } from '../room/api'
import { usePrivateRole, useRoom } from '../room/hooks'
import { leaderUid } from '../room/model'
import { Board } from './Board'
import { AssassinPhase, Ended } from './Endgame'
import { Lobby } from './Lobby'
import { MissionPhase, MissionResultPhase, TeamPhase, VotePhase, VoteResultPhase } from './Mission'
import { Night } from './Night'
import { Button, Card, Hint, Screen } from './kit'

export function RoomView({
  code,
  uid,
  onLeave,
}: {
  code: string
  uid: string
  onLeave: () => void
}) {
  const { room, missing } = useRoom(code)
  const secret = usePrivateRole(code, uid)
  const [name, setName] = useState(() => localStorage.getItem('avalon.name') ?? '')

  const isPlayer = room?.playerUids.includes(uid) ?? false

  // Only Merlin's client knows whether the assassin guessed right.
  useEffect(() => {
    if (room?.phase === 'assassin' && room.assassinTarget && secret?.role === 'merlin') {
      void resolveAssassination(code, room.assassinTarget === uid)
    }
  }, [room?.phase, room?.assassinTarget, secret?.role, code, uid])

  // The recap is assembled from each player publishing their own card.
  useEffect(() => {
    if (room?.phase === 'ended' && secret && !room.reveal?.[uid]) {
      void publishRole(code, uid, secret.role)
    }
  }, [room?.phase, room?.reveal, secret, code, uid])

  if (missing) {
    return (
      <Screen>
        <Card title="房间不存在">
          <Button onClick={onLeave}>回首页</Button>
        </Card>
      </Screen>
    )
  }
  if (!room) {
    return (
      <Screen>
        <Hint>连接中……</Hint>
      </Screen>
    )
  }

  if (!isPlayer) {
    return (
      <Screen>
        <Card title={`加入房间 ${room.code}`}>
          {room.phase === 'lobby' ? (
            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={12}
                placeholder="你的名字"
                className="mb-3 w-full rounded-xl bg-slate-900 px-4 py-3 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
              />
              <Button
                disabled={!name.trim()}
                onClick={() => {
                  localStorage.setItem('avalon.name', name.trim())
                  void joinRoom(room.code, uid, name.trim())
                }}
              >
                加入
              </Button>
            </>
          ) : (
            <Hint>这局已经开始了，等他们打完再进来。</Hint>
          )}
        </Card>
      </Screen>
    )
  }

  const isHost = room.hostUid === uid
  const isLeader = leaderUid(room) === uid
  const inGame = !['lobby', 'reveal', 'ended'].includes(room.phase)

  return (
    <Screen>
      <header className="flex items-center justify-between pt-4">
        <h1 className="text-xl font-bold">阿瓦隆 · {room.code}</h1>
        <button type="button" onClick={onLeave} className="text-sm text-slate-400">
          退出
        </button>
      </header>

      {inGame && <Board room={room} />}

      {room.phase === 'lobby' && <Lobby room={room} isHost={isHost} />}
      {room.phase === 'reveal' && <Night room={room} uid={uid} secret={secret} isHost={isHost} />}
      {room.phase === 'team' && <TeamPhase room={room} uid={uid} isLeader={isLeader} />}
      {room.phase === 'vote' && <VotePhase room={room} uid={uid} isHost={isHost} />}
      {room.phase === 'voteResult' && <VoteResultPhase room={room} isHost={isHost} />}
      {room.phase === 'mission' && (
        <MissionPhase room={room} uid={uid} secret={secret} isHost={isHost} />
      )}
      {room.phase === 'missionResult' && <MissionResultPhase room={room} isHost={isHost} />}
      {room.phase === 'assassin' && <AssassinPhase room={room} uid={uid} secret={secret} />}
      {room.phase === 'ended' && <Ended room={room} isHost={isHost} />}
    </Screen>
  )
}
