import { useState } from 'react'
import { createRoom, joinRoom } from '../room/api'
import { Button, Card, Hint, Screen } from './kit'

export function Home({ uid, onEnter }: { uid: string | null; onEnter: (code: string) => void }) {
  const [name, setName] = useState(() => localStorage.getItem('avalon.name') ?? '')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (action: () => Promise<string>) => {
    if (!name.trim()) {
      setError('先填个名字吧')
      return
    }
    setBusy(true)
    setError(null)
    try {
      localStorage.setItem('avalon.name', name.trim())
      onEnter(await action())
    } catch (e) {
      setError(e instanceof Error ? e.message : '出错了，请重试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <header className="pt-8 pb-2">
        <h1 className="text-3xl font-bold">阿瓦隆</h1>
        <Hint>每人一台手机，自动发牌、私密投票、匿名任务。</Hint>
      </header>

      <Card title="你的名字">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={12}
          placeholder="在桌上叫什么"
          className="w-full rounded-xl bg-slate-900 px-4 py-3 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
        />
      </Card>

      <Card title="开新房间">
        <Button onClick={() => run(() => createRoom(uid!, name.trim()))} disabled={!uid || busy}>
          创建房间
        </Button>
      </Card>

      <Card title="加入房间">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={4}
          placeholder="4 位房间号"
          className="mb-3 w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
        />
        <Button
          tone="ghost"
          disabled={!uid || busy || code.length !== 4}
          onClick={() =>
            run(async () => {
              await joinRoom(code, uid!, name.trim())
              return code
            })
          }
        >
          加入
        </Button>
      </Card>

      {error && <p className="text-center text-sm text-rose-400">{error}</p>}
    </Screen>
  )
}
