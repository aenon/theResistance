import { useHashCode, useUid } from './room/hooks'
import { Home } from './ui/Home'
import { RoomView } from './ui/RoomView'
import { Hint, Screen } from './ui/kit'

export default function App() {
  const uid = useUid()
  const [code, setCode] = useHashCode()

  if (code && uid) return <RoomView code={code} uid={uid} onLeave={() => setCode(null)} />
  if (code && !uid)
    return (
      <Screen>
        <Hint>连接中……</Hint>
      </Screen>
    )
  return <Home uid={uid} onEnter={setCode} />
}
