import { MAX_ATTEMPTS, ROUNDS } from '../game/rules'
import { failsRequired, missionSize } from '../game/setup'
import { playerName, leaderUid, type Room } from '../room/model'
import { Card, Hint } from './kit'

export function Board({ room }: { room: Room }) {
  const count = room.players.length
  return (
    <Card title={`第 ${room.round + 1} 轮 · 队长 ${playerName(room, leaderUid(room))}`}>
      <div className="flex justify-between gap-1">
        {Array.from({ length: ROUNDS }, (_, round) => {
          const mission = room.missions[round]
          const done = mission !== undefined
          const twoFails = failsRequired(count, round) === 2
          return (
            <div
              key={round}
              className={`flex-1 rounded-xl py-2 text-center ${
                done
                  ? mission.success
                    ? 'bg-sky-600/80'
                    : 'bg-rose-700/80'
                  : round === room.round
                    ? 'bg-slate-700 ring-2 ring-indigo-400'
                    : 'bg-slate-900'
              }`}
            >
              <div className="text-lg font-semibold">{missionSize(count, round)}</div>
              <div className="text-[10px] text-slate-300">{twoFails ? '需两败' : '\u00a0'}</div>
            </div>
          )
        })}
      </div>
      <Hint>
        第 {room.attempt} / {MAX_ATTEMPTS} 次组队
        {room.attempt === MAX_ATTEMPTS && '，再被否决坏人直接获胜'}
      </Hint>
    </Card>
  )
}
