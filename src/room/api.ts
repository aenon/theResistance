import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { nightHint } from '../game/knowledge'
import { missionSucceeded, nextLeaderIndex, winnerFromMissions, MAX_ATTEMPTS } from '../game/rules'
import { assignRoles, missionSize } from '../game/setup'
import type { Role } from '../game/types'
import { voteId, type PrivateRole, type Room, type VoteDoc } from './model'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomCode(): string {
  return Array.from(
    { length: 4 },
    () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
  ).join('')
}

export const roomRef = (code: string) => doc(db, 'rooms', code)
const privateRef = (code: string, uid: string) => doc(db, 'rooms', code, 'private', uid)
const voteRef = (code: string, round: number, attempt: number, uid: string) =>
  doc(db, 'rooms', code, 'votes', voteId(round, attempt, uid))

export async function createRoom(uid: string, name: string): Promise<string> {
  for (let tries = 0; tries < 10; tries++) {
    const code = randomCode()
    if ((await getDoc(roomRef(code))).exists()) continue
    const room: Room & { createdAt: unknown } = {
      code,
      hostUid: uid,
      phase: 'lobby',
      players: [{ uid, name }],
      playerUids: [uid],
      optionalRoles: ['merlin', 'assassin'],
      round: 0,
      attempt: 1,
      leaderIndex: 0,
      team: [],
      votedUids: [],
      readyUids: [],
      missionSubmitted: [],
      missionFails: 0,
      missions: [],
      assassinTarget: null,
      winner: null,
      reveal: {},
      createdAt: serverTimestamp(),
    }
    await setDoc(roomRef(code), room)
    return code
  }
  throw new Error('房间号生成失败，请重试')
}

export async function joinRoom(code: string, uid: string, name: string): Promise<void> {
  const snap = await getDoc(roomRef(code))
  if (!snap.exists()) throw new Error('房间不存在')
  const room = snap.data() as Room
  if (room.playerUids.includes(uid)) return
  if (room.phase !== 'lobby') throw new Error('游戏已经开始了')
  await updateDoc(roomRef(code), {
    players: arrayUnion({ uid, name }),
    playerUids: arrayUnion(uid),
  })
}

export async function setOptionalRoles(code: string, roles: Role[]): Promise<void> {
  await updateDoc(roomRef(code), { optionalRoles: roles })
}

/** Deals the deck and writes each secret into a document only its owner can read. */
export async function startGame(room: Room): Promise<void> {
  const assignments = assignRoles(room.playerUids, room.optionalRoles)
  await Promise.all(
    room.players.map((player) => {
      const secret: PrivateRole = {
        role: assignments[player.uid],
        hint: nightHint(player.uid, assignments, room.players),
      }
      return setDoc(privateRef(room.code, player.uid), secret)
    }),
  )
  await updateDoc(roomRef(room.code), {
    phase: 'reveal',
    readyUids: [],
    leaderIndex: Math.floor(Math.random() * room.players.length),
  })
}

export async function markReady(code: string, uid: string): Promise<void> {
  await updateDoc(roomRef(code), { readyUids: arrayUnion(uid) })
}

export async function startFirstRound(code: string): Promise<void> {
  await updateDoc(roomRef(code), { phase: 'team', round: 0, attempt: 1 })
}

export async function proposeTeam(code: string, team: string[]): Promise<void> {
  await updateDoc(roomRef(code), { phase: 'vote', team, votedUids: [] })
}

export async function castVote(room: Room, uid: string, approve: boolean): Promise<void> {
  const vote: VoteDoc = { uid, approve, round: room.round, attempt: room.attempt }
  await setDoc(voteRef(room.code, room.round, room.attempt, uid), vote)
  await updateDoc(roomRef(room.code), { votedUids: arrayUnion(uid) })
}

export async function revealVotes(code: string): Promise<void> {
  await updateDoc(roomRef(code), { phase: 'voteResult' })
}

/** Votes stay unreadable until the room leaves the `vote` phase. */
export async function readVotes(
  code: string,
  round: number,
  attempt: number,
): Promise<Record<string, boolean>> {
  const snap = await getDocs(collection(db, 'rooms', code, 'votes'))
  const votes: Record<string, boolean> = {}
  for (const docSnap of snap.docs) {
    const vote = docSnap.data() as VoteDoc
    if (vote.round === round && vote.attempt === attempt) votes[vote.uid] = vote.approve
  }
  return votes
}

export async function applyVoteResult(room: Room, approved: boolean): Promise<void> {
  if (approved) {
    await updateDoc(roomRef(room.code), {
      phase: 'mission',
      missionSubmitted: [],
      missionFails: 0,
    })
    return
  }
  if (room.attempt >= MAX_ATTEMPTS) {
    await updateDoc(roomRef(room.code), { phase: 'ended', winner: 'evil' })
    return
  }
  await updateDoc(roomRef(room.code), {
    phase: 'team',
    attempt: room.attempt + 1,
    leaderIndex: nextLeaderIndex(room.leaderIndex, room.players.length),
    team: [],
  })
}

/** Fails are counted with an atomic increment so that nobody can tell who played what. */
export async function submitMissionAction(code: string, uid: string, fail: boolean): Promise<void> {
  await updateDoc(roomRef(code), {
    missionSubmitted: arrayUnion(uid),
    missionFails: increment(fail ? 1 : 0),
  })
}

export async function revealMission(room: Room): Promise<void> {
  const success = missionSucceeded(room.players.length, room.round, room.missionFails)
  await updateDoc(roomRef(room.code), {
    phase: 'missionResult',
    missions: arrayUnion({
      teamSize: missionSize(room.players.length, room.round),
      fails: room.missionFails,
      success,
    }),
  })
}

export async function continueAfterMission(room: Room): Promise<void> {
  const winner = winnerFromMissions(room.missions)
  if (winner === 'evil') {
    await updateDoc(roomRef(room.code), { phase: 'ended', winner: 'evil' })
    return
  }
  if (winner === 'good') {
    const hasAssassin = room.optionalRoles.includes('assassin')
    await updateDoc(roomRef(room.code), {
      phase: hasAssassin ? 'assassin' : 'ended',
      winner: hasAssassin ? null : 'good',
    })
    return
  }
  await updateDoc(roomRef(room.code), {
    phase: 'team',
    round: room.round + 1,
    attempt: 1,
    leaderIndex: nextLeaderIndex(room.leaderIndex, room.players.length),
    team: [],
  })
}

export async function assassinate(code: string, targetUid: string): Promise<void> {
  await updateDoc(roomRef(code), { assassinTarget: targetUid })
}

/**
 * Nobody but Merlin knows who Merlin is, so Merlin's own client settles the
 * assassination.
 */
export async function resolveAssassination(code: string, hit: boolean): Promise<void> {
  await updateDoc(roomRef(code), { phase: 'ended', winner: hit ? 'evil' : 'good' })
}

/** Keeps the table and the settings, deals a fresh game. */
export async function playAgain(code: string): Promise<void> {
  await updateDoc(roomRef(code), {
    phase: 'lobby',
    round: 0,
    attempt: 1,
    team: [],
    votedUids: [],
    readyUids: [],
    missionSubmitted: [],
    missionFails: 0,
    missions: [],
    assassinTarget: null,
    winner: null,
    reveal: {},
  })
}

/** At the end every client publishes its own role, which is how the recap is built. */
export async function publishRole(code: string, uid: string, role: Role): Promise<void> {
  await updateDoc(roomRef(code), { [`reveal.${uid}`]: role })
}
