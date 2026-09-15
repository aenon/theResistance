import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true'

const config = useEmulator
  ? { projectId: 'demo-avalon', apiKey: 'demo-key', authDomain: 'localhost' }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }

const app = initializeApp(config)

export const auth = getAuth(app)
export const db = getFirestore(app)

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

/** Every player is an anonymous Firebase user; the uid is their identity at the table. */
export function signIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, (user) => {
      if (user) {
        stop()
        resolve(user.uid)
      }
    })
    signInAnonymously(auth).catch(reject)
  })
}
