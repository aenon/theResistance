import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db, signIn } from '../firebase'
import type { PrivateRole, Room } from './model'
import { roomRef } from './api'

export function useUid(): string | null {
  const [uid, setUid] = useState<string | null>(null)
  useEffect(() => {
    signIn().then(setUid)
  }, [])
  return uid
}

export function useRoom(code: string | null): { room: Room | null; missing: boolean } {
  const [room, setRoom] = useState<Room | null>(null)
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    if (!code) return
    return onSnapshot(roomRef(code), (snap) => {
      setMissing(!snap.exists())
      setRoom(snap.exists() ? (snap.data() as Room) : null)
    })
  }, [code])
  return { room, missing }
}

export function usePrivateRole(code: string | null, uid: string | null): PrivateRole | null {
  const [secret, setSecret] = useState<PrivateRole | null>(null)
  useEffect(() => {
    if (!code || !uid) return
    return onSnapshot(
      doc(db, 'rooms', code, 'private', uid),
      (snap) => setSecret(snap.exists() ? (snap.data() as PrivateRole) : null),
      () => setSecret(null),
    )
  }, [code, uid])
  return secret
}

/** Keeps the room code in the URL so the host can just share the link. */
export function useHashCode(): [string | null, (code: string | null) => void] {
  const read = () => {
    const match = window.location.hash.match(/^#\/r\/([A-Z0-9]{4})$/i)
    return match ? match[1].toUpperCase() : null
  }
  const [code, setCode] = useState<string | null>(read)
  useEffect(() => {
    const onChange = () => setCode(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return [
    code,
    (next) => {
      window.location.hash = next ? `#/r/${next}` : ''
      setCode(next)
    },
  ]
}
