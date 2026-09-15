import { useEffect, useState } from 'react'
import { isEvil } from '../game/roles'
import { tallyVotes } from '../game/rules'
import { missionSize } from '../game/setup'
import {
  applyVoteResult,
  castVote,
  continueAfterMission,
  proposeTeam,
  readVotes,
  revealMission,
  revealVotes,
  submitMissionAction,
} from '../room/api'
import { leaderUid, playerName, type PrivateRole, type Room } from '../room/model'
import { Button, Card, Chip, Hint } from './kit'

export function TeamPhase({ room, uid, isLeader }: { room: Room; uid: string; isLeader: boolean }) {
  const size = missionSize(room.players.length, room.round)
  const [picked, setPicked] = useState<string[]>([])

  if (!isLeader) {
    return (
      <Card title="等待队长组队">
        <Hint>
          {playerName(room, leaderUid(room))} 正在挑选 {size} 个人执行任务。
        </Hint>
      </Card>
    )
  }

  const toggle = (target: string) =>
    setPicked((current) =>
      current.includes(target)
        ? current.filter((id) => id !== target)
        : current.length < size
          ? [...current, target]
          : current,
    )

  return (
    <>
      <Card title={`挑选 ${size} 个人上车`}>
        <div className="flex flex-wrap gap-2">
          {room.players.map((player) => (
            <Chip key={player.uid} selected={picked.includes(player.uid)} onClick={() => toggle(player.uid)}>
              {player.name}
              {player.uid === uid && '（你）'}
            </Chip>
          ))}
        </div>
      </Card>
      <Button disabled={picked.length !== size} onClick={() => void proposeTeam(room.code, picked)}>
        提交给大家投票
      </Button>
    </>
  )
}

export function VotePhase({ room, uid, isHost }: { room: Room; uid: string; isHost: boolean }) {
  const voted = room.votedUids.includes(uid)
  const everyoneVoted = room.votedUids.length === room.players.length

  return (
    <>
      <Card title="本次队伍">
        <div className="flex flex-wrap gap-2">
          {room.team.map((id) => (
            <span key={id} className="rounded-full bg-slate-900 px-3 py-1.5 text-sm">
              {playerName(room, id)}
            </span>
          ))}
        </div>
      </Card>

      {voted ? (
        <Hint>
          已投票 {room.votedUids.length} / {room.players.length} 人，投票内容在揭晓前谁都看不到。
        </Hint>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button tone="success" onClick={() => void castVote(room, uid, true)}>
            赞成
          </Button>
          <Button tone="danger" onClick={() => void castVote(room, uid, false)}>
            反对
          </Button>
        </div>
      )}

      {isHost && (
        <Button disabled={!everyoneVoted} onClick={() => void revealVotes(room.code)}>
          揭晓投票
        </Button>
      )}
    </>
  )
}

export function VoteResultPhase({ room, isHost }: { room: Room; isHost: boolean }) {
  const { code, round, attempt } = room
  const [votes, setVotes] = useState<Record<string, boolean> | null>(null)
  useEffect(() => {
    readVotes(code, round, attempt).then(setVotes)
  }, [code, round, attempt])

  if (!votes) return <Hint>正在读取投票……</Hint>
  const { approve, reject, approved } = tallyVotes(votes)

  return (
    <>
      <Card title={approved ? `通过 ${approve} : ${reject}` : `否决 ${approve} : ${reject}`}>
        <ul className="space-y-1">
          {room.players.map((player) => (
            <li key={player.uid} className="flex justify-between rounded-lg bg-slate-900/60 px-3 py-2">
              <span>{player.name}</span>
              <span className={votes[player.uid] ? 'text-emerald-400' : 'text-rose-400'}>
                {votes[player.uid] ? '赞成' : '反对'}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      {isHost && (
        <Button onClick={() => void applyVoteResult(room, approved)}>
          {approved ? '开始执行任务' : '换下一位队长'}
        </Button>
      )}
    </>
  )
}

export function MissionPhase({
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
  const onTeam = room.team.includes(uid)
  const submitted = room.missionSubmitted.includes(uid)
  const allIn = room.missionSubmitted.length === room.team.length
  const canFail = secret ? isEvil(secret.role) : false

  return (
    <>
      <Card title="任务执行中">
        <Hint>
          上车的是 {room.team.map((id) => playerName(room, id)).join('、')}。失败票是匿名统计的，只会公布张数。
        </Hint>
      </Card>

      {onTeam && !submitted && (
        <div className="grid grid-cols-2 gap-3">
          <Button tone="success" onClick={() => void submitMissionAction(room.code, uid, false)}>
            任务成功
          </Button>
          <Button
            tone="danger"
            disabled={!canFail}
            onClick={() => void submitMissionAction(room.code, uid, true)}
          >
            {canFail ? '任务失败' : '好人不能出失败'}
          </Button>
        </div>
      )}

      {(submitted || !onTeam) && (
        <Hint>
          已出牌 {room.missionSubmitted.length} / {room.team.length} 人。
        </Hint>
      )}

      {isHost && (
        <Button disabled={!allIn} onClick={() => void revealMission(room)}>
          公布任务结果
        </Button>
      )}
    </>
  )
}

export function MissionResultPhase({ room, isHost }: { room: Room; isHost: boolean }) {
  const mission = room.missions[room.missions.length - 1]
  if (!mission) return null
  return (
    <>
      <Card title={mission.success ? '任务成功' : '任务失败'}>
        <p className={`text-3xl font-bold ${mission.success ? 'text-sky-300' : 'text-rose-400'}`}>
          {mission.fails} 张失败票
        </p>
      </Card>
      {isHost && <Button onClick={() => void continueAfterMission(room)}>继续</Button>}
    </>
  )
}
