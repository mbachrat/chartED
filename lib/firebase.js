// Lazy client-only Firebase initializer to avoid importing Firebase on the server.
let _app = null
let _auth = null
let _db = null
let _storage = null
let _initialized = false

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export async function initFirebase() {
  if (typeof window === 'undefined') return
  if (_initialized) return
  const { initializeApp, getApps, getApp } = await import('firebase/app')
  const { getAuth } = await import('firebase/auth')
  const { getFirestore } = await import('firebase/firestore')
  const { getStorage } = await import('firebase/storage')

  _app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  _auth = getAuth(_app)
  _db = getFirestore(_app)
  _storage = getStorage(_app)
  _initialized = true
}

export async function getAuthClient() {
  if (!_initialized) await initFirebase()
  return _auth
}

export async function getDbClient() {
  if (!_initialized) await initFirebase()
  return _db
}

export async function getStorageClient() {
  if (!_initialized) await initFirebase()
  return _storage
}

export default null
